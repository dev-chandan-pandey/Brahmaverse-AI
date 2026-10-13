
import "dotenv/config";

import assert from "node:assert/strict";
import dns from "node:dns";
import mongoose from "mongoose";
import { before, after, describe, it } from "node:test";
import request from "supertest";

import app from "../src/app.js";
import Employee from "../src/models/Employee.js";
import Enquiry from "../src/models/Enquiry.js";

// Work around the DNS resolver issue in this environment.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let counselorA;
let counselorB;
let tokenA;
let tokenB;
let enquiryId;

before(async () => {
  const uri = process.env.TEST_MONGODB_URI;

  if (!uri) {
    throw new Error(
      "TEST_MONGODB_URI is required. Configure a dedicated test database."
    );
  }

  if (uri === process.env.MONGODB_URI) {
    throw new Error(
      "Refusing to run tests against the configured application database."
    );
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  const databaseName = mongoose.connection.name;

  if (!/test/i.test(databaseName)) {
    await mongoose.disconnect();

    throw new Error(
      `Refusing to test against database "${databaseName}". ` +
        "Use a dedicated database whose name contains 'test'."
    );
  }

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not ready.");
  }

  // Clear only the two collections used by these tests.
  // This avoids requiring the Atlas dropDatabase privilege.
  await Promise.all([
    Employee.deleteMany({}),
    Enquiry.deleteMany({}),
  ]);

  // Ensure required indexes exist before testing.
  await Promise.all([
    Employee.init(),
    Enquiry.init(),
  ]);
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

async function registerCounselor(name, email) {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({
      name,
      email,
      password: "StrongPass123!",
    });

  assert.equal(response.status, 201, JSON.stringify(response.body));
  assert.ok(response.body.data.token);
  assert.ok(response.body.data.employee.id);
  assert.equal("password" in response.body.data.employee, false);

  return {
    employee: response.body.data.employee,
    token: response.body.data.token,
  };
}

async function submitEnquiry(email = "student@example.com") {
  return request(app)
    .post("/api/v1/enquiries")
    .send({
      name: "Test Student",
      email,
      courseInterest: "Full Stack Development",
      message: "Interested in joining",
    });
}

describe("CRM Lead Management API", () => {
  it("registers counselors and rejects duplicate email addresses", async () => {
    counselorA = await registerCounselor(
      "Counselor A",
      "counselor-a@example.com"
    );

    tokenA = counselorA.token;

    const duplicate = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Duplicate Counselor",
        email: "COUNSELOR-A@example.com",
        password: "StrongPass123!",
      });

    assert.equal(duplicate.status, 409);
  });

  it("logs in and rejects incorrect credentials", async () => {
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "counselor-a@example.com",
        password: "StrongPass123!",
      });

    assert.equal(login.status, 200, JSON.stringify(login.body));
    assert.ok(login.body.data.token);

    const invalidLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "counselor-a@example.com",
        password: "WrongPassword123!",
      });

    assert.equal(invalidLogin.status, 401);
  });

  it("rejects protected requests without a valid JWT", async () => {
    const missingToken = await request(app)
      .get("/api/v1/enquiries/public");

    assert.equal(missingToken.status, 401);

    const invalidToken = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");

    assert.equal(invalidToken.status, 401);
  });

  it("accepts a public enquiry without authentication", async () => {
    const response = await submitEnquiry();

    assert.equal(response.status, 201, JSON.stringify(response.body));

    enquiryId = response.body.data.enquiry._id;

    assert.ok(enquiryId);
    assert.equal(response.body.data.enquiry.claimedBy, null);
  });

  it("rejects attempts to inject ownership into public submissions", async () => {
    const response = await request(app)
      .post("/api/v1/enquiries")
      .send({
        name: "Malicious Student",
        email: "malicious@example.com",
        courseInterest: "Computer Science",
        claimedBy: counselorA.employee.id,
      });

    assert.equal(response.status, 400);
  });

  it("lists public leads only to authenticated counselors", async () => {
    const response = await request(app)
      .get("/api/v1/enquiries/public")
      .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(response.status, 200);

    assert.ok(
      response.body.data.enquiries.some(
        (enquiry) => enquiry._id === enquiryId
      )
    );
  });

  it("allows only one counselor to claim a lead", async () => {
    counselorB = await registerCounselor(
      "Counselor B",
      "counselor-b@example.com"
    );

    tokenB = counselorB.token;

    const [claimA, claimB] = await Promise.all([
      request(app)
        .patch(`/api/v1/enquiries/${enquiryId}/claim`)
        .set("Authorization", `Bearer ${tokenA}`),

      request(app)
        .patch(`/api/v1/enquiries/${enquiryId}/claim`)
        .set("Authorization", `Bearer ${tokenB}`),
    ]);

    assert.deepEqual(
      [claimA.status, claimB.status].sort(),
      [200, 409],
      JSON.stringify({
        counselorA: { status: claimA.status, body: claimA.body },
        counselorB: { status: claimB.status, body: claimB.body },
      })
    );

    const storedEnquiry = await Enquiry.findById(enquiryId);

    assert.ok(storedEnquiry);
    assert.ok(storedEnquiry.claimedBy);

    const winningToken = claimA.status === 200 ? tokenA : tokenB;
    const winningCounselor =
      claimA.status === 200 ? counselorA : counselorB;

    const winnerLeads = await request(app)
      .get("/api/v1/enquiries/mine")
      .set("Authorization", `Bearer ${winningToken}`);

    assert.equal(winnerLeads.status, 200);

    assert.ok(
      winnerLeads.body.data.enquiries.some(
        (enquiry) => enquiry._id === enquiryId
      )
    );

    assert.equal(
      storedEnquiry.claimedBy.toString(),
      winningCounselor.employee.id
    );
  });

  it("does not expose another counselor's claimed leads", async () => {
    const owner = await Enquiry.findById(enquiryId);

    assert.ok(owner);
    assert.ok(owner.claimedBy);

    const nonOwnerToken =
      owner.claimedBy.toString() === counselorA.employee.id
        ? tokenB
        : tokenA;

    const response = await request(app)
      .get("/api/v1/enquiries/mine")
      .set("Authorization", `Bearer ${nonOwnerToken}`);

    assert.equal(response.status, 200);

    assert.equal(
      response.body.data.enquiries.some(
        (enquiry) => enquiry._id === enquiryId
      ),
      false
    );
  });

  it("does not list claimed leads in the public pool", async () => {
    const response = await request(app)
      .get("/api/v1/enquiries/public")
      .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(response.status, 200);

    assert.equal(
      response.body.data.enquiries.some(
        (enquiry) => enquiry._id === enquiryId
      ),
      false
    );
  });
});

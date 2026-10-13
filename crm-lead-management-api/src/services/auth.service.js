import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Employee from "../models/Employee.js";
import ApiError from "../utils/ApiError.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }

  return secret;
}

function createToken(employeeId) {
  return jwt.sign(
    { sub: employeeId.toString() },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      algorithm: "HS256",
    }
  );
}

function employeeResponse(employee) {
  return {
    id: employee._id.toString(),
    name: employee.name,
    email: employee.email,
    createdAt: employee.createdAt,
  };
}

export async function registerEmployee({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingEmployee = await Employee.findOne({
    email: normalizedEmail,
  });

  if (existingEmployee) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const employee = await Employee.create({
      name,
      email: normalizedEmail,
      password: passwordHash,
    });

    return {
      employee: employeeResponse(employee),
      token: createToken(employee._id),
    };
  } catch (error) {
    // Protect against two simultaneous registrations with the same email.
    if (error.code === 11000) {
      throw new ApiError(409, "An account with this email already exists");
    }

    throw error;
  }
}

export async function loginEmployee({ email, password }) {
  const employee = await Employee.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  // Use the same error for an unknown email and an incorrect password.
  if (!employee) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    employee.password
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    employee: employeeResponse(employee),
    token: createToken(employee._id),
  };
}
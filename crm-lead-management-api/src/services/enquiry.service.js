import mongoose from "mongoose";

import Enquiry from "../models/Enquiry.js";
import ApiError from "../utils/ApiError.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function paginationOptions(query = {}) {
  const page = Number(query.page) || 1;
  const limit = Math.min(
    Number(query.limit) || DEFAULT_LIMIT,
    MAX_LIMIT
  );

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    page < 1 ||
    limit < 1
  ) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  return { page, limit, skip: (page - 1) * limit };
}

function paginationResponse(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createEnquiry(data) {
  return Enquiry.create({
    name: data.name,
    email: data.email.trim().toLowerCase(),
    phone: data.phone || "",
    courseInterest: data.courseInterest,
    message: data.message || "",
  });
}

export async function getPublicEnquiries(query) {
  const { page, limit, skip } = paginationOptions(query);

  const filter = { claimedBy: null };

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Enquiry.countDocuments(filter),
  ]);

  return {
    enquiries,
    pagination: paginationResponse(page, limit, total),
  };
}

export async function claimEnquiry(enquiryId, employeeId) {
  if (!mongoose.isValidObjectId(enquiryId)) {
    throw new ApiError(400, "Invalid enquiry ID");
  }

  const enquiry = await Enquiry.findOneAndUpdate(
    {
      _id: enquiryId,
      claimedBy: null,
    },
    {
      $set: {
        claimedBy: employeeId,
        claimedAt: new Date(),
      },
    },
    // {
    //   new: true,
    //   runValidators: true,
    // }
    {
  returnDocument: "after",
  runValidators: true,
}
  );

  if (enquiry) {
    return enquiry;
  }

  const exists = await Enquiry.exists({ _id: enquiryId });

  if (!exists) {
    throw new ApiError(404, "Enquiry not found");
  }

  throw new ApiError(
    409,
    "This enquiry has already been claimed"
  );
}

export async function getMyEnquiries(employeeId, query) {
  const { page, limit, skip } = paginationOptions(query);

  const filter = { claimedBy: employeeId };

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .sort({ claimedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Enquiry.countDocuments(filter),
  ]);

  return {
    enquiries,
    pagination: paginationResponse(page, limit, total),
  };
}
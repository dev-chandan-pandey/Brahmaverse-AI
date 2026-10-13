import { z } from "zod";

import {
  createEnquiry,
  getPublicEnquiries,
  claimEnquiry,
  getMyEnquiries,
} from "../services/enquiry.service.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(20).optional(),
  courseInterest: z.string().trim().min(2).max(150),
  message: z.string().trim().max(2000).optional(),
}).strict();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function parsePagination(query) {
  const result = paginationSchema.safeParse(query);

  if (!result.success) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  return result.data;
}

export const submitEnquiry = asyncHandler(async (req, res) => {
  const result = enquirySchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues.map((issue) => issue.message).join("; ")
    );
  }

  const enquiry = await createEnquiry(result.data);

  res.status(201).json({
    success: true,
    message: "Enquiry submitted successfully",
    data: { enquiry },
  });
});

export const listPublicEnquiries = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);

  const result = await getPublicEnquiries(pagination);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const claimLead = asyncHandler(async (req, res) => {
  const enquiry = await claimEnquiry(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Enquiry claimed successfully",
    data: { enquiry },
  });
});

export const listMyEnquiries = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);

  const result = await getMyEnquiries(
    req.user._id,
    pagination
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});
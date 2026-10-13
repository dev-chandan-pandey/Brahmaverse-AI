import { z } from "zod";

import {
  registerEmployee,
  loginEmployee,
} from "../services/auth.service.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

export const register = asyncHandler(async (req, res) => {
  const result = await registerEmployee(req.body);

  res.status(201).json({
    success: true,
    message: "Employee registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginEmployee(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  res.status(200).json({
    success: true,
    data: {
      employee: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    },
  });
});
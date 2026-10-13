import jwt from "jsonwebtoken";

import Employee from "../models/Employee.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }

  return secret;
}

export const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token required");
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    throw new ApiError(401, "Authentication token required");
  }

  let payload;

  try {
    payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
  } catch {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string"
  ) {
    throw new ApiError(401, "Invalid authentication token");
  }

  const employee = await Employee.findById(payload.sub);

  if (!employee) {
    throw new ApiError(401, "Employee account no longer exists");
  }

  req.user = employee;

  next();
});
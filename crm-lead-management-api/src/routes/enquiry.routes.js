import { Router } from "express";

import {
  submitEnquiry,
  listPublicEnquiries,
  claimLead,
  listMyEnquiries,
} from "../controllers/enquiry.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public form: no JWT required.
router.post("/", submitEnquiry);

// CRM operations: JWT required.
router.get("/public", authenticate, listPublicEnquiries);
router.get("/mine", authenticate, listMyEnquiries);
router.patch("/:id/claim", authenticate, claimLead);

export default router;
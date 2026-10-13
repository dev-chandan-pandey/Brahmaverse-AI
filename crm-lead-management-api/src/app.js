import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM Lead Management API is running",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});
// Register API routers BEFORE the 404 handler.
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
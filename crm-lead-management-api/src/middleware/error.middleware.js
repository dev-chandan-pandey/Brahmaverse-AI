export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// export function errorHandler(err, req, res, next) {
//   if (res.headersSent) {
//     return next(err);
//   }

//   const statusCode =
//     Number.isInteger(err.statusCode) &&
//     err.statusCode >= 400 &&
//     err.statusCode <= 599
//       ? err.statusCode
//       : 500;

//   if (statusCode >= 500) {
//     console.error(err);
//   }

//   res.status(statusCode).json({
//     success: false,
//     message:
//       statusCode === 500
//         ? "Internal server error"
//         : err.message || "Request failed",
//   });
// }

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Request failed";

  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    statusCode = 500;
  }

  if (statusCode >= 500) {
    console.error(err);
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
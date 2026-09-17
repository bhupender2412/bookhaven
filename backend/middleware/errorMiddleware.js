const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  res.status(404);

  next(error);
};

const errorHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  let message =
    err.message ||
    "Internal server error";

  if (
    err.name === "CastError" &&
    err.kind === "ObjectId"
  ) {
    statusCode = 404;
    message = "Resource not found";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV ===
      "development" && {
      stack: err.stack,
    }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
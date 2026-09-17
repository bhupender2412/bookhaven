const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Book Store API is running",
    environment:
      process.env.NODE_ENV ||
      "development",
    timestamp:
      new Date().toISOString(),
  });
});

module.exports = router;
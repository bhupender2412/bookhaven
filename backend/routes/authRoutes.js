const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  validateBody,
} = require("../middleware/validateMiddleware");

const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidators");

const router = express.Router();

router.post(
  "/register",
  validateBody(registerSchema),
  registerUser
);

router.post(
  "/login",
  validateBody(loginSchema),
  loginUser
);

router.get(
  "/me",
  protect,
  getCurrentUser
);

module.exports = router;
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const protect = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user =
      await User.findById(
        decoded.id
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User account no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Invalid authentication token",
    });
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access this resource",
      });
    }

    next();
  };

module.exports = {
  protect,
  authorize,
};
const User = require("../models/User");

const generateToken =
  require("../utils/generateToken");

const userResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

const registerUser = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const user =
      await User.create({
        name,
        email,
        password,
        phone,
      });

    const token =
      generateToken(user._id);

    res.status(201).json({
      success: true,
      message:
        "Account created successfully",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    const passwordMatches =
      await user.comparePassword(
        password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token =
      generateToken(user._id);

    res.status(200).json({
      success: true,
      message:
        "Login successful",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (
  req,
  res
) => {
  res.status(200).json({
    success: true,
    user: userResponse(
      req.user
    ),
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
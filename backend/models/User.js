const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre(
  "save",
  async function () {
    if (!this.isModified("password")) {
      return;
    }

    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );
  }
);

userSchema.methods.comparePassword =
  async function (candidatePassword) {
    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;
const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) =>
      value.toLowerCase()
    ),

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters"
    ),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .optional()
    .default(""),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) =>
      value.toLowerCase()
    ),

  password: z
    .string()
    .min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
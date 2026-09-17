const { z } = require("zod");

const shippingAddressSchema =
  z.object({
    fullName: z
      .string()
      .trim()
      .min(
        2,
        "Full name is required"
      )
      .max(100),

    phone: z
      .string()
      .trim()
      .min(
        8,
        "Enter a valid phone number"
      )
      .max(20),

    addressLine1: z
      .string()
      .trim()
      .min(
        5,
        "Address is required"
      )
      .max(200),

    addressLine2: z
      .string()
      .trim()
      .max(200)
      .optional()
      .default(""),

    city: z
      .string()
      .trim()
      .min(
        2,
        "City is required"
      )
      .max(100),

    state: z
      .string()
      .trim()
      .min(
        2,
        "State is required"
      )
      .max(100),

    postalCode: z
      .string()
      .trim()
      .min(
        3,
        "Postal code is required"
      )
      .max(20),

    country: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional()
      .default("India"),
  });

const createOrderSchema =
  z.object({
    shippingAddress:
      shippingAddressSchema,

    paymentMethod: z
      .enum(["cod"])
      .optional()
      .default("cod"),
  });

const updateOrderStatusSchema =
  z.object({
    orderStatus:
      z.enum([
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ]),
  });

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
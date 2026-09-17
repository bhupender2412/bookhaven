const { z } = require("zod");

const addCartItemSchema =
  z.object({
    bookId: z
      .string()
      .trim()
      .min(
        1,
        "Book ID is required"
      ),

    quantity: z.coerce
      .number()
      .int()
      .min(
        1,
        "Quantity must be at least 1"
      )
      .max(
        10,
        "Maximum quantity is 10"
      )
      .optional()
      .default(1),
  });

const updateCartItemSchema =
  z.object({
    quantity: z.coerce
      .number()
      .int()
      .min(
        1,
        "Quantity must be at least 1"
      )
      .max(
        10,
        "Maximum quantity is 10"
      ),
  });

module.exports = {
  addCartItemSchema,
  updateCartItemSchema,
};
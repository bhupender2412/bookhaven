const { z } =
  require("zod");

const createCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Category name must be at least 2 characters"
      )
      .max(
        60,
        "Category name is too long"
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description is too long"
      )
      .optional()
      .default(""),

    image: z
      .string()
      .trim()
      .optional()
      .default(""),
  });

const updateCategorySchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Category name must be at least 2 characters"
        )
        .max(
          60,
          "Category name is too long"
        )
        .optional(),

      description: z
        .string()
        .trim()
        .max(
          500,
          "Description is too long"
        )
        .optional(),

      image: z
        .string()
        .trim()
        .optional(),

      isActive:
        z.boolean().optional(),
    })
    .refine(
      (data) =>
        Object.keys(data).length >
        0,
      {
        message:
          "Provide at least one field to update",
      }
    );

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
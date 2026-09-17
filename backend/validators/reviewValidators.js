const {
  z,
} = require("zod");

const createReviewSchema =
  z.object({
    rating: z.coerce
      .number()
      .int()
      .min(
        1,
        "Rating must be at least 1"
      )
      .max(
        5,
        "Rating cannot be greater than 5"
      ),

    comment: z
      .string()
      .trim()
      .min(
        3,
        "Review comment must be at least 3 characters"
      )
      .max(
        1000,
        "Review comment cannot exceed 1000 characters"
      ),
  });

const updateReviewSchema =
  z.object({
    rating: z.coerce
      .number()
      .int()
      .min(
        1,
        "Rating must be at least 1"
      )
      .max(
        5,
        "Rating cannot be greater than 5"
      )
      .optional(),

    comment: z
      .string()
      .trim()
      .min(
        3,
        "Review comment must be at least 3 characters"
      )
      .max(
        1000,
        "Review comment cannot exceed 1000 characters"
      )
      .optional(),
  })
    .refine(
      (data) =>
        data.rating !==
          undefined ||
        data.comment !==
          undefined,
      {
        message:
          "Provide at least one field to update",
      }
    );

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
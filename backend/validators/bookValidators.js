const { z } = require("zod");

const normalizeISBN = (value) => {
  return value
    .replace(/[-\s]/g, "")
    .toUpperCase();
};

const isbnSchema = z
  .string()
  .trim()
  .transform(normalizeISBN)
  .refine(
    (value) =>
      /^(?:\d{9}[\dX]|\d{13})$/.test(
        value
      ),
    {
      message:
        "Enter a valid ISBN-10 or ISBN-13",
    }
  );

const titleSchema = z
  .string()
  .trim()
  .min(
    2,
    "Title must be at least 2 characters"
  )
  .max(
    160,
    "Title is too long"
  );

const authorSchema = z
  .string()
  .trim()
  .min(
    2,
    "Author name is required"
  )
  .max(
    120,
    "Author name is too long"
  );

const descriptionSchema = z
  .string()
  .trim()
  .min(
    20,
    "Description must be at least 20 characters"
  )
  .max(
    5000,
    "Description is too long"
  );

const priceSchema = z.coerce
  .number()
  .min(
    0,
    "Price cannot be negative"
  );

const discountPriceSchema = z.union([
  z.coerce
    .number()
    .min(
      0,
      "Discount price cannot be negative"
    ),

  z.null(),
]);

const categorySchema = z
  .string()
  .trim()
  .min(
    1,
    "Category is required"
  );

const publisherSchema = z
  .string()
  .trim()
  .max(
    120,
    "Publisher name is too long"
  );

const languageSchema = z
  .string()
  .trim()
  .min(
    2,
    "Language is required"
  );

const pagesSchema = z.union([
  z.coerce
    .number()
    .int()
    .min(
      1,
      "Pages must be at least 1"
    ),

  z.null(),
]);

const publicationYearSchema =
  z.union([
    z.coerce
      .number()
      .int()
      .min(
        1000,
        "Publication year is invalid"
      )
      .max(
        new Date().getFullYear(),
        "Publication year cannot be in the future"
      ),

    z.null(),
  ]);

const stockSchema = z.coerce
  .number()
  .int()
  .min(
    0,
    "Stock cannot be negative"
  );

// --------------------------------------------------
// Create Book
// --------------------------------------------------

const createBookSchema = z
  .object({
    title:
      titleSchema,

    author:
      authorSchema,

    description:
      descriptionSchema,

    isbn:
      isbnSchema,

    price:
      priceSchema,

    discountPrice:
      discountPriceSchema
        .optional()
        .default(null),

    category:
      categorySchema,

    publisher:
      publisherSchema
        .optional()
        .default(""),

    language:
      languageSchema
        .optional()
        .default("English"),

    pages:
      pagesSchema
        .optional()
        .default(null),

    publicationYear:
      publicationYearSchema
        .optional()
        .default(null),

    coverImage: z
      .string()
      .trim()
      .optional()
      .default(""),

    galleryImages: z
      .array(
        z.string().trim()
      )
      .optional()
      .default([]),

    stock:
      stockSchema
        .optional()
        .default(0),

    featured: z
      .boolean()
      .optional()
      .default(false),
  })
  .refine(
    (data) =>
      data.discountPrice ===
        null ||
      data.discountPrice <=
        data.price,
    {
      message:
        "Discount price cannot be greater than regular price",

      path: [
        "discountPrice",
      ],
    }
  );

// --------------------------------------------------
// Update Book
// --------------------------------------------------

const updateBookSchema = z
  .object({
    title:
      titleSchema.optional(),

    author:
      authorSchema.optional(),

    description:
      descriptionSchema.optional(),

    isbn:
      isbnSchema.optional(),

    price:
      priceSchema.optional(),

    discountPrice:
      discountPriceSchema.optional(),

    category:
      categorySchema.optional(),

    publisher:
      publisherSchema.optional(),

    language:
      languageSchema.optional(),

    pages:
      pagesSchema.optional(),

    publicationYear:
      publicationYearSchema.optional(),

    coverImage: z
      .string()
      .trim()
      .optional(),

    galleryImages: z
      .array(
        z.string().trim()
      )
      .optional(),

    stock:
      stockSchema.optional(),

    featured: z
      .boolean()
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length >
      0,
    {
      message:
        "Provide at least one field to update",
    }
  )
  .refine(
    (data) => {
      if (
        data.price ===
          undefined ||
        data.discountPrice ===
          undefined ||
        data.discountPrice ===
          null
      ) {
        return true;
      }

      return (
        data.discountPrice <=
        data.price
      );
    },
    {
      message:
        "Discount price cannot be greater than regular price",

      path: [
        "discountPrice",
      ],
    }
  );

module.exports = {
  createBookSchema,
  updateBookSchema,
};
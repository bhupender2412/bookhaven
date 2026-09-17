const mongoose = require("mongoose");

const bookSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 160,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      author: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },

      isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      discountPrice: {
        type: Number,
        default: null,
        min: 0,
      },

      category: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Category",
        required: true,
      },

      publisher: {
        type: String,
        trim: true,
        default: "",
        maxlength: 120,
      },

      language: {
        type: String,
        trim: true,
        default: "English",
      },

      pages: {
        type: Number,
        min: 1,
        default: null,
      },

      publicationYear: {
        type: Number,
        min: 1000,
        default: null,
      },

      coverImage: {
        type: String,
        trim: true,
        default: "",
      },

      galleryImages: {
        type: [String],
        default: [],
      },

      stock: {
        type: Number,
        min: 0,
        default: 0,
      },

      soldCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },

      reviewCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      featured: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

bookSchema.index({
  title: 1,
  author: 1,
});

bookSchema.index({
  category: 1,
  isActive: 1,
});

bookSchema.index({
  price: 1,
});

bookSchema.index({
  averageRating: -1,
});

const Book = mongoose.model(
  "Book",
  bookSchema
);

module.exports = Book;
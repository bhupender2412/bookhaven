const mongoose = require("mongoose");

const reviewSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
        index: true,
      },

      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },

      comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 1000,
      },

      verifiedPurchase: {
        type: Boolean,
        default: false,
      },

      purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
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

// One user can review one book only once.
reviewSchema.index(
  {
    user: 1,
    book: 1,
  },
  {
    unique: true,
  }
);

// Helps when loading a book's newest reviews.
reviewSchema.index({
  book: 1,
  createdAt: -1,
});

const Review =
  mongoose.model(
    "Review",
    reviewSchema
  );

module.exports = Review;
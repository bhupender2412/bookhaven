const mongoose = require("mongoose");

const categorySchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 60,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      image: {
        type: String,
        trim: true,
        default: "",
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

categorySchema.index({
  name: 1,
});

const Category =
  mongoose.model(
    "Category",
    categorySchema
  );

module.exports = Category;
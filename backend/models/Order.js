const mongoose = require("mongoose");
const crypto = require("crypto");

const orderItemSchema =
  new mongoose.Schema(
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      slug: {
        type: String,
        required: true,
      },

      author: {
        type: String,
        required: true,
      },

      coverImage: {
        type: String,
        default: "",
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

const shippingAddressSchema =
  new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine1: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine2: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
        default: "India",
      },
    },
    {
      _id: false,
    }
  );

const orderSchema =
  new mongoose.Schema(
    {
      orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      items: {
        type: [orderItemSchema],
        required: true,
      },

      shippingAddress: {
        type: shippingAddressSchema,
        required: true,
      },

      paymentMethod: {
        type: String,
        enum: ["cod"],
        default: "cod",
      },

      paymentStatus: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "refunded",
        ],
        default: "pending",
      },

      orderStatus: {
        type: String,
        enum: [
          "placed",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ],
        default: "placed",
      },

      itemsPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      shippingPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      totalPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      placedAt: {
        type: Date,
        default: Date.now,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
});

orderSchema.statics.createOrderNumber =
  function () {
    const date =
      new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

    const random =
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `BH-${date}-${random}`;
  };

const Order =
  mongoose.model(
    "Order",
    orderSchema
  );

module.exports = Order;
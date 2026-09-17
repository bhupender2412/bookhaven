const mongoose =
  require("mongoose");

const Cart =
  require("../models/Cart");

const Book =
  require("../models/Book");

const populateCart = async (
  cart
) => {
  await cart.populate({
    path: "items.book",

    select:
      "title slug author price discountPrice coverImage stock isActive category",

    populate: {
      path: "category",
      select: "name slug",
    },
  });

  return cart;
};

const formatCart = (
  cart
) => {
  const items = cart.items
    .filter(
      (item) =>
        item.book
    )
    .map((item) => {
      const book =
        item.book;

      const unitPrice =
        book.discountPrice ??
        book.price;

      const subtotal =
        unitPrice *
        item.quantity;

      return {
        book: {
          _id:
            book._id,

          title:
            book.title,

          slug:
            book.slug,

          author:
            book.author,

          price:
            book.price,

          discountPrice:
            book.discountPrice,

          coverImage:
            book.coverImage,

          stock:
            book.stock,

          isActive:
            book.isActive,

          category:
            book.category,
        },

        quantity:
          item.quantity,

        unitPrice,

        subtotal,

        available:
          Boolean(
            book.isActive &&
              book.stock > 0
          ),
      };
    });

  const totalItems =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,

      0
    );

  const subtotal =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.subtotal,

      0
    );

  return {
    _id:
      cart._id,

    items,

    totalItems,

    subtotal,

    updatedAt:
      cart.updatedAt,
  };
};

// --------------------------------------------------
// Get Cart
// --------------------------------------------------

const getCart = async (
  req,
  res,
  next
) => {
  try {
    let cart =
      await Cart.findOne({
        user:
          req.user._id,
      });

    if (!cart) {
      cart =
        await Cart.create({
          user:
            req.user._id,

          items: [],
        });
    }

    await populateCart(
      cart
    );

    res.status(200).json({
      success: true,
      cart:
        formatCart(cart),
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Add Item
// --------------------------------------------------

const addCartItem =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        bookId,
        quantity,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book ID",
          });
      }

      const book =
        await Book.findOne({
          _id:
            bookId,

          isActive: true,
        });

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found or unavailable",
          });
      }

      if (book.stock <= 0) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "This book is out of stock",
          });
      }

      if (
        quantity >
        book.stock
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              `Only ${book.stock} copies are available`,
          });
      }

      let cart =
        await Cart.findOne({
          user:
            req.user._id,
        });

      if (!cart) {
        cart =
          await Cart.create({
            user:
              req.user._id,

            items: [],
          });
      }

      const existingItem =
        cart.items.find(
          (item) =>
            item.book.toString() ===
            bookId
        );

      if (existingItem) {
        const nextQuantity =
          existingItem.quantity +
          quantity;

        if (
          nextQuantity > 10
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Maximum quantity is 10 per book",
            });
        }

        if (
          nextQuantity >
          book.stock
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                `Only ${book.stock} copies are available`,
            });
        }

        existingItem.quantity =
          nextQuantity;
      } else {
        cart.items.push({
          book:
            book._id,

          quantity,
        });
      }

      await cart.save();

      await populateCart(
        cart
      );

      res.status(200).json({
        success: true,
        message:
          "Book added to cart",
        cart:
          formatCart(cart),
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Update Quantity
// --------------------------------------------------

const updateCartItem =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        bookId,
      } = req.params;

      const {
        quantity,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book ID",
          });
      }

      const book =
        await Book.findById(
          bookId
        );

      if (
        !book ||
        !book.isActive
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found or unavailable",
          });
      }

      if (
        quantity >
        book.stock
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              `Only ${book.stock} copies are available`,
          });
      }

      const cart =
        await Cart.findOne({
          user:
            req.user._id,
        });

      if (!cart) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Cart not found",
          });
      }

      const item =
        cart.items.find(
          (cartItem) =>
            cartItem.book.toString() ===
            bookId
        );

      if (!item) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book is not in your cart",
          });
      }

      item.quantity =
        quantity;

      await cart.save();

      await populateCart(
        cart
      );

      res.status(200).json({
        success: true,
        message:
          "Cart updated successfully",
        cart:
          formatCart(cart),
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Remove Item
// --------------------------------------------------

const removeCartItem =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        bookId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book ID",
          });
      }

      const cart =
        await Cart.findOne({
          user:
            req.user._id,
        });

      if (!cart) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Cart not found",
          });
      }

      const originalLength =
        cart.items.length;

      cart.items =
        cart.items.filter(
          (item) =>
            item.book.toString() !==
            bookId
        );

      if (
        cart.items.length ===
        originalLength
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book is not in your cart",
          });
      }

      await cart.save();

      await populateCart(
        cart
      );

      res.status(200).json({
        success: true,
        message:
          "Book removed from cart",
        cart:
          formatCart(cart),
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Clear Cart
// --------------------------------------------------

const clearCart = async (
  req,
  res,
  next
) => {
  try {
    let cart =
      await Cart.findOne({
        user:
          req.user._id,
      });

    if (!cart) {
      cart =
        await Cart.create({
          user:
            req.user._id,

          items: [],
        });
    } else {
      cart.items = [];

      await cart.save();
    }

    await populateCart(
      cart
    );

    res.status(200).json({
      success: true,
      message:
        "Cart cleared successfully",
      cart:
        formatCart(cart),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
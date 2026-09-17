const express =
  require("express");

const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  validateBody,
} = require("../middleware/validateMiddleware");

const {
  addCartItemSchema,
  updateCartItemSchema,
} = require("../validators/cartValidators");

const router =
  express.Router();

router.use(protect);

router.get(
  "/",
  getCart
);

router.post(
  "/items",
  validateBody(
    addCartItemSchema
  ),
  addCartItem
);

router.patch(
  "/items/:bookId",
  validateBody(
    updateCartItemSchema
  ),
  updateCartItem
);

router.delete(
  "/items/:bookId",
  removeCartItem
);

router.delete(
  "/",
  clearCart
);

module.exports = router;
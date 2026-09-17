const express =
  require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

router.use(protect);

router.get(
  "/",
  getWishlist
);

router.post(
  "/items/:bookId",
  addToWishlist
);

router.delete(
  "/items/:bookId",
  removeFromWishlist
);

router.delete(
  "/",
  clearWishlist
);

module.exports = router;
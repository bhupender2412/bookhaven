const express =
  require("express");

const {
  createReview,
  getBookReviews,
  getMyReviewStatus,
  updateMyReview,
  deleteMyReview,

  getAllReviews,
  toggleReviewStatus,
  deleteReviewByAdmin,
} = require("../controllers/reviewController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  validateBody,
} = require("../middleware/validateMiddleware");

const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validators/reviewValidators");

const router =
  express.Router();

// Logged-in user's review information
router.get(
  "/book/:bookId/me",
  protect,
  getMyReviewStatus
);

// Edit own review
router.patch(
  "/book/:bookId/me",
  protect,
  validateBody(
    updateReviewSchema
  ),
  updateMyReview
);

// Delete own review
router.delete(
  "/book/:bookId/me",
  protect,
  deleteMyReview
);

// Public reviews
router.get(
  "/book/:bookId",
  getBookReviews
);

// Create review
router.post(
  "/book/:bookId",
  protect,
  validateBody(
    createReviewSchema
  ),
  createReview
);


router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllReviews
);

router.patch(
  "/admin/:reviewId/status",
  protect,
  authorize("admin"),
  toggleReviewStatus
);

router.delete(
  "/admin/:reviewId",
  protect,
  authorize("admin"),
  deleteReviewByAdmin
);

module.exports = router;
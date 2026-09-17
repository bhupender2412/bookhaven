const mongoose =
  require("mongoose");

const Review =
  require("../models/Review");

const Book =
  require("../models/Book");

const Order =
  require("../models/Order");

// --------------------------------------------------
// Recalculate Book Rating
// --------------------------------------------------

const updateBookRating =
  async (bookId) => {
    const result =
      await Review.aggregate([
        {
          $match: {
            book:
              new mongoose.Types.ObjectId(
                bookId
              ),

            isActive: true,
          },
        },

        {
          $group: {
            _id: "$book",

            averageRating: {
              $avg: "$rating",
            },

            reviewCount: {
              $sum: 1,
            },
          },
        },
      ]);

    const ratingData =
      result[0];

    await Book.findByIdAndUpdate(
      bookId,
      {
        averageRating:
          ratingData
            ? Number(
              ratingData.averageRating.toFixed(
                1
              )
            )
            : 0,

        reviewCount:
          ratingData
            ?.reviewCount || 0,
      }
    );
  };

// --------------------------------------------------
// Create Review
// --------------------------------------------------

const createReview =
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
        rating,
        comment,
      } = req.body;

      // --------------------------------------------
      // Validate Book ID
      // --------------------------------------------

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

      // --------------------------------------------
      // Check Book
      // --------------------------------------------

      const book =
        await Book.findOne({
          _id:
            bookId,

          isActive:
            true,
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

      // --------------------------------------------
      // Check Existing Review
      // --------------------------------------------

      const existingReview =
        await Review.findOne({
          user:
            req.user._id,

          book:
            bookId,
        });

      if (existingReview) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "You have already reviewed this book",
          });
      }

      // --------------------------------------------
      // Verify Delivered Purchase
      // --------------------------------------------

      const deliveredOrder =
        await Order.findOne({
          user:
            req.user._id,

          orderStatus:
            "delivered",

          "items.book":
            bookId,
        }).sort({
          deliveredAt: -1,
          createdAt: -1,
        });

      if (!deliveredOrder) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Only customers with a delivered purchase can review this book",
          });
      }

      // --------------------------------------------
      // Create Verified Review
      // --------------------------------------------

      const review =
        await Review.create({
          user:
            req.user._id,

          book:
            book._id,

          rating,

          comment,

          verifiedPurchase:
            true,

          purchaseOrder:
            deliveredOrder._id,
        });

      // --------------------------------------------
      // Recalculate Book Rating
      // --------------------------------------------

      await updateBookRating(
        book._id
      );

      await review.populate({
        path: "user",

        select:
          "name",
      });

      res.status(201).json({
        success: true,

        message:
          "Review submitted successfully",

        review,
      });
    } catch (error) {
      if (
        error.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "You have already reviewed this book",
          });
      }

      next(error);
    }
  };


// --------------------------------------------------
// Get Public Reviews For Book
// --------------------------------------------------

const getBookReviews =
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
        page = 1,
        limit = 5,
        sort = "newest",
      } = req.query;

      // --------------------------------------------
      // Validate Book ID
      // --------------------------------------------

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

      // --------------------------------------------
      // Check Book
      // --------------------------------------------

      const book =
        await Book.findOne({
          _id:
            bookId,

          isActive:
            true,
        }).select(
          "title slug averageRating reviewCount"
        );

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found or unavailable",
          });
      }

      // --------------------------------------------
      // Pagination
      // --------------------------------------------

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const pageSize =
        Math.min(
          Math.max(
            Number(limit) || 5,
            1
          ),
          20
        );

      // --------------------------------------------
      // Sorting
      // --------------------------------------------

      const sortOptions = {
        newest: {
          createdAt: -1,
        },

        oldest: {
          createdAt: 1,
        },

        highest: {
          rating: -1,
          createdAt: -1,
        },

        lowest: {
          rating: 1,
          createdAt: -1,
        },
      };

      const sortBy =
        sortOptions[sort] ||
        sortOptions.newest;

      const filter = {
        book:
          bookId,

        isActive:
          true,
      };

      // --------------------------------------------
      // Reviews + Count
      // --------------------------------------------

      const [
        reviews,
        total,
      ] =
        await Promise.all([
          Review.find(
            filter
          )
            .populate({
              path: "user",
              select:
                "name",
            })
            .sort(
              sortBy
            )
            .skip(
              (currentPage -
                1) *
              pageSize
            )
            .limit(
              pageSize
            )
            .select(
              "user rating comment verifiedPurchase createdAt updatedAt"
            ),

          Review.countDocuments(
            filter
          ),
        ]);

      // --------------------------------------------
      // Rating Distribution
      // --------------------------------------------

      const distributionData =
        await Review.aggregate([
          {
            $match: {
              book:
                new mongoose.Types.ObjectId(
                  bookId
                ),

              isActive:
                true,
            },
          },

          {
            $group: {
              _id:
                "$rating",

              count: {
                $sum: 1,
              },
            },
          },
        ]);

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      distributionData.forEach(
        (item) => {
          distribution[
            item._id
          ] =
            item.count;
        }
      );

      res.status(200).json({
        success: true,

        summary: {
          averageRating:
            book.averageRating ||
            0,

          reviewCount:
            book.reviewCount ||
            0,

          distribution,
        },

        reviews,

        page:
          currentPage,

        pages:
          Math.ceil(
            total /
            pageSize
          ),

        total,

        limit:
          pageSize,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Get Current User Review Status
// --------------------------------------------------

const getMyReviewStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        bookId,
      } = req.params;

      // --------------------------------------------
      // Validate Book ID
      // --------------------------------------------

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

      // --------------------------------------------
      // Check Book
      // --------------------------------------------

      const book =
        await Book.findOne({
          _id: bookId,
          isActive: true,
        }).select(
          "_id title slug"
        );

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Book not found or unavailable",
          });
      }

      // --------------------------------------------
      // Check Existing Review
      // --------------------------------------------

      const review =
        await Review.findOne({
          user:
            req.user._id,

          book:
            bookId,
        }).select(
          "rating comment verifiedPurchase purchaseOrder isActive createdAt updatedAt"
        );

      // --------------------------------------------
      // Check Delivered Purchase
      // --------------------------------------------

      const deliveredOrder =
        await Order.findOne({
          user:
            req.user._id,

          orderStatus:
            "delivered",

          "items.book":
            bookId,
        })
          .sort({
            deliveredAt: -1,
            createdAt: -1,
          })
          .select(
            "_id orderNumber deliveredAt createdAt"
          );

      const purchasedAndDelivered =
        Boolean(
          deliveredOrder
        );

      const hasReviewed =
        Boolean(review);

      const canReview =
        purchasedAndDelivered &&
        !hasReviewed;

      res.status(200).json({
        success: true,

        eligibility: {
          purchasedAndDelivered,

          hasReviewed,

          canReview,
        },

        review:
          review || null,

        qualifyingOrder:
          deliveredOrder ||
          null,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Update Current User Review
// --------------------------------------------------

const updateMyReview =
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

      const review =
        await Review.findOne({
          user:
            req.user._id,

          book:
            bookId,

          isActive:
            true,
        });

      if (!review) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Your review was not found",
          });
      }

      if (
        req.body.rating !==
        undefined
      ) {
        review.rating =
          req.body.rating;
      }

      if (
        req.body.comment !==
        undefined
      ) {
        review.comment =
          req.body.comment;
      }

      await review.save();

      await updateBookRating(
        bookId
      );

      await review.populate({
        path: "user",
        select: "name",
      });

      res.status(200).json({
        success: true,

        message:
          "Review updated successfully",

        review,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Delete Current User Review
// --------------------------------------------------

const deleteMyReview =
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

      const review =
        await Review.findOne({
          user:
            req.user._id,

          book:
            bookId,
        });

      if (!review) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Your review was not found",
          });
      }

      await Review.deleteOne({
        _id:
          review._id,
      });

      await updateBookRating(
        bookId
      );

      res.status(200).json({
        success: true,

        message:
          "Review deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };


// --------------------------------------------------
// Admin - Get All Reviews
// --------------------------------------------------

const getAllReviews =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        status = "all",
        search = "",
        page = 1,
        limit = 20,
      } = req.query;

      const filter = {};

      if (status === "active") {
        filter.isActive =
          true;
      }

      if (status === "hidden") {
        filter.isActive =
          false;
      }

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const pageSize =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );

      let reviews =
        await Review.find(
          filter
        )
          .populate({
            path: "user",

            select:
              "name email",
          })
          .populate({
            path: "book",

            select:
              "title slug author",
          })
          .sort({
            createdAt: -1,
          });

      if (search.trim()) {
        const keyword =
          search
            .trim()
            .toLowerCase();

        reviews =
          reviews.filter(
            (review) => {
              const userName =
                review.user
                  ?.name
                  ?.toLowerCase() ||
                "";

              const userEmail =
                review.user
                  ?.email
                  ?.toLowerCase() ||
                "";

              const bookTitle =
                review.book
                  ?.title
                  ?.toLowerCase() ||
                "";

              const comment =
                review.comment
                  ?.toLowerCase() ||
                "";

              return (
                userName.includes(
                  keyword
                ) ||
                userEmail.includes(
                  keyword
                ) ||
                bookTitle.includes(
                  keyword
                ) ||
                comment.includes(
                  keyword
                )
              );
            }
          );
      }

      const total =
        reviews.length;

      const paginatedReviews =
        reviews.slice(
          (currentPage - 1) *
            pageSize,

          currentPage *
            pageSize
        );

      res.status(200).json({
        success: true,

        reviews:
          paginatedReviews,

        page:
          currentPage,

        pages:
          Math.max(
            Math.ceil(
              total /
                pageSize
            ),
            1
          ),

        total,

        limit:
          pageSize,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin - Toggle Review Visibility
// --------------------------------------------------

const toggleReviewStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        reviewId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          reviewId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid review ID",
          });
      }

      const review =
        await Review.findById(
          reviewId
        );

      if (!review) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Review not found",
          });
      }

      review.isActive =
        !review.isActive;

      await review.save();

      await updateBookRating(
        review.book
      );

      res.status(200).json({
        success: true,

        message:
          review.isActive
            ? "Review restored successfully"
            : "Review hidden successfully",

        review,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin - Delete Review Permanently
// --------------------------------------------------

const deleteReviewByAdmin =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        reviewId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          reviewId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid review ID",
          });
      }

      const review =
        await Review.findById(
          reviewId
        );

      if (!review) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Review not found",
          });
      }

      const bookId =
        review.book;

      await Review.deleteOne({
        _id:
          review._id,
      });

      await updateBookRating(
        bookId
      );

      res.status(200).json({
        success: true,

        message:
          "Review deleted permanently",
      });
    } catch (error) {
      next(error);
    }
  };


module.exports = {
  createReview,
  getBookReviews,
  getMyReviewStatus,
  updateMyReview,
  deleteMyReview,

  getAllReviews,
  toggleReviewStatus,
  deleteReviewByAdmin,
};
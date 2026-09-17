const express =
  require("express");

const {
  getBooks,
  getBookBySlug,
  getAdminBooks,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  validateBody,
} = require("../middleware/validateMiddleware");

const {
  createBookSchema,
  updateBookSchema,
} = require("../validators/bookValidators");

const router =
  express.Router();

// Public

router.get(
  "/",
  getBooks
);

router.get(
  "/slug/:slug",
  getBookBySlug
);

// Admin

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAdminBooks
);

router.post(
  "/",
  protect,
  authorize("admin"),
  validateBody(
    createBookSchema
  ),
  createBook
);

router.patch(
  "/:bookId",
  protect,
  authorize("admin"),
  validateBody(
    updateBookSchema
  ),
  updateBook
);

router.delete(
  "/:bookId",
  protect,
  authorize("admin"),
  deleteBook
);

module.exports = router;
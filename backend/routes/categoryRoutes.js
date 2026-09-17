const express =
  require("express");

const {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  validateBody,
} = require("../middleware/validateMiddleware");

const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/categoryValidators");

const router =
  express.Router();

// --------------------------------------------------
// Public
// --------------------------------------------------

router.get(
  "/",
  getCategories
);

router.get(
  "/slug/:slug",
  getCategoryBySlug
);

// --------------------------------------------------
// Admin
// --------------------------------------------------

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAdminCategories
);

router.post(
  "/",
  protect,
  authorize("admin"),
  validateBody(
    createCategorySchema
  ),
  createCategory
);

router.patch(
  "/:categoryId",
  protect,
  authorize("admin"),
  validateBody(
    updateCategorySchema
  ),
  updateCategory
);

router.delete(
  "/:categoryId",
  protect,
  authorize("admin"),
  deleteCategory
);

module.exports = router;
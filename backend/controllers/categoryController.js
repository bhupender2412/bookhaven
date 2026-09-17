const Category =
  require("../models/Category");

const createSlug =
  require("../utils/createSlug");

// --------------------------------------------------
// Public: Get active categories
// --------------------------------------------------

const getCategories = async (
  req,
  res,
  next
) => {
  try {
    const categories =
      await Category.find({
        isActive: true,
      })
        .sort({
          name: 1,
        })
        .select(
          "name slug description image"
        );

    res.status(200).json({
      success: true,
      count:
        categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Public: Get category by slug
// --------------------------------------------------

const getCategoryBySlug =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findOne({
          slug:
            req.params.slug,
          isActive: true,
        }).select(
          "name slug description image createdAt"
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Category not found",
          });
      }

      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Get every category
// --------------------------------------------------

const getAdminCategories =
  async (
    req,
    res,
    next
  ) => {
    try {
      const categories =
        await Category.find()
          .populate(
            "createdBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count:
          categories.length,
        categories,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Create category
// --------------------------------------------------

const createCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        name,
        description,
        image,
      } = req.body;

      const slug =
        createSlug(name);

      const existingCategory =
        await Category.findOne({
          $or: [
            {
              name: {
                $regex:
                  `^${name}$`,
                $options: "i",
              },
            },
            {
              slug,
            },
          ],
        });

      if (existingCategory) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Category already exists",
          });
      }

      const category =
        await Category.create({
          name,
          slug,
          description,
          image,
          createdBy:
            req.user._id,
        });

      res.status(201).json({
        success: true,
        message:
          "Category created successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Update category
// --------------------------------------------------

const updateCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findById(
          req.params.categoryId
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Category not found",
          });
      }

      if (
        req.body.name &&
        req.body.name !==
          category.name
      ) {
        const newSlug =
          createSlug(
            req.body.name
          );

        const duplicate =
          await Category.findOne({
            _id: {
              $ne:
                category._id,
            },

            $or: [
              {
                name: {
                  $regex:
                    `^${req.body.name}$`,
                  $options:
                    "i",
                },
              },
              {
                slug:
                  newSlug,
              },
            ],
          });

        if (duplicate) {
          return res
            .status(409)
            .json({
              success: false,
              message:
                "Category already exists",
            });
        }

        category.name =
          req.body.name;

        category.slug =
          newSlug;
      }

      if (
        req.body.description !==
        undefined
      ) {
        category.description =
          req.body.description;
      }

      if (
        req.body.image !==
        undefined
      ) {
        category.image =
          req.body.image;
      }

      if (
        req.body.isActive !==
        undefined
      ) {
        category.isActive =
          req.body.isActive;
      }

      await category.save();

      res.status(200).json({
        success: true,
        message:
          "Category updated successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Deactivate category
// --------------------------------------------------

const deleteCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findById(
          req.params.categoryId
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Category not found",
          });
      }

      category.isActive =
        false;

      await category.save();

      res.status(200).json({
        success: true,
        message:
          "Category deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
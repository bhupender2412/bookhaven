const mongoose =
  require("mongoose");

const Book =
  require("../models/Book");

const Category =
  require("../models/Category");

const createSlug =
  require("../utils/createSlug");

const createUniqueSlug =
  async (
    title,
    excludeId = null
  ) => {
    const baseSlug =
      createSlug(title);

    let slug =
      baseSlug;

    let counter = 2;

    while (true) {
      const query = {
        slug,
      };

      if (excludeId) {
        query._id = {
          $ne: excludeId,
        };
      }

      const existing =
        await Book.exists(
          query
        );

      if (!existing) {
        return slug;
      }

      slug =
        `${baseSlug}-${counter}`;

      counter += 1;
    }
  };

// --------------------------------------------------
// Public: Browse books
// --------------------------------------------------

const getBooks = async (
  req,
  res,
  next
) => {
  try {
    const {
      search = "",
      category,
      minPrice,
      maxPrice,
      rating,
      featured,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (search.trim()) {
      filter.$or = [
        {
          title: {
            $regex:
              search.trim(),

            $options: "i",
          },
        },

        {
          author: {
            $regex:
              search.trim(),

            $options: "i",
          },
        },

        {
          isbn: {
            $regex:
              search
                .trim()
                .replace(
                  /[-\s]/g,
                  ""
                ),

            $options: "i",
          },
        },
      ];
    }

    if (category) {
      const categoryDoc =
        await Category.findOne({
          slug: category,
          isActive: true,
        });

      if (!categoryDoc) {
        return res
          .status(200)
          .json({
            success: true,
            books: [],
            page: 1,
            pages: 0,
            total: 0,
          });
      }

      filter.category =
        categoryDoc._id;
    }

    if (
      minPrice !==
        undefined ||
      maxPrice !==
        undefined
    ) {
      filter.price = {};

      if (
        minPrice !==
        undefined
      ) {
        filter.price.$gte =
          Number(minPrice);
      }

      if (
        maxPrice !==
        undefined
      ) {
        filter.price.$lte =
          Number(maxPrice);
      }
    }

    if (rating) {
      filter.averageRating = {
        $gte:
          Number(rating),
      };
    }

    if (
      featured === "true"
    ) {
      filter.featured =
        true;
    }

    const sortOptions = {
      newest: {
        createdAt: -1,
      },

      "price-low": {
        price: 1,
      },

      "price-high": {
        price: -1,
      },

      rating: {
        averageRating: -1,
      },

      bestselling: {
        soldCount: -1,
      },

      title: {
        title: 1,
      },
    };

    const sortBy =
      sortOptions[sort] ||
      sortOptions.newest;

    const currentPage =
      Math.max(
        Number(page) || 1,
        1
      );

    const pageLimit =
      Math.min(
        Math.max(
          Number(limit) || 12,
          1
        ),
        50
      );

    const skip =
      (currentPage - 1) *
      pageLimit;

    const [
      books,
      total,
    ] = await Promise.all([
      Book.find(filter)
        .populate(
          "category",
          "name slug"
        )
        .sort(sortBy)
        .skip(skip)
        .limit(pageLimit),

      Book.countDocuments(
        filter
      ),
    ]);

    const pages =
      Math.ceil(
        total / pageLimit
      );

    res.status(200).json({
      success: true,
      books,
      page:
        currentPage,
      pages,
      total,
      limit:
        pageLimit,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Public: Get book by slug
// --------------------------------------------------

const getBookBySlug =
  async (
    req,
    res,
    next
  ) => {
    try {
      const book =
        await Book.findOne({
          slug:
            req.params.slug,
          isActive: true,
        }).populate(
          "category",
          "name slug description"
        );

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found",
          });
      }

      res.status(200).json({
        success: true,
        book,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Get all books
// --------------------------------------------------

const getAdminBooks =
  async (
    req,
    res,
    next
  ) => {
    try {
      const books =
        await Book.find()
          .populate(
            "category",
            "name slug"
          )
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
          books.length,
        books,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Create book
// --------------------------------------------------

const createBook =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findOne({
          _id:
            req.body.category,

          isActive: true,
        });

      if (!category) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Select a valid active category",
          });
      }

      const existingISBN =
        await Book.findOne({
          isbn:
            req.body.isbn,
        });

      if (existingISBN) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "A book with this ISBN already exists",
          });
      }

      const slug =
        await createUniqueSlug(
          req.body.title
        );

      const book =
        await Book.create({
          ...req.body,
          slug,
          createdBy:
            req.user._id,
        });

      await book.populate(
        "category",
        "name slug"
      );

      res.status(201).json({
        success: true,
        message:
          "Book created successfully",
        book,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Update book
// --------------------------------------------------

const updateBook =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.bookId
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
          req.params.bookId
        );

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found",
          });
      }

      if (
        req.body.category
      ) {
        const category =
          await Category.findOne({
            _id:
              req.body.category,

            isActive: true,
          });

        if (!category) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Select a valid active category",
            });
        }
      }

      if (
        req.body.isbn &&
        req.body.isbn !==
          book.isbn
      ) {
        const duplicateISBN =
          await Book.findOne({
            isbn:
              req.body.isbn,

            _id: {
              $ne:
                book._id,
            },
          });

        if (
          duplicateISBN
        ) {
          return res
            .status(409)
            .json({
              success: false,
              message:
                "A book with this ISBN already exists",
            });
        }
      }

      if (
        req.body.title &&
        req.body.title !==
          book.title
      ) {
        book.slug =
          await createUniqueSlug(
            req.body.title,
            book._id
          );
      }

      const allowedFields = [
        "title",
        "author",
        "description",
        "isbn",
        "price",
        "discountPrice",
        "category",
        "publisher",
        "language",
        "pages",
        "publicationYear",
        "coverImage",
        "galleryImages",
        "stock",
        "featured",
        "isActive",
      ];

      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            book[field] =
              req.body[field];
          }
        }
      );

      if (
        book.discountPrice !==
          null &&
        book.discountPrice >
          book.price
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Discount price cannot be greater than regular price",
          });
      }

      await book.save();

      await book.populate(
        "category",
        "name slug"
      );

      res.status(200).json({
        success: true,
        message:
          "Book updated successfully",
        book,
      });
    } catch (error) {
      next(error);
    }
  };

// --------------------------------------------------
// Admin: Deactivate book
// --------------------------------------------------

const deleteBook =
  async (
    req,
    res,
    next
  ) => {
    try {
      const book =
        await Book.findById(
          req.params.bookId
        );

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found",
          });
      }

      book.isActive =
        false;

      await book.save();

      res.status(200).json({
        success: true,
        message:
          "Book deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  getBooks,
  getBookBySlug,
  getAdminBooks,
  createBook,
  updateBook,
  deleteBook,
};
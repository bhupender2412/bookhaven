const dns = require("dns");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// Local Windows DNS workaround for MongoDB Atlas SRV lookup.
if (
  process.env.NODE_ENV !==
  "production"
) {
  dns.setServers([
    "8.8.8.8",
    "1.1.1.1",
  ]);
}

const Category = require("../models/Category");
const Book = require("../models/Book");
const User = require("../models/User");

const connectDB = require("../config/db");

const categories = [
  {
    name: "Programming",
    slug: "programming",
    description:
      "Programming, software development and computer science books.",
    image: "",
  },

  {
    name: "Fiction",
    slug: "fiction",
    description:
      "Novels, stories and literary fiction.",
    image: "",
  },

  {
    name: "Business",
    slug: "business",
    description:
      "Business, entrepreneurship and management books.",
    image: "",
  },

  {
    name: "Self Help",
    slug: "self-help",
    description:
      "Personal development, habits and productivity.",
    image: "",
  },

  {
    name: "Science & Technology",
    slug: "science-technology",
    description:
      "Science, technology, research and discovery books.",
    image: "",
  },
];

const seedProduction =
  async () => {
    try {
      await connectDB();

      console.log(
        "Connected to production database.",
      );

      // --------------------------------------------------
      // Find Admin
      // --------------------------------------------------

      const admin =
        await User.findOne({
          role: "admin",
        });

      if (!admin) {
        throw new Error(
          "No admin user found. Create the production admin before seeding books.",
        );
      }

      console.log(
        `Using admin: ${admin.email}`,
      );

      // --------------------------------------------------
      // Categories
      // --------------------------------------------------

      const categoryMap = {};

      for (const categoryData of categories) {
        const category =
          await Category.findOneAndUpdate(
            {
              slug:
                categoryData.slug,
            },
            categoryData,
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert:
                true,
            },
          );

        categoryMap[
          category.slug
        ] = category;

        console.log(
          `Category ready: ${category.name}`,
        );
      }

      // --------------------------------------------------
      // Books
      // --------------------------------------------------

      const books = [
        {
          title: "Clean Code",
          slug: "clean-code",
          author:
            "Robert C. Martin",
          description:
            "A practical guide to writing clean, maintainable and professional software code.",
          isbn:
            "9780132350884",
          price: 799,
          discountPrice: 649,
          category:
            categoryMap.programming
              ._id,
          publisher:
            "Prentice Hall",
          language: "English",
          pages: 464,
          publicationYear: 2008,
          coverImage: "",
          galleryImages: [],
          stock: 20,
          featured: true,
          isActive: true,
          createdBy:
            admin._id,
        },

        {
          title:
            "The Pragmatic Programmer",
          slug:
            "the-pragmatic-programmer",
          author:
            "Andrew Hunt and David Thomas",
          description:
            "A practical guide to becoming a more effective and thoughtful software developer.",
          isbn:
            "9780135957059",
          price: 899,
          discountPrice: 749,
          category:
            categoryMap.programming
              ._id,
          publisher:
            "Addison-Wesley",
          language: "English",
          pages: 352,
          publicationYear: 2019,
          coverImage: "",
          galleryImages: [],
          stock: 16,
          featured: true,
          isActive: true,
          createdBy:
            admin._id,
        },

        {
          title:
            "Clean Architecture",
          slug:
            "clean-architecture",
          author:
            "Robert C. Martin",
          description:
            "A guide to software architecture principles for building maintainable and scalable systems.",
          isbn:
            "9780134494166",
          price: 899,
          discountPrice: 699,
          category:
            categoryMap.programming
              ._id,
          publisher:
            "Prentice Hall",
          language: "English",
          pages: 432,
          publicationYear: 2017,
          coverImage: "",
          galleryImages: [],
          stock: 12,
          featured: true,
          isActive: true,
          createdBy:
            admin._id,
        },

        {
          title:
            "Atomic Habits",
          slug:
            "atomic-habits",
          author:
            "James Clear",
          description:
            "A practical book about building good habits, breaking bad ones and improving through small consistent changes.",
          isbn:
            "9780735211292",
          price: 699,
          discountPrice: 499,
          category:
            categoryMap[
              "self-help"
            ]._id,
          publisher:
            "Avery",
          language: "English",
          pages: 320,
          publicationYear: 2018,
          coverImage: "",
          galleryImages: [],
          stock: 18,
          featured: true,
          isActive: true,
          createdBy:
            admin._id,
        },

        {
          title:
            "The Psychology of Money",
          slug:
            "the-psychology-of-money",
          author:
            "Morgan Housel",
          description:
            "A collection of lessons about wealth, investing, behavior and decision-making with money.",
          isbn:
            "9780857197689",
          price: 599,
          discountPrice: 449,
          category:
            categoryMap.business
              ._id,
          publisher:
            "Harriman House",
          language: "English",
          pages: 256,
          publicationYear: 2020,
          coverImage: "",
          galleryImages: [],
          stock: 15,
          featured: true,
          isActive: true,
          createdBy:
            admin._id,
        },

        {
          title: "Zero to One",
          slug: "zero-to-one",
          author:
            "Peter Thiel",
          description:
            "A book about startups, innovation and building businesses that create something genuinely new.",
          isbn:
            "9780804139298",
          price: 649,
          discountPrice: 499,
          category:
            categoryMap.business
              ._id,
          publisher:
            "Crown Business",
          language: "English",
          pages: 224,
          publicationYear: 2014,
          coverImage: "",
          galleryImages: [],
          stock: 10,
          featured: false,
          isActive: true,
          createdBy:
            admin._id,
        },

        {
          title:
            "A Brief History of Time",
          slug:
            "a-brief-history-of-time",
          author:
            "Stephen Hawking",
          description:
            "An accessible exploration of cosmology, space, time, black holes and the origins of the universe.",
          isbn:
            "9780553380163",
          price: 599,
          discountPrice: 479,
          category:
            categoryMap[
              "science-technology"
            ]._id,
          publisher:
            "Bantam",
          language: "English",
          pages: 212,
          publicationYear: 1998,
          coverImage: "",
          galleryImages: [],
          stock: 9,
          featured: false,
          isActive: true,
          createdBy:
            admin._id,
        },

        {
          title:
            "The Alchemist",
          slug:
            "the-alchemist",
          author:
            "Paulo Coelho",
          description:
            "A philosophical novel about dreams, purpose and a young shepherd's journey in search of treasure.",
          isbn:
            "9780061122415",
          price: 499,
          discountPrice: 349,
          category:
            categoryMap.fiction
              ._id,
          publisher:
            "HarperOne",
          language: "English",
          pages: 208,
          publicationYear: 2006,
          coverImage: "",
          galleryImages: [],
          stock: 20,
          featured: false,
          isActive: true,
          createdBy:
            admin._id,
        },
      ];

      for (const bookData of books) {
        const book =
          await Book.findOneAndUpdate(
            {
              isbn:
                bookData.isbn,
            },
            {
              $set:
                bookData,
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert:
                true,
            },
          );

        console.log(
          `Book ready: ${book.title}`,
        );
      }

      console.log("");
      console.log(
        "Production seed completed successfully.",
      );

      console.log(
        `Categories: ${categories.length}`,
      );

      console.log(
        `Books: ${books.length}`,
      );
    } catch (error) {
      console.error(
        "Production seed failed:",
        error.message,
      );

      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();

      console.log(
        "Database connection closed.",
      );
    }
  };

seedProduction();
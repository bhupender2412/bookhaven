const express = require("express");
const cors = require("cors");

const healthRoutes =
  require("./routes/healthRoutes");

const authRoutes =
  require("./routes/authRoutes");

const categoryRoutes =
  require("./routes/categoryRoutes");

const bookRoutes =
  require("./routes/bookRoutes");

const cartRoutes =
  require("./routes/cartRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const wishlistRoutes =
  require("./routes/wishlistRoutes");

const reviewRoutes =
  require("./routes/reviewRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

// --------------------------------------------------
// Allowed Frontend Origins
// --------------------------------------------------

const productionOrigins =
  (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) =>
      origin.trim()
    )
    .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  ...productionOrigins,
];

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      // Allows requests without an Origin header,
      // such as curl, Postman and Render health checks.
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      console.warn(
        `Blocked by CORS: ${origin}`
      );

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,
  })
);

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// --------------------------------------------------
// Root Route
// --------------------------------------------------

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Book Store API is running",
    });
  }
);

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/books",
  bookRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

// --------------------------------------------------
// Error Handling
// --------------------------------------------------

app.use(
  notFound
);

app.use(
  errorHandler
);

module.exports = app;
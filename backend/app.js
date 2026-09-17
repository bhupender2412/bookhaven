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

const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");

const cartRoutes =
  require("./routes/cartRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const wishlistRoutes =
  require("./routes/wishlistRoutes");

const reviewRoutes =
  require("./routes/reviewRoutes");



const app = express();

const CLIENT_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

// --------------------------------------------------
// Root Route
// --------------------------------------------------

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "Book Store API is running",
    });
});

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

// More routes will be added here later:
//
// /api/auth
// /api/users
// /api/books
// /api/categories
// /api/orders
// /api/reviews
// /api/admin

// --------------------------------------------------
// Error Handling
// --------------------------------------------------

app.use(notFound);

app.use(errorHandler);

module.exports = app;
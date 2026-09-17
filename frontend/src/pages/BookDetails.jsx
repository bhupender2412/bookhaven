import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { addToCart } from "../features/cart/cartSlice";

import {
  addToWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";

import api from "../api/api";

import BookCard from "../components/books/BookCard";

import BookReviews, {
  RatingStars,
} from "../components/reviews/BookReviews";

import ReviewEditor from "../components/reviews/ReviewEditor";

function BookDetails() {
  const { slug } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const { isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const {
    actionLoading: cartActionLoading,
  } = useSelector(
    (state) => state.cart,
  );

  const {
    books: wishlistBooks,
    actionLoading: wishlistActionLoading,
  } = useSelector(
    (state) => state.wishlist,
  );

  const [book, setBook] =
    useState(null);

  const [
    relatedBooks,
    setRelatedBooks,
  ] = useState([]);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    cartMessage,
    setCartMessage,
  ] = useState("");

  const [
    cartError,
    setCartError,
  ] = useState("");

  const [
    wishlistMessage,
    setWishlistMessage,
  ] = useState("");

  const [
    wishlistError,
    setWishlistError,
  ] = useState("");

  const [
    reviewRefreshKey,
    setReviewRefreshKey,
  ] = useState(0);

  // --------------------------------------------------
  // Fetch Book
  // --------------------------------------------------

  useEffect(() => {
    const fetchBook =
      async () => {
        try {
          setLoading(true);
          setError("");

          setCartMessage("");
          setCartError("");

          setWishlistMessage("");
          setWishlistError("");

          setRelatedBooks([]);

          const response =
            await api.get(
              `/books/slug/${slug}`,
            );

          const currentBook =
            response.data.book;

          setBook(
            currentBook,
          );

          setQuantity(1);

          if (
            currentBook.category
              ?.slug
          ) {
            try {
              const relatedResponse =
                await api.get(
                  "/books",
                  {
                    params: {
                      category:
                        currentBook
                          .category
                          .slug,

                      limit: 5,
                    },
                  },
                );

              const related =
                (
                  relatedResponse
                    .data.books ||
                  []
                )
                  .filter(
                    (item) =>
                      item._id !==
                      currentBook._id,
                  )
                  .slice(0, 4);

              setRelatedBooks(
                related,
              );
            } catch {
              setRelatedBooks(
                [],
              );
            }
          }
        } catch (error) {
          setBook(null);

          setError(
            error.response?.data
              ?.message ||
              "Failed to load book",
          );
        } finally {
          setLoading(false);
        }
      };

    fetchBook();
  }, [slug]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading book details...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Book Error
  // --------------------------------------------------

  if (
    error ||
    !book
  ) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="empty-state">

            <h1 className="text-2xl font-extrabold text-stone-900">
              Book unavailable
            </h1>

            <p className="mt-2 text-stone-500">
              {error ||
                "This book could not be found."}
            </p>

            <Link
              to="/books"
              className="btn-primary mt-6"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Derived Values
  // --------------------------------------------------

  const sellingPrice =
    book.discountPrice ??
    book.price;

  const hasDiscount =
    book.discountPrice !==
      null &&
    book.discountPrice <
      book.price;

  const discountPercent =
    hasDiscount
      ? Math.round(
          ((book.price -
            book.discountPrice) /
            book.price) *
            100,
        )
      : 0;

  const maxQuantity =
    Math.min(
      book.stock,
      10,
    );

  const isInWishlist =
    wishlistBooks.some(
      (item) =>
        item._id ===
        book._id,
    );

  // --------------------------------------------------
  // Quantity
  // --------------------------------------------------

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(
            1,
            current - 1,
          ),
      );

      setCartMessage("");
      setCartError("");
    };

  const increaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.min(
            maxQuantity,
            current + 1,
          ),
      );

      setCartMessage("");
      setCartError("");
    };

  // --------------------------------------------------
  // Add To Cart
  // --------------------------------------------------

  const handleAddToCart =
    async () => {
      setCartMessage("");
      setCartError("");

      if (!isAuthenticated) {
        navigate(
          "/login",
          {
            state: {
              from: location,
            },
          },
        );

        return;
      }

      try {
        const result =
          await dispatch(
            addToCart({
              bookId:
                book._id,

              quantity,
            }),
          ).unwrap();

        setCartMessage(
          result.message ||
            "Book added to cart",
        );
      } catch (error) {
        setCartError(
          typeof error ===
            "string"
            ? error
            : "Failed to add book to cart",
        );
      }
    };

  // --------------------------------------------------
  // Add / Remove Wishlist
  // --------------------------------------------------

  const handleWishlist =
    async () => {
      setWishlistMessage("");
      setWishlistError("");

      if (!isAuthenticated) {
        navigate(
          "/login",
          {
            state: {
              from: location,
            },
          },
        );

        return;
      }

      try {
        if (isInWishlist) {
          const result =
            await dispatch(
              removeFromWishlist(
                book._id,
              ),
            ).unwrap();

          setWishlistMessage(
            result.message ||
              "Book removed from wishlist",
          );
        } else {
          const result =
            await dispatch(
              addToWishlist(
                book._id,
              ),
            ).unwrap();

          setWishlistMessage(
            result.message ||
              "Book added to wishlist",
          );
        }
      } catch (error) {
        setWishlistError(
          typeof error ===
            "string"
            ? error
            : "Wishlist action failed",
        );
      }
    };

  // --------------------------------------------------
  // Refresh Rating + Public Reviews
  // --------------------------------------------------

  const handleReviewChanged =
    async () => {
      try {
        const response =
          await api.get(
            `/books/slug/${slug}`,
          );

        setBook(
          response.data.book,
        );

        setReviewRefreshKey(
          (current) =>
            current + 1,
        );
      } catch (error) {
        console.error(
          "Failed to refresh book rating:",
          error,
        );
      }
    };

  return (
    <main className="page-shell">
      <div className="page-container">

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">

          <Link
            to="/"
            className="hover:text-amber-700"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            to="/books"
            className="hover:text-amber-700"
          >
            Books
          </Link>

          <span>/</span>

          <span className="font-semibold text-stone-800">
            {book.title}
          </span>
        </div>

        {/* Main Product */}
        <section className="mt-7 grid gap-10 lg:grid-cols-[420px_1fr]">

          {/* Cover */}
          <div className="store-card flex min-h-[540px] items-center justify-center overflow-hidden p-8">

            {book.coverImage ? (
              <img
                src={
                  book.coverImage
                }
                alt={
                  book.title
                }
                className="max-h-[500px] w-full object-contain"
              />
            ) : (
              <div className="flex h-[440px] w-[290px] flex-col items-center justify-center rounded-r-2xl border-l-[10px] border-amber-700 bg-gradient-to-br from-[#243047] via-[#172033] to-[#3d2c1e] px-8 text-center text-white shadow-2xl">

                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">
                  BookHaven
                </span>

                <h2 className="mt-10 text-3xl font-black leading-tight">
                  {book.title}
                </h2>

                <p className="mt-6 text-sm text-slate-300">
                  {book.author}
                </p>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="py-2">

            <div className="flex flex-wrap items-center gap-3">

              <Link
                to={`/books?category=${book.category?.slug}`}
                className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800"
              >
                {book.category?.name ||
                  "Book"}
              </Link>

              {book.featured && (
                <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-white">
                  ★ Featured
                </span>
              )}

              {hasDiscount && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-700">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
              {book.title}
            </h1>

            <p className="mt-3 text-lg text-stone-500">
              by{" "}
              <span className="font-bold text-stone-700">
                {book.author}
              </span>
            </p>

            {/* Rating */}
            <div className="mt-5 flex flex-wrap items-center gap-3">

              <RatingStars
                rating={
                  book.averageRating ||
                  0
                }
                size="text-lg"
              />

              {book.reviewCount >
              0 ? (
                <>
                  <span className="font-extrabold text-stone-800">
                    {Number(
                      book.averageRating ||
                        0,
                    ).toFixed(
                      1,
                    )}
                  </span>

                  <span className="text-sm text-stone-500">
                    {
                      book.reviewCount
                    }{" "}
                    {book.reviewCount ===
                    1
                      ? "review"
                      : "reviews"}
                  </span>
                </>
              ) : (
                <span className="text-sm text-stone-500">
                  No reviews yet
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-end gap-3">

              <span className="text-4xl font-black text-stone-900">
                ₹{sellingPrice}
              </span>

              {hasDiscount && (
                <>
                  <span className="pb-1 text-lg text-stone-400 line-through">
                    ₹{book.price}
                  </span>

                  <span className="pb-1 text-sm font-bold text-emerald-700">
                    Save ₹
                    {book.price -
                      book.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mt-5">
              <StockMessage
                stock={
                  book.stock
                }
              />
            </div>

            {/* Description */}
            <div className="mt-7 border-t border-stone-200 pt-7">

              <h2 className="text-lg font-extrabold text-stone-900">
                About this book
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-stone-600">
                {book.description}
              </p>
            </div>

            {/* Quantity */}
            {book.stock >
              0 && (
              <div className="mt-8">

                <p className="form-label">
                  Quantity
                </p>

                <div className="flex items-center gap-3">

                  <div className="flex items-center overflow-hidden rounded-xl border border-stone-300 bg-white">

                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <=
                        1
                      }
                      className="h-11 w-11 font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-30"
                    >
                      −
                    </button>

                    <span className="flex h-11 min-w-12 items-center justify-center border-x border-stone-200 font-bold text-stone-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                        maxQuantity
                      }
                      className="h-11 w-11 font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-stone-400">
                    Maximum{" "}
                    {maxQuantity} per
                    order
                  </span>
                </div>
              </div>
            )}

            {/* Cart Feedback */}
            {cartMessage && (
              <div className="alert-success mt-7">
                {cartMessage}
              </div>
            )}

            {cartError && (
              <div className="alert-error mt-7">
                {cartError}
              </div>
            )}

            {/* Wishlist Feedback */}
            {wishlistMessage && (
              <div className="alert-success mt-4">
                {wishlistMessage}
              </div>
            )}

            {wishlistError && (
              <div className="alert-error mt-4">
                {wishlistError}
              </div>
            )}

            {/* Cart / Wishlist */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              {/* Add To Cart */}
              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  book.stock ===
                    0 ||
                  cartActionLoading
                }
                className={`flex-1 rounded-xl px-6 py-3.5 font-extrabold transition ${
                  book.stock ===
                    0 ||
                  cartActionLoading
                    ? "cursor-not-allowed bg-stone-200 text-stone-400"
                    : "bg-stone-900 text-white hover:bg-amber-700"
                }`}
              >
                {book.stock ===
                0
                  ? "Out of Stock"
                  : cartActionLoading
                    ? "Adding..."
                    : `Add ${quantity} to Cart`}
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={
                  handleWishlist
                }
                disabled={
                  wishlistActionLoading
                }
                className={`rounded-xl border px-6 py-3.5 font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isInWishlist
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-stone-300 bg-white text-stone-700 hover:border-amber-400 hover:text-amber-700"
                }`}
              >
                {wishlistActionLoading
                  ? "Updating..."
                  : isInWishlist
                    ? "♥ In Wishlist"
                    : "♡ Add to Wishlist"}
              </button>
            </div>

            <p className="mt-3 text-xs text-stone-400">
              Cart and wishlist items
              are saved to your
              BookHaven account.
            </p>
          </div>
        </section>

        {/* Book Information */}
        <section className="store-card mt-10 p-6 md:p-8">

          <p className="eyebrow">
            Book Information
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
            Product details
          </h2>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <DetailBox
              label="ISBN"
              value={
                book.isbn
              }
            />

            <DetailBox
              label="Publisher"
              value={
                book.publisher ||
                "—"
              }
            />

            <DetailBox
              label="Language"
              value={
                book.language ||
                "—"
              }
            />

            <DetailBox
              label="Pages"
              value={
                book.pages ||
                "—"
              }
            />

            <DetailBox
              label="Published"
              value={
                book.publicationYear ||
                "—"
              }
            />

            <DetailBox
              label="Category"
              value={
                book.category?.name ||
                "—"
              }
            />

            <DetailBox
              label="Available Stock"
              value={
                book.stock
              }
            />

            <DetailBox
              label="Books Sold"
              value={
                book.soldCount ||
                0
              }
            />
          </div>
        </section>

        {/* Write / Edit / Delete Review */}
        <ReviewEditor
          bookId={
            book._id
          }
          onReviewChanged={
            handleReviewChanged
          }
        />

        {/* Customer Reviews */}
        <BookReviews
          bookId={
            book._id
          }
          refreshKey={
            reviewRefreshKey
          }
        />

        {/* Related Books */}
        {relatedBooks.length >
          0 && (
          <section className="mt-12">

            <div className="flex flex-wrap items-end justify-between gap-4">

              <div>
                <p className="eyebrow">
                  You May Also Like
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                  Related Books
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  More titles from the{" "}
                  <span className="font-semibold text-stone-700">
                    {
                      book.category
                        ?.name
                    }
                  </span>{" "}
                  collection.
                </p>
              </div>

              <Link
                to={`/books?category=${book.category?.slug}`}
                className="btn-secondary"
              >
                View Category
              </Link>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {relatedBooks.map(
                (item) => (
                  <BookCard
                    key={
                      item._id
                    }
                    book={
                      item
                    }
                  />
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function DetailBox({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">

      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 font-bold text-stone-800">
        {value}
      </p>
    </div>
  );
}

function StockMessage({
  stock,
}) {
  if (stock === 0) {
    return (
      <span className="inline-flex rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
        Out of stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex rounded-lg bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
        Only {stock} left in stock
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
      In stock — {stock} available
    </span>
  );
}

export default BookDetails;
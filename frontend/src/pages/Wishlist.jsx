import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Link,
} from "react-router-dom";

import {
  addToCart,
} from "../features/cart/cartSlice";

import {
  clearServerWishlist,
  clearWishlistFeedback,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";

function Wishlist() {
  const dispatch =
    useDispatch();

  const {
    books,
    count,
    loading,
    actionLoading:
      wishlistActionLoading,
    initialized,
    error,
    message,
  } = useSelector(
    (state) => state.wishlist
  );

  const {
    actionLoading:
      cartActionLoading,
  } = useSelector(
    (state) => state.cart
  );

  const [
    movingBookId,
    setMovingBookId,
  ] = useState(null);

  const [
    localMessage,
    setLocalMessage,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  useEffect(() => {
    dispatch(
      clearWishlistFeedback()
    );
  }, [dispatch]);

  const handleRemove =
    async (book) => {
      const confirmed =
        window.confirm(
          `Remove "${book.title}" from your wishlist?`
        );

      if (!confirmed) {
        return;
      }

      setLocalMessage("");
      setLocalError("");

      try {
        await dispatch(
          removeFromWishlist(
            book._id
          )
        ).unwrap();
      } catch (error) {
        setLocalError(
          typeof error ===
            "string"
            ? error
            : "Failed to remove book"
        );
      }
    };

  const handleMoveToCart =
    async (book) => {
      setLocalMessage("");
      setLocalError("");

      if (
        !book.isActive ||
        book.stock <= 0
      ) {
        setLocalError(
          `"${book.title}" is currently unavailable.`
        );

        return;
      }

      try {
        setMovingBookId(
          book._id
        );

        await dispatch(
          addToCart({
            bookId:
              book._id,

            quantity: 1,
          })
        ).unwrap();

        await dispatch(
          removeFromWishlist(
            book._id
          )
        ).unwrap();

        setLocalMessage(
          `"${book.title}" moved to your cart.`
        );
      } catch (error) {
        setLocalError(
          typeof error ===
            "string"
            ? error
            : "Failed to move book to cart"
        );
      } finally {
        setMovingBookId(
          null
        );
      }
    };

  const handleClearWishlist =
    async () => {
      const confirmed =
        window.confirm(
          "Remove all books from your wishlist?"
        );

      if (!confirmed) {
        return;
      }

      setLocalMessage("");
      setLocalError("");

      try {
        await dispatch(
          clearServerWishlist()
        ).unwrap();
      } catch (error) {
        setLocalError(
          typeof error ===
            "string"
            ? error
            : "Failed to clear wishlist"
        );
      }
    };

  if (
    loading &&
    !initialized
  ) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              Saved Collection
            </p>

            <h1 className="page-title">
              Wishlist
            </h1>

            <p className="page-subtitle">
              Save books you are
              interested in and move
              them to your cart whenever
              you are ready.
            </p>
          </div>

          {books.length > 0 && (
            <Link
              to="/books"
              className="btn-secondary"
            >
              Browse More Books
            </Link>
          )}
        </div>

        {/* Feedback */}
        {(localError ||
          error) && (
          <div className="alert-error mt-6">
            {localError ||
              error}
          </div>
        )}

        {localMessage && (
          <div className="alert-success mt-6">
            {localMessage}
          </div>
        )}

        {!localMessage &&
          message && (
            <div className="alert-success mt-6">
              {message}
            </div>
          )}

        {/* Empty Wishlist */}
        {books.length === 0 ? (
          <section className="empty-state mt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
              ♡
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-stone-900">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Save books that catch
              your interest and they
              will appear here for
              later.
            </p>

            <Link
              to="/books"
              className="btn-primary mt-6"
            >
              Discover Books
            </Link>
          </section>
        ) : (
          <>
            {/* Wishlist Summary */}
            <section className="store-card mt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">

                <div>
                  <h2 className="text-xl font-extrabold text-stone-900">
                    Saved Books
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    {count}{" "}
                    {count === 1
                      ? "book"
                      : "books"}{" "}
                    saved to your
                    account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleClearWishlist
                  }
                  disabled={
                    wishlistActionLoading ||
                    cartActionLoading
                  }
                  className="text-sm font-bold text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear Wishlist
                </button>
              </div>
            </section>

            {/* Wishlist Grid */}
            <section className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map(
                (book) => (
                  <WishlistCard
                    key={
                      book._id
                    }
                    book={
                      book
                    }
                    moving={
                      movingBookId ===
                      book._id
                    }
                    disabled={
                      wishlistActionLoading ||
                      cartActionLoading
                    }
                    onRemove={
                      handleRemove
                    }
                    onMoveToCart={
                      handleMoveToCart
                    }
                  />
                )
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function WishlistCard({
  book,
  moving,
  disabled,
  onRemove,
  onMoveToCart,
}) {
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
            100
        )
      : 0;

  return (
    <article className="group overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-[0_6px_20px_rgba(41,37,36,0.06)] transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_14px_30px_rgba(41,37,36,0.1)]">

      {/* Cover */}
      <Link
        to={`/books/${book.slug}`}
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 p-6"
      >
        {book.coverImage ? (
          <img
            src={
              book.coverImage
            }
            alt={
              book.title
            }
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full max-w-[170px] flex-col items-center justify-center rounded-r-xl border-l-[7px] border-amber-700 bg-gradient-to-br from-[#243047] to-[#172033] px-5 text-center text-white shadow-xl">

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
              BookHaven
            </span>

            <p className="mt-5 text-xl font-black leading-tight">
              {book.title}
            </p>

            <p className="mt-4 text-xs text-slate-300">
              {book.author}
            </p>
          </div>
        )}

        {book.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-extrabold text-white shadow">
            ★ Featured
          </span>
        )}

        {hasDiscount && (
          <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold text-white">
            {discountPercent}% OFF
          </span>
        )}
      </Link>

      {/* Information */}
      <div className="p-5">

        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">
            {book.category?.name ||
              "Book"}
          </span>

          <StockState
            stock={
              book.stock
            }
          />
        </div>

        <Link
          to={`/books/${book.slug}`}
          className="mt-4 block line-clamp-2 text-lg font-extrabold leading-snug text-stone-900 transition hover:text-amber-700"
        >
          {book.title}
        </Link>

        <p className="mt-1 text-sm text-stone-500">
          by {book.author}
        </p>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <div className="text-sm text-amber-500">
            ★★★★★
          </div>

          <span className="text-xs text-stone-400">
            {book.reviewCount >
            0
              ? `${Number(
                  book.averageRating ||
                    0
                ).toFixed(
                  1
                )} (${
                  book.reviewCount
                })`
              : "No reviews yet"}
          </span>
        </div>

        {/* Price */}
        <div className="mt-5 flex items-end gap-2">

          <span className="text-2xl font-black text-stone-900">
            ₹{sellingPrice}
          </span>

          {hasDiscount && (
            <span className="pb-1 text-sm text-stone-400 line-through">
              ₹{book.price}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() =>
              onMoveToCart(
                book
              )
            }
            disabled={
              disabled ||
              moving ||
              book.stock ===
                0
            }
            className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-extrabold transition ${
              book.stock === 0
                ? "cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-stone-900 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            }`}
          >
            {book.stock === 0
              ? "Out of Stock"
              : moving
                ? "Moving..."
                : "Move to Cart"}
          </button>

          <button
            type="button"
            onClick={() =>
              onRemove(
                book
              )
            }
            disabled={
              disabled
            }
            className="flex w-full items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function StockState({
  stock,
}) {
  if (stock === 0) {
    return (
      <span className="text-[11px] font-bold text-red-600">
        Out of stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="text-[11px] font-bold text-amber-700">
        Only {stock} left
      </span>
    );
  }

  return (
    <span className="text-[11px] font-bold text-emerald-700">
      In stock
    </span>
  );
}

export default Wishlist;
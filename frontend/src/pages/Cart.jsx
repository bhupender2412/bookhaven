import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Link } from "react-router-dom";

import {
  clearCartFeedback,
  clearServerCart,
  removeFromCart,
  updateCartQuantity,
} from "../features/cart/cartSlice";

function Cart() {
  const dispatch = useDispatch();

  const {
    items,
    totalItems,
    subtotal,
    loading,
    actionLoading,
    initialized,
    error,
    message,
  } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(clearCartFeedback());
  }, [dispatch]);

  const handleQuantityChange = async (item, nextQuantity) => {
    if (
      nextQuantity < 1 ||
      nextQuantity > 10 ||
      nextQuantity > item.book.stock
    ) {
      return;
    }

    await dispatch(
      updateCartQuantity({
        bookId: item.book._id,

        quantity: nextQuantity,
      }),
    );
  };

  const handleRemove = async (item) => {
    const confirmed = window.confirm(
      `Remove "${item.book.title}" from your cart?`,
    );

    if (!confirmed) {
      return;
    }

    await dispatch(removeFromCart(item.book._id));
  };

  const handleClearCart = async () => {
    const confirmed = window.confirm("Remove all books from your cart?");

    if (!confirmed) {
      return;
    }

    await dispatch(clearServerCart());
  };

  if (loading && !initialized) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading your cart...
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
            <p className="eyebrow">Shopping Bag</p>

            <h1 className="page-title">Your Cart</h1>

            <p className="page-subtitle">
              Review your books and quantities before continuing to checkout.
            </p>
          </div>

          {items.length > 0 && (
            <Link to="/books" className="btn-secondary">
              Continue Shopping
            </Link>
          )}
        </div>

        {/* Feedback */}
        {error && <div className="alert-error mt-6">{error}</div>}

        {message && <div className="alert-success mt-6">{message}</div>}

        {/* Empty Cart */}
        {items.length === 0 ? (
          <section className="empty-state mt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
              🛒
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-stone-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Browse the BookHaven collection and add a few books before
              continuing.
            </p>

            <Link to="/books" className="btn-primary mt-6">
              Browse Books
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Cart Items */}
            <section className="space-y-4">
              <div className="store-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900">
                      Cart Items
                    </h2>

                    <p className="mt-1 text-sm text-stone-500">
                      {totalItems} {totalItems === 1 ? "item" : "items"} in your
                      cart.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearCart}
                    disabled={actionLoading}
                    className="text-sm font-bold text-red-600 transition hover:text-red-800 disabled:opacity-40"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {items.map((item) => (
                    <CartItem
                      key={item.book._id}
                      item={item}
                      actionLoading={actionLoading}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Order Summary */}
            <aside className="h-fit lg:sticky lg:top-[96px]">
              <div className="store-card p-6">
                <p className="eyebrow">Order Summary</p>

                <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                  Cart total
                </h2>

                <div className="mt-6 space-y-4 border-b border-stone-200 pb-5">
                  <SummaryRow label="Items" value={totalItems} />

                  <SummaryRow label="Subtotal" value={`₹${subtotal}`} />

                  <SummaryRow
                    label="Shipping"
                    value="Calculated at checkout"
                    small
                  />
                </div>

                <div className="flex items-end justify-between gap-4 pt-5">
                  <div>
                    <p className="text-sm text-stone-500">Estimated total</p>

                    <p className="mt-1 text-xs text-stone-400">
                      Before shipping
                    </p>
                  </div>

                  <p className="text-3xl font-black text-stone-900">
                    ₹{subtotal}
                  </p>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3.5 font-extrabold text-white transition hover:bg-amber-700"
                >
                  Proceed to Checkout
                </Link>

                <p className="mt-3 text-center text-xs leading-5 text-stone-400">
                  Shipping and stock will be verified again before your order is
                  placed.
                </p>

                <div className="mt-6 rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Secure Cart
                  </p>

                  <p className="mt-2 text-xs leading-5 text-amber-700">
                    Your cart is stored with your BookHaven account and restored
                    when you sign in.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function CartItem({ item, actionLoading, onQuantityChange, onRemove }) {
  const { book, quantity, unitPrice, subtotal, available } = item;

  const hasDiscount =
    book.discountPrice !== null && book.discountPrice < book.price;

  const maxQuantity = Math.min(book.stock, 10);

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Cover */}
        <Link
          to={`/books/${book.slug}`}
          className="flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-stone-100"
        >
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center border-l-4 border-amber-700 bg-stone-800 px-2 text-center text-xs font-bold text-white">
              {book.title}
            </div>
          )}
        </Link>

        {/* Information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                to={`/books/${book.slug}`}
                className="text-lg font-extrabold text-stone-900 transition hover:text-amber-700"
              >
                {book.title}
              </Link>

              <p className="mt-1 text-sm text-stone-500">by {book.author}</p>

              {book.category && (
                <p className="mt-2 text-xs font-bold text-amber-700">
                  {book.category.name}
                </p>
              )}

              <div className="mt-3">
                {available ? (
                  book.stock <= 5 ? (
                    <span className="text-xs font-bold text-amber-700">
                      Only {book.stock} left
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700">
                      In stock
                    </span>
                  )
                ) : (
                  <span className="text-xs font-bold text-red-600">
                    Currently unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="shrink-0 sm:text-right">
              <p className="text-xl font-black text-stone-900">₹{unitPrice}</p>

              {hasDiscount && (
                <p className="mt-1 text-xs text-stone-400 line-through">
                  ₹{book.price}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-4">
            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-400">
                Qty
              </span>

              <div className="flex items-center overflow-hidden rounded-lg border border-stone-300 bg-white">
                <button
                  type="button"
                  onClick={() => onQuantityChange(item, quantity - 1)}
                  disabled={quantity <= 1 || actionLoading}
                  className="h-9 w-9 font-bold text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                <span className="flex h-9 min-w-10 items-center justify-center border-x border-stone-200 text-sm font-bold text-stone-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => onQuantityChange(item, quantity + 1)}
                  disabled={
                    quantity >= maxQuantity || actionLoading || !available
                  }
                  className="h-9 w-9 font-bold text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <span className="text-xs text-stone-400">Max {maxQuantity}</span>
            </div>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => onRemove(item)}
                disabled={actionLoading}
                className="text-xs font-bold text-red-600 transition hover:text-red-800 disabled:opacity-40"
              >
                Remove
              </button>

              <div className="text-right">
                <p className="text-xs text-stone-400">Item total</p>

                <p className="font-extrabold text-stone-900">₹{subtotal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SummaryRow({ label, value, small = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-stone-500">{label}</span>

      <span
        className={
          small
            ? "text-xs font-semibold text-stone-500"
            : "font-bold text-stone-800"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default Cart;

import {
  Link,
} from "react-router-dom";

function BookCard({
  book,
}) {
  const sellingPrice =
    book.discountPrice ??
    book.price;

  const hasDiscount =
    book.discountPrice !== null &&
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
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 p-6">

        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full max-w-[170px] flex-col items-center justify-center rounded-r-xl border-l-[7px] border-amber-700 bg-gradient-to-br from-[#243047] to-[#172033] px-5 text-center text-white shadow-xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
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

        {/* Featured */}
        {book.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-extrabold text-white shadow">
            ★ Featured
          </span>
        )}

        {/* Discount */}
        {hasDiscount && (
          <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold text-white">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Content */}
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

        <h3 className="mt-4 line-clamp-2 text-lg font-extrabold leading-snug text-stone-900">
          {book.title}
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          by {book.author}
        </p>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <div className="text-sm text-amber-500">
            ★★★★★
          </div>

          <span className="text-xs text-stone-400">
            {book.reviewCount > 0
              ? `${book.averageRating.toFixed(
                  1
                )} (${book.reviewCount})`
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

        {/* Details Link */}
        <Link
          to={`/books/${book.slug}`}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-amber-700"
        >
          View Book
        </Link>
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

export default BookCard;
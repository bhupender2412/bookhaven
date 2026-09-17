import {
  useEffect,
  useState,
} from "react";

import api from "../../api/api";

// --------------------------------------------------
// Reusable Star Display
// --------------------------------------------------

export function RatingStars({
  rating = 0,
  size = "text-base",
}) {
  const roundedRating =
    Math.round(
      Number(rating) || 0
    );

  return (
    <span
      className={`${size} tracking-[0.06em]`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <span
            key={star}
            className={
              star <=
              roundedRating
                ? "text-amber-500"
                : "text-stone-300"
            }
          >
            ★
          </span>
        )
      )}
    </span>
  );
}

// --------------------------------------------------
// Reviews Section
// --------------------------------------------------

function BookReviews({
  bookId,
  refreshKey = 0,
}) {
  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState({
    averageRating: 0,
    reviewCount: 0,

    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [sort, setSort] =
    useState("newest");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const fetchReviews =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/reviews/book/${bookId}`,
              {
                params: {
                  page,
                  limit: 5,
                  sort,
                },
              }
            );

          setReviews(
            response.data
              .reviews || []
          );

          setSummary(
            response.data
              .summary || {
              averageRating: 0,
              reviewCount: 0,

              distribution: {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0,
              },
            }
          );

          setPages(
            response.data.pages ||
              1
          );
        } catch (error) {
          setError(
            error.response?.data
              ?.message ||
              "Failed to load reviews"
          );
        } finally {
          setLoading(false);
        }
      };

    if (bookId) {
      fetchReviews();
    }
  }, [
  bookId,
  page,
  sort,
  refreshKey,
]);

  const handleSortChange = (
    event
  ) => {
    setSort(
      event.target.value
    );

    setPage(1);
  };

  return (
    <section className="store-card mt-10 overflow-hidden">

      {/* Header */}
      <div className="border-b border-stone-200 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="eyebrow">
              Customer Feedback
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
              Reviews & Ratings
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Feedback from verified
              BookHaven customers.
            </p>
          </div>

          {summary.reviewCount >
            0 && (
            <div>
              <label className="form-label">
                Sort reviews
              </label>

              <select
                value={sort}
                onChange={
                  handleSortChange
                }
                className="form-input min-w-[190px]"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="highest">
                  Highest Rated
                </option>

                <option value="lowest">
                  Lowest Rated
                </option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <ReviewLoading />
      ) : error ? (
        <div className="p-8">
          <div className="alert-error">
            {error}
          </div>
        </div>
      ) : summary.reviewCount ===
        0 ? (
        <NoReviews />
      ) : (
        <>
          {/* Rating Summary */}
          <div className="grid gap-8 border-b border-stone-200 p-6 md:grid-cols-[240px_1fr] md:p-8">

            {/* Average */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-50 p-7 text-center">

              <p className="text-5xl font-black text-stone-900">
                {Number(
                  summary.averageRating ||
                    0
                ).toFixed(1)}
              </p>

              <div className="mt-3">
                <RatingStars
                  rating={
                    summary.averageRating
                  }
                  size="text-xl"
                />
              </div>

              <p className="mt-3 text-sm font-semibold text-stone-500">
                Based on{" "}
                {
                  summary.reviewCount
                }{" "}
                {summary.reviewCount ===
                1
                  ? "review"
                  : "reviews"}
              </p>
            </div>

            {/* Distribution */}
            <div className="space-y-3">

              {[5, 4, 3, 2, 1].map(
                (rating) => (
                  <RatingBar
                    key={rating}
                    rating={
                      rating
                    }
                    count={
                      summary
                        .distribution?.[
                        rating
                      ] || 0
                    }
                    total={
                      summary.reviewCount
                    }
                  />
                )
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="divide-y divide-stone-100">

            {reviews.map(
              (review) => (
                <ReviewCard
                  key={
                    review._id
                  }
                  review={
                    review
                  }
                />
              )
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-4 border-t border-stone-200 p-6">

              <button
                type="button"
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1
                  )
                }
                disabled={
                  page <= 1 ||
                  loading
                }
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-sm font-bold text-stone-600">
                Page {page} of{" "}
                {pages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
                disabled={
                  page >= pages ||
                  loading
                }
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// --------------------------------------------------
// Rating Distribution Bar
// --------------------------------------------------

function RatingBar({
  rating,
  count,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (count / total) *
            100
        )
      : 0;

  return (
    <div className="grid grid-cols-[42px_1fr_55px] items-center gap-3">

      <span className="text-sm font-bold text-stone-700">
        {rating} ★
      </span>

      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <span className="text-right text-xs font-semibold text-stone-500">
        {count}
      </span>
    </div>
  );
}

// --------------------------------------------------
// Individual Review
// --------------------------------------------------

function ReviewCard({
  review,
}) {
  const reviewDate =
    new Date(
      review.createdAt
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  return (
    <article className="p-6 md:p-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex items-center gap-4">

          {/* User Initial */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 font-extrabold text-amber-800">
            {review.user?.name
              ?.charAt(0)
              .toUpperCase() ||
              "U"}
          </div>

          <div>
            <p className="font-extrabold text-stone-900">
              {review.user?.name ||
                "BookHaven Customer"}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">

              {review.verifiedPurchase && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                  ✓ Verified Purchase
                </span>
              )}

              <span className="text-xs text-stone-400">
                {reviewDate}
              </span>
            </div>
          </div>
        </div>

        <RatingStars
          rating={
            review.rating
          }
        />
      </div>

      <p className="mt-5 whitespace-pre-line leading-7 text-stone-600">
        {review.comment}
      </p>

      {review.updatedAt &&
        review.createdAt !==
          review.updatedAt && (
          <p className="mt-3 text-xs italic text-stone-400">
            Edited
          </p>
        )}
    </article>
  );
}

function ReviewLoading() {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

      <p className="mt-4 text-sm font-semibold text-stone-500">
        Loading customer reviews...
      </p>
    </div>
  );
}

function NoReviews() {
  return (
    <div className="p-10 text-center md:p-14">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
        ☆
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-stone-900">
        No customer reviews yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
        Verified customers will be
        able to share their experience
        after their order has been
        delivered.
      </p>
    </div>
  );
}

export default BookReviews;
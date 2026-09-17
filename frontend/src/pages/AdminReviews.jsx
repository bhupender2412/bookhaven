import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import api from "../api/api";

function AdminReviews() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState(
    searchParams.get(
      "search",
    ) || "",
  );

  const [
    pageInfo,
    setPageInfo,
  ] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const status =
    searchParams.get(
      "status",
    ) || "all";

  const search =
    searchParams.get(
      "search",
    ) || "";

  const page =
    Number(
      searchParams.get(
        "page",
      ),
    ) || 1;

  // --------------------------------------------------
  // Fetch Reviews
  // --------------------------------------------------

  const fetchReviews =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: 10,
        };

        if (
          status !== "all"
        ) {
          params.status =
            status;
        }

        if (search) {
          params.search =
            search;
        }

        const response =
          await api.get(
            "/reviews/admin/all",
            {
              params,
            },
          );

        setReviews(
          response.data
            .reviews || [],
        );

        setPageInfo({
          page:
            response.data.page ||
            1,

          pages:
            response.data.pages ||
            1,

          total:
            response.data.total ||
            0,
        });
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to load reviews",
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      status,
    ]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // --------------------------------------------------
  // URL Filters
  // --------------------------------------------------

  const updateFilter = (
    key,
    value,
  ) => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    if (
      value &&
      value !== "all"
    ) {
      params.set(
        key,
        value,
      );
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.set(
        "page",
        "1",
      );
    }

    setSearchParams(
      params,
    );
  };

  const handleSearch = (
    event,
  ) => {
    event.preventDefault();

    updateFilter(
      "search",
      searchInput.trim(),
    );
  };

  const clearFilters =
    () => {
      setSearchInput("");

      setSearchParams({});
    };

  // --------------------------------------------------
  // Hide / Restore
  // --------------------------------------------------

  const handleToggleStatus =
    async (review) => {
      try {
        setActionLoading(
          review._id,
        );

        setError("");
        setMessage("");

        const response =
          await api.patch(
            `/reviews/admin/${review._id}/status`,
          );

        setMessage(
          response.data
            .message ||
            "Review updated successfully",
        );

        await fetchReviews();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to update review",
        );
      } finally {
        setActionLoading("");
      }
    };

  // --------------------------------------------------
  // Delete Permanently
  // --------------------------------------------------

  const handleDelete =
    async (review) => {
      const confirmed =
        window.confirm(
          `Permanently delete the review for "${review.book?.title || "this book"}"? This cannot be undone.`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          review._id,
        );

        setError("");
        setMessage("");

        const response =
          await api.delete(
            `/reviews/admin/${review._id}`,
          );

        setMessage(
          response.data
            .message ||
            "Review deleted permanently",
        );

        await fetchReviews();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to delete review",
        );
      } finally {
        setActionLoading("");
      }
    };

  return (
    <main className="page-shell">
      <div className="page-container">

        <Link
          to="/admin"
          className="text-sm font-bold text-amber-700 hover:text-amber-900"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Hero */}
        <section className="mt-6 rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white shadow-lg md:p-10">

          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Community Moderation
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Review Management
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Review verified customer
            feedback, moderate visibility
            and keep BookHaven ratings
            trustworthy.
          </p>

          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">

            <Metric
              label="Matching Reviews"
              value={
                pageInfo.total
              }
            />

            <Metric
              label="Current Filter"
              value={
                status === "all"
                  ? "All"
                  : status
              }
            />
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <div className="alert-error mt-6">
            {error}
          </div>
        )}

        {message && (
          <div className="alert-success mt-6">
            {message}
          </div>
        )}

        {/* Filters */}
        <section className="store-card mt-8 p-5">

          <form
            onSubmit={
              handleSearch
            }
            className="grid gap-4 lg:grid-cols-[1fr_220px_auto_auto] lg:items-end"
          >

            <div>
              <label className="form-label">
                Search reviews
              </label>

              <input
                type="search"
                value={
                  searchInput
                }
                onChange={(
                  event,
                ) =>
                  setSearchInput(
                    event.target
                      .value,
                  )
                }
                placeholder="Customer, email, book or comment..."
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Visibility
              </label>

              <select
                value={
                  status
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "status",
                    event.target
                      .value,
                  )
                }
                className="form-input"
              >
                <option value="all">
                  All Reviews
                </option>

                <option value="active">
                  Active
                </option>

                <option value="hidden">
                  Hidden
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary h-[48px]"
            >
              Search
            </button>

            {(search ||
              status !==
                "all") && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="btn-secondary h-[48px]"
              >
                Clear
              </button>
            )}
          </form>
        </section>

        {/* Reviews */}
        <section className="store-card mt-8 overflow-hidden">

          <div className="border-b border-stone-200 px-6 py-5">

            <p className="eyebrow">
              Customer Feedback
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
              All Reviews
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {pageInfo.total}{" "}
              {pageInfo.total ===
              1
                ? "review"
                : "reviews"}{" "}
              found.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

              <p className="mt-4 text-sm font-semibold text-stone-500">
                Loading reviews...
              </p>
            </div>
          ) : reviews.length ===
            0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                ☆
              </div>

              <p className="mt-4 font-extrabold text-stone-800">
                No reviews found
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Try changing your search
                or visibility filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">

              {reviews.map(
                (review) => (
                  <ReviewRow
                    key={
                      review._id
                    }
                    review={
                      review
                    }
                    busy={
                      actionLoading ===
                      review._id
                    }
                    onToggle={
                      handleToggleStatus
                    }
                    onDelete={
                      handleDelete
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* Pagination */}
        {pageInfo.pages >
          1 && (
          <div className="mt-8 flex items-center justify-center gap-3">

            <button
              type="button"
              disabled={
                pageInfo.page <=
                1
              }
              onClick={() =>
                updateFilter(
                  "page",
                  String(
                    pageInfo.page -
                      1,
                  ),
                )
              }
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm font-bold text-stone-600">
              Page{" "}
              {pageInfo.page} of{" "}
              {pageInfo.pages}
            </span>

            <button
              type="button"
              disabled={
                pageInfo.page >=
                pageInfo.pages
              }
              onClick={() =>
                updateFilter(
                  "page",
                  String(
                    pageInfo.page +
                      1,
                  ),
                )
              }
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function ReviewRow({
  review,
  busy,
  onToggle,
  onDelete,
}) {
  const date =
    new Date(
      review.createdAt,
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );

  return (
    <article className="p-6">

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

        <div className="min-w-0 flex-1">

          {/* User + Status */}
          <div className="flex flex-wrap items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-extrabold text-amber-800">
              {review.user?.name
                ?.charAt(0)
                .toUpperCase() ||
                "U"}
            </div>

            <div>
              <p className="font-extrabold text-stone-900">
                {review.user?.name ||
                  "Unknown User"}
              </p>

              <p className="text-xs text-stone-500">
                {review.user?.email ||
                  "—"}
              </p>
            </div>

            {review.verifiedPurchase && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                ✓ Verified Purchase
              </span>
            )}

            <VisibilityBadge
              active={
                review.isActive
              }
            />
          </div>

          {/* Book */}
          <div className="mt-5">

            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Book
            </p>

            {review.book ? (
              <Link
                to={`/books/${review.book.slug}`}
                className="mt-1 inline-block font-extrabold text-stone-800 transition hover:text-amber-700"
              >
                {
                  review.book
                    .title
                }
              </Link>
            ) : (
              <p className="mt-1 font-bold text-stone-500">
                Book unavailable
              </p>
            )}

            {review.book?.author && (
              <p className="mt-1 text-sm text-stone-500">
                by{" "}
                {
                  review.book
                    .author
                }
              </p>
            )}
          </div>

          {/* Stars */}
          <div className="mt-4 flex flex-wrap items-center gap-3">

            <Stars
              rating={
                review.rating
              }
            />

            <span className="font-extrabold text-stone-800">
              {review.rating}/5
            </span>

            <span className="text-xs text-stone-400">
              {date}
            </span>
          </div>

          {/* Comment */}
          <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-stone-600">
            {review.comment}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              onToggle(
                review,
              )
            }
            disabled={
              busy
            }
            className={
              review.isActive
                ? "rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-40"
                : "rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
            }
          >
            {busy
              ? "Updating..."
              : review.isActive
                ? "Hide Review"
                : "Restore Review"}
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                review,
              )
            }
            disabled={
              busy
            }
            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-40"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </article>
  );
}

function Stars({
  rating,
}) {
  return (
    <div className="text-lg">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "text-amber-500"
                : "text-stone-300"
            }
          >
            ★
          </span>
        ),
      )}
    </div>
  );
}

function VisibilityBadge({
  active,
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
        active
          ? "bg-blue-100 text-blue-700"
          : "bg-stone-200 text-stone-600"
      }`}
    >
      {active
        ? "Active"
        : "Hidden"}
    </span>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">

      <p className="text-2xl font-black capitalize">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default AdminReviews;
import {
  useEffect,
  useState,
} from "react";

import {
  useSelector,
} from "react-redux";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../../api/api";

function ReviewEditor({
  bookId,
  onReviewChanged,
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );

  const [
    eligibility,
    setEligibility,
  ] = useState(null);

  const [
    review,
    setReview,
  ] = useState(null);

  const [
    qualifyingOrder,
    setQualifyingOrder,
  ] = useState(null);

  const [
    rating,
    setRating,
  ] = useState(5);

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  // --------------------------------------------------
  // Load Current User Review Status
  // --------------------------------------------------

  useEffect(() => {
    const fetchMyReview =
      async () => {
        if (
          !isAuthenticated ||
          !bookId
        ) {
          setEligibility(null);
          setReview(null);
          setQualifyingOrder(null);
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/reviews/book/${bookId}/me`
            );

          const data =
            response.data;

          setEligibility(
            data.eligibility
          );

          setReview(
            data.review
          );

          setQualifyingOrder(
            data.qualifyingOrder
          );

          if (data.review) {
            setRating(
              data.review.rating
            );

            setComment(
              data.review.comment
            );
          } else {
            setRating(5);
            setComment("");
          }
        } catch (error) {
          setError(
            error.response?.data
              ?.message ||
              "Failed to check review eligibility"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchMyReview();
  }, [
    bookId,
    isAuthenticated,
  ]);

  // --------------------------------------------------
  // Create / Update Review
  // --------------------------------------------------

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      try {
        setActionLoading(true);

        let response;

        if (review) {
          response =
            await api.patch(
              `/reviews/book/${bookId}/me`,
              {
                rating,
                comment,
              }
            );
        } else {
          response =
            await api.post(
              `/reviews/book/${bookId}`,
              {
                rating,
                comment,
              }
            );
        }

        const updatedReview =
          response.data.review;

        setReview(
          updatedReview
        );

        setRating(
          updatedReview.rating
        );

        setComment(
          updatedReview.comment
        );

        setEligibility(
          (current) => ({
            ...current,

            purchasedAndDelivered:
              true,

            hasReviewed:
              true,

            canReview:
              false,
          })
        );

        setEditing(false);

        setMessage(
          response.data.message ||
            "Review saved successfully"
        );

        if (
          onReviewChanged
        ) {
          await onReviewChanged();
        }
      } catch (error) {
        const validationMessage =
          error.response?.data
            ?.errors?.[0]
            ?.message;

        setError(
          validationMessage ||
            error.response?.data
              ?.message ||
            "Failed to save review"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // --------------------------------------------------
  // Delete Review
  // --------------------------------------------------

  const handleDelete =
    async () => {
      const confirmed =
        window.confirm(
          "Delete your review for this book?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setMessage("");

        const response =
          await api.delete(
            `/reviews/book/${bookId}/me`
          );

        setReview(null);

        setRating(5);
        setComment("");
        setEditing(false);

        setEligibility(
          (current) => ({
            ...current,

            hasReviewed:
              false,

            canReview:
              Boolean(
                current
                  ?.purchasedAndDelivered
              ),
          })
        );

        setMessage(
          response.data.message ||
            "Review deleted successfully"
        );

        if (
          onReviewChanged
        ) {
          await onReviewChanged();
        }
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to delete review"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // --------------------------------------------------
  // Logged Out
  // --------------------------------------------------

  if (!isAuthenticated) {
    return (
      <section className="store-card mt-10 p-6 md:p-8">
        <p className="eyebrow">
          Your Experience
        </p>

        <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
          Review this book
        </h2>

        <p className="mt-3 text-sm leading-6 text-stone-500">
          Sign in to check whether
          this book is eligible for
          a verified customer review.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/login",
              {
                state: {
                  from: location,
                },
              }
            )
          }
          className="btn-primary mt-6"
        >
          Sign In to Review
        </button>
      </section>
    );
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <section className="store-card mt-10 p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

        <p className="mt-4 text-sm font-semibold text-stone-500">
          Checking review eligibility...
        </p>
      </section>
    );
  }

  return (
    <section className="store-card mt-10 p-6 md:p-8">

      <p className="eyebrow">
        Your Experience
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
        Your Review
      </h2>

      {error && (
        <div className="alert-error mt-5">
          {error}
        </div>
      )}

      {message && (
        <div className="alert-success mt-5">
          {message}
        </div>
      )}

      {/* Not Eligible */}
      {eligibility &&
        !eligibility
          .purchasedAndDelivered && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

            <p className="font-extrabold text-amber-900">
              Verified purchase required
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              You can review this book
              after purchasing it through
              BookHaven and the order has
              been delivered.
            </p>
          </div>
        )}

      {/* Existing Review */}
      {review &&
        !editing && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6">

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div>
                <StarDisplay
                  rating={
                    review.rating
                  }
                />

                <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
                  ✓ Verified Purchase
                </span>
              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setEditing(
                      true
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="btn-secondary"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={
                    actionLoading
                  }
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>

            <p className="mt-5 whitespace-pre-line leading-7 text-stone-600">
              {review.comment}
            </p>

            {qualifyingOrder && (
              <p className="mt-4 text-xs text-stone-400">
                Verified from order{" "}
                <span className="font-semibold">
                  {
                    qualifyingOrder
                      .orderNumber
                  }
                </span>
              </p>
            )}
          </div>
        )}

      {/* Create / Edit Form */}
      {eligibility &&
        eligibility
          .purchasedAndDelivered &&
        (!review ||
          editing) && (
          <form
            onSubmit={
              handleSubmit
            }
            className="mt-6"
          >

            <div>
              <label className="form-label">
                Your rating
              </label>

              <RatingInput
                value={
                  rating
                }
                onChange={
                  setRating
                }
              />

              <p className="mt-2 text-xs text-stone-400">
                {rating} out of 5
                stars
              </p>
            </div>

            <div className="mt-6">
              <label className="form-label">
                Your review
              </label>

              <textarea
                value={
                  comment
                }
                onChange={(
                  event
                ) =>
                  setComment(
                    event.target
                      .value
                  )
                }
                required
                minLength={3}
                maxLength={1000}
                rows={6}
                placeholder="Share your experience with this book..."
                className="form-input resize-y"
              />

              <div className="mt-2 flex justify-between gap-3 text-xs text-stone-400">
                <span>
                  Minimum 3 characters
                </span>

                <span>
                  {
                    comment.length
                  }
                  /1000
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">

              <button
                type="submit"
                disabled={
                  actionLoading
                }
                className="btn-primary"
              >
                {actionLoading
                  ? "Saving..."
                  : review
                    ? "Update Review"
                    : "Submit Review"}
              </button>

              {review &&
                editing && (
                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() => {
                      setEditing(
                        false
                      );

                      setRating(
                        review.rating
                      );

                      setComment(
                        review.comment
                      );

                      setError("");
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
            </div>
          </form>
        )}
    </section>
  );
}

// --------------------------------------------------
// Interactive Rating
// --------------------------------------------------

function RatingInput({
  value,
  onChange,
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              onChange(
                star
              )
            }
            className={`text-3xl transition hover:scale-110 ${
              star <= value
                ? "text-amber-500"
                : "text-stone-300"
            }`}
            aria-label={`${star} star rating`}
          >
            ★
          </button>
        )
      )}
    </div>
  );
}

// --------------------------------------------------
// Read-only Stars
// --------------------------------------------------

function StarDisplay({
  rating,
}) {
  return (
    <div className="flex items-center gap-2">

      <div className="text-xl">
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
          )
        )}
      </div>

      <span className="font-extrabold text-stone-800">
        {rating}/5
      </span>
    </div>
  );
}

export default ReviewEditor;
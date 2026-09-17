import BookForm from "../components/admin/BookForm";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/api";

function AdminBooks() {
  const [books, setBooks] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingBook,
    setEditingBook,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const fetchBooks =
    useCallback(async () => {
      try {
        setError("");

        const response =
          await api.get(
            "/books/admin/all"
          );

        setBooks(
          response.data.books ||
            []
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to load books"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleEdit = (book) => {
    setEditingBook(book);

    setShowForm(true);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeactivate =
    async (book) => {
      const confirmed =
        window.confirm(
          `Deactivate "${book.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        await api.delete(
          `/books/${book._id}`
        );

        setMessage(
          "Book deactivated successfully."
        );

        await fetchBooks();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to deactivate book"
        );
      }
    };

  const handleReactivate =
    async (book) => {
      try {
        setError("");
        setMessage("");

        await api.patch(
          `/books/${book._id}`,
          {
            isActive: true,
          }
        );

        setMessage(
          "Book reactivated successfully."
        );

        await fetchBooks();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to reactivate book"
        );
      }
    };

  const handleFeaturedToggle =
    async (book) => {
      try {
        setError("");
        setMessage("");

        await api.patch(
          `/books/${book._id}`,
          {
            featured:
              !book.featured,
          }
        );

        setMessage(
          book.featured
            ? "Book removed from featured titles."
            : "Book added to featured titles."
        );

        await fetchBooks();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to update featured status"
        );
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading bookstore inventory...
          </p>
        </div>
      </div>
    );
  }

  const activeBooks =
    books.filter(
      (book) =>
        book.isActive
    );

  const inactiveBooks =
    books.filter(
      (book) =>
        !book.isActive
    );

  const lowStockBooks =
    books.filter(
      (book) =>
        book.isActive &&
        book.stock > 0 &&
        book.stock <= 5
    );

  const outOfStockBooks =
    books.filter(
      (book) =>
        book.isActive &&
        book.stock === 0
    );

  return (
    <main className="page-shell">
      <div className="page-container">

        {/* Back */}
        <Link
          to="/admin"
          className="text-sm font-bold text-amber-700 hover:text-amber-900"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Hero */}
        <section className="mt-6 rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white shadow-lg md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Catalog Administration
          </p>

          <div className="mt-3 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Book Management
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Manage BookHaven products,
                pricing, inventory,
                availability and featured
                titles.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric
                value={
                  books.length
                }
                label="Total"
              />

              <Metric
                value={
                  activeBooks.length
                }
                label="Active"
              />

              <Metric
                value={
                  lowStockBooks.length
                }
                label="Low Stock"
              />

              <Metric
                value={
                  outOfStockBooks.length
                }
                label="Out"
              />
            </div>
          </div>
        </section>

        {/* Messages */}
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

        {/* Create / Edit Form */}
        {showForm && (
          <BookForm
            editingBook={
              editingBook
            }
            onSaved={async (
              successMessage
            ) => {
              setMessage(
                successMessage
              );

              setShowForm(false);

              setEditingBook(null);

              await fetchBooks();
            }}
            onCancel={() => {
              setShowForm(false);

              setEditingBook(null);

              setError("");
            }}
          />
        )}

        {/* Inventory */}
        <section className="mt-8 store-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 px-6 py-5">

            <div>
              <p className="eyebrow">
                Inventory
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                All Books
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                {activeBooks.length} active
                and{" "}
                {inactiveBooks.length} inactive
                products.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  setShowForm(false);

                  setEditingBook(null);
                } else {
                  setEditingBook(null);

                  setShowForm(true);
                }

                setMessage("");
                setError("");
              }}
              className="btn-primary"
            >
              {showForm
                ? "Close Form"
                : "+ Add Book"}
            </button>
          </div>

          {books.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-bold text-stone-700">
                No books found.
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Click Add Book to
                create your first
                bookstore product.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-6 py-4">
                      Book
                    </th>

                    <th className="px-6 py-4">
                      Category
                    </th>

                    <th className="px-6 py-4">
                      Price
                    </th>

                    <th className="px-6 py-4">
                      Stock
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Featured
                    </th>

                    <th className="px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {books.map(
                    (book) => (
                      <BookRow
                        key={
                          book._id
                        }
                        book={book}
                        onEdit={
                          handleEdit
                        }
                        onDeactivate={
                          handleDeactivate
                        }
                        onReactivate={
                          handleReactivate
                        }
                        onFeaturedToggle={
                          handleFeaturedToggle
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function BookRow({
  book,
  onEdit,
  onDeactivate,
  onReactivate,
  onFeaturedToggle,
}) {
  const sellingPrice =
    book.discountPrice ??
    book.price;

  return (
    <tr className="transition hover:bg-stone-50/70">

      {/* Book */}
      <td className="px-6 py-5">
        <div className="flex min-w-[240px] items-center gap-4">

          <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100 font-black text-amber-800">
            {book.coverImage ? (
              <img
                src={
                  book.coverImage
                }
                alt={
                  book.title
                }
                className="h-full w-full object-cover"
              />
            ) : (
              book.title
                ?.charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>
            <p className="font-extrabold text-stone-900">
              {book.title}
            </p>

            <p className="mt-1 text-sm text-stone-500">
              {book.author}
            </p>

            <p className="mt-1 text-xs text-stone-400">
              ISBN{" "}
              {book.isbn}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-5">
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
          {book.category?.name ||
            "—"}
        </span>
      </td>

      {/* Price */}
      <td className="px-6 py-5">
        <p className="font-bold text-stone-900">
          ₹{sellingPrice}
        </p>

        {book.discountPrice !==
          null && (
          <p className="mt-1 text-xs text-stone-400 line-through">
            ₹{book.price}
          </p>
        )}
      </td>

      {/* Stock */}
      <td className="px-6 py-5">
        <StockBadge
          stock={
            book.stock
          }
        />
      </td>

      {/* Status */}
      <td className="px-6 py-5">
        {book.isActive ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            Active
          </span>
        ) : (
          <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-bold text-stone-600">
            Inactive
          </span>
        )}
      </td>

      {/* Featured */}
      <td className="px-6 py-5">
        <button
          type="button"
          onClick={() =>
            onFeaturedToggle(
              book
            )
          }
          className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
            book.featured
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-stone-100 text-stone-500 hover:bg-stone-200"
          }`}
        >
          {book.featured
            ? "★ Featured"
            : "☆ Not Featured"}
        </button>
      </td>

      {/* Actions */}
      <td className="px-6 py-5">
        <div className="flex min-w-[170px] flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              onEdit(book)
            }
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
          >
            Edit
          </button>

          {book.isActive ? (
            <button
              type="button"
              onClick={() =>
                onDeactivate(
                  book
                )
              }
              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onReactivate(
                  book
                )
              }
              className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              Reactivate
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function StockBadge({
  stock,
}) {
  if (stock === 0) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
        Out of stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
        {stock} left
      </span>
    );
  }

  return (
    <span className="font-bold text-stone-700">
      {stock}
    </span>
  );
}

function Metric({
  value,
  label,
}) {
  return (
    <div className="min-w-[90px] rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default AdminBooks;
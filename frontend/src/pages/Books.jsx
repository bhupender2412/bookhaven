import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import api from "../api/api";

import BookCard from "../components/books/BookCard";

function Books() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [books, setBooks] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [pageInfo, setPageInfo] =
    useState({
      page: 1,
      pages: 1,
      total: 0,
    });

  const [searchInput, setSearchInput] =
    useState(
      searchParams.get("search") ||
        ""
    );

  const search =
    searchParams.get("search") ||
    "";

  const category =
    searchParams.get("category") ||
    "";

  const sort =
    searchParams.get("sort") ||
    "newest";

  const page =
    Number(
      searchParams.get("page")
    ) || 1;

  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          const response =
            await api.get(
              "/categories"
            );

          setCategories(
            response.data.categories ||
              []
          );
        } catch {
          // Catalog can still work
          // if categories fail.
        }
      };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks =
      async () => {
        try {
          setLoading(true);
          setError("");

          const params =
            new URLSearchParams();

          if (search) {
            params.set(
              "search",
              search
            );
          }

          if (category) {
            params.set(
              "category",
              category
            );
          }

          if (sort) {
            params.set(
              "sort",
              sort
            );
          }

          params.set(
            "page",
            page
          );

          params.set(
            "limit",
            "12"
          );

          const response =
            await api.get(
              `/books?${params.toString()}`
            );

          setBooks(
            response.data.books ||
              []
          );

          setPageInfo({
            page:
              response.data.page ||
              1,

            pages:
              response.data.pages ||
              0,

            total:
              response.data.total ||
              0,
          });
        } catch (error) {
          setError(
            error.response?.data
              ?.message ||
              "Failed to load books"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchBooks();
  }, [
    search,
    category,
    sort,
    page,
  ]);

  const updateFilter = (
    key,
    value
  ) => {
    const params =
      new URLSearchParams(
        searchParams
      );

    if (value) {
      params.set(
        key,
        value
      );
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.set(
        "page",
        "1"
      );
    }

    setSearchParams(params);
  };

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    updateFilter(
      "search",
      searchInput.trim()
    );
  };

  const clearFilters = () => {
    setSearchInput("");

    setSearchParams({});
  };

  const hasFilters =
    Boolean(
      search ||
        category ||
        sort !== "newest"
    );

  return (
    <main className="page-shell">
      <div className="page-container">

        {/* Header */}
        <section className="rounded-[28px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] px-7 py-10 text-white md:px-10 md:py-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">
            BookHaven Collection
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Find something worth reading.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Search our collection,
            explore categories and
            discover books for your
            next reading session.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              placeholder="Search by title, author or ISBN..."
              className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-stone-900 outline-none focus:ring-4 focus:ring-amber-400/20"
            />

            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-6 py-3 font-extrabold text-white transition hover:bg-amber-600"
            >
              Search
            </button>
          </form>
        </section>

        {/* Filters */}
        <section className="mt-8 store-card p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_240px_auto] md:items-end">

            <div>
              <label className="form-label">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  updateFilter(
                    "category",
                    event.target.value
                  )
                }
                className="form-input"
              >
                <option value="">
                  All Categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={
                        item._id
                      }
                      value={
                        item.slug
                      }
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="form-label">
                Sort by
              </label>

              <select
                value={sort}
                onChange={(event) =>
                  updateFilter(
                    "sort",
                    event.target.value
                  )
                }
                className="form-input"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="bestselling">
                  Best Selling
                </option>

                <option value="title">
                  Title A–Z
                </option>
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="btn-secondary h-[48px]"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Result header */}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              Store Catalog
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
              Browse Books
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {loading
                ? "Loading books..."
                : `${pageInfo.total} book${
                    pageInfo.total ===
                    1
                      ? ""
                      : "s"
                  } found`}
            </p>
          </div>

          {search && (
            <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-900">
              Search:{" "}
              <strong>
                {search}
              </strong>
            </div>
          )}
        </div>

        {error && (
          <div className="alert-error mt-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <BookGridSkeleton />
        ) : books.length ===
          0 ? (
          <div className="empty-state mt-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
              📚
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-stone-800">
              No books found
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Try changing your search
              or category.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="btn-primary mt-5"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Books */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map(
                (book) => (
                  <BookCard
                    key={
                      book._id
                    }
                    book={book}
                  />
                )
              )}
            </div>

            {/* Pagination */}
            {pageInfo.pages > 1 && (
              <Pagination
                page={
                  pageInfo.page
                }
                pages={
                  pageInfo.pages
                }
                onPageChange={(
                  nextPage
                ) =>
                  updateFilter(
                    "page",
                    String(
                      nextPage
                    )
                  )
                }
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Pagination({
  page,
  pages,
  onPageChange,
}) {
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() =>
          onPageChange(
            page - 1
          )
        }
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous
      </button>

      <span className="px-3 text-sm font-bold text-stone-600">
        Page {page} of {pages}
      </span>

      <button
        type="button"
        disabled={
          page >= pages
        }
        onClick={() =>
          onPageChange(
            page + 1
          )
        }
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}

function BookGridSkeleton() {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[22px] border border-stone-200 bg-white"
        >
          <div className="aspect-[4/5] animate-pulse bg-stone-100" />

          <div className="space-y-3 p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-stone-100" />

            <div className="h-5 w-4/5 animate-pulse rounded bg-stone-100" />

            <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />

            <div className="h-7 w-24 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Books;
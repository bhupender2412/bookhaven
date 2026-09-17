import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import api from "../api/api";

import BookCard from "../components/books/BookCard";

function Home() {
  const {
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );

  const [
    featuredBooks,
    setFeaturedBooks,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchHomeData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            booksResponse,
            categoriesResponse,
          ] = await Promise.all([
            api.get(
              "/books",
              {
                params: {
                  featured:
                    true,

                  limit:
                    4,
                },
              }
            ),

            api.get(
              "/categories"
            ),
          ]);

          setFeaturedBooks(
            booksResponse.data
              .books || []
          );

          setCategories(
            categoriesResponse
              .data.categories ||
              []
          );
        } catch (error) {
          setError(
            error.response?.data
              ?.message ||
              "Failed to load bookstore data"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchHomeData();
  }, []);

  return (
    <main className="page-shell">

      {/* Hero */}
      <section className="page-container pb-0">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] px-7 py-12 text-white shadow-[0_18px_45px_rgba(28,25,23,0.18)] md:px-10 md:py-16">

          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">
            Welcome to BookHaven
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Find your next
            unforgettable book.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Browse timeless classics,
            modern bestsellers,
            technical books and stories
            worth adding to your shelf.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/books"
              className="rounded-xl bg-amber-600 px-6 py-3 font-extrabold text-white transition hover:bg-amber-500"
            >
              Browse Books
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-extrabold text-white transition hover:bg-white/10"
              >
                My Account
              </Link>
            ) : (
              <Link
                to="/register"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-extrabold text-white transition hover:bg-white/10"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="page-container">

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {/* Categories */}
        {categories.length >
          0 && (
          <section className="mt-4">
            <div>
              <p className="eyebrow">
                Explore
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                Browse by Category
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Jump directly into
                the topics that
                interest you.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categories.map(
                (category) => (
                  <CategoryCard
                    key={
                      category._id
                    }
                    category={
                      category
                    }
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* Featured */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">
                Recommended
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                Featured Books
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Hand-picked titles
                highlighted by
                BookHaven.
              </p>
            </div>

            <Link
              to="/books"
              className="btn-secondary"
            >
              Browse All Books
            </Link>
          </div>

          {loading ? (
            <FeaturedSkeleton />
          ) : featuredBooks.length ===
            0 ? (
            <div className="empty-state mt-6">
              <p className="font-bold text-stone-800">
                No featured books
                yet.
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Featured titles
                selected by the
                administrator will
                appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredBooks.map(
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
          )}
        </section>

        {/* Store Features */}
        <section className="mt-16 grid gap-5 md:grid-cols-3">
          <StoreFeature
            title="Curated Catalog"
            description="Browse carefully organized books across multiple categories."
          />

          <StoreFeature
            title="Secure Account"
            description="Your wishlist, cart and orders stay connected to your account."
          />

          <StoreFeature
            title="Simple Shopping"
            description="Discover books, compare prices and purchase from anywhere."
          />
        </section>
      </div>
    </main>
  );
}

function CategoryCard({
  category,
}) {
  return (
    <Link
      to={`/books?category=${category.slug}`}
      className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_5px_16px_rgba(41,37,36,0.04)] transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-lg font-black text-amber-800 transition group-hover:bg-amber-600 group-hover:text-white">
        {category.name
          ?.charAt(0)
          .toUpperCase()}
      </div>

      <h3 className="mt-4 font-extrabold text-stone-900">
        {category.name}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">
        {category.description ||
          "Explore books in this category."}
      </p>

      <p className="mt-4 text-xs font-bold text-amber-700">
        Explore →
      </p>
    </Link>
  );
}

function StoreFeature({
  title,
  description,
}) {
  return (
    <div className="store-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 font-black text-amber-300">
        ✓
      </div>

      <h3 className="mt-4 text-lg font-extrabold text-stone-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-stone-500">
        {description}
      </p>
    </div>
  );
}

function FeaturedSkeleton() {
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
            <div className="h-4 w-24 animate-pulse rounded bg-stone-100" />

            <div className="h-5 w-4/5 animate-pulse rounded bg-stone-100" />

            <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />

            <div className="h-7 w-24 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
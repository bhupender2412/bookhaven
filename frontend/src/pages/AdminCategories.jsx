import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/api";

function AdminCategories() {
  const [categories, setCategories] =
    useState([]);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      image: "",
    });

  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const fetchCategories =
    useCallback(async () => {
      try {
        setError("");

        const response =
          await api.get(
            "/categories/admin/all"
          );

        setCategories(
          response.data.categories ||
            []
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setError("");
    setMessage("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
    });

    setEditingCategory(null);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingCategory) {
        await api.patch(
          `/categories/${editingCategory._id}`,
          formData
        );

        setMessage(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/categories",
          formData
        );

        setMessage(
          "Category created successfully."
        );
      }

      resetForm();

      await fetchCategories();
    } catch (error) {
      const validationMessage =
        error.response?.data
          ?.errors?.[0]?.message;

      setError(
        validationMessage ||
          error.response?.data
            ?.message ||
          "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (
    category
  ) => {
    setEditingCategory(
      category
    );

    setFormData({
      name:
        category.name || "",

      description:
        category.description ||
        "",

      image:
        category.image || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeactivate =
    async (categoryId) => {
      const confirmed =
        window.confirm(
          "Deactivate this category?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        await api.delete(
          `/categories/${categoryId}`
        );

        setMessage(
          "Category deactivated successfully."
        );

        await fetchCategories();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to deactivate category"
        );
      }
    };

  const handleReactivate =
    async (categoryId) => {
      try {
        setError("");
        setMessage("");

        await api.patch(
          `/categories/${categoryId}`,
          {
            isActive: true,
          }
        );

        setMessage(
          "Category reactivated successfully."
        );

        await fetchCategories();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to reactivate category"
        );
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  const activeCount =
    categories.filter(
      (category) =>
        category.isActive
    ).length;

  const inactiveCount =
    categories.length -
    activeCount;

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

        {/* Header */}
        <section className="mt-6 rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white shadow-lg md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Catalog Administration
          </p>

          <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Category Management
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Organize the BookHaven
                catalog into meaningful
                collections used for
                browsing and filtering.
              </p>
            </div>

            <div className="flex gap-3">
              <Metric
                value={
                  categories.length
                }
                label="Total"
              />

              <Metric
                value={activeCount}
                label="Active"
              />

              <Metric
                value={inactiveCount}
                label="Inactive"
              />
            </div>
          </div>
        </section>

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

        <div className="mt-8 grid gap-8 lg:grid-cols-[390px_1fr]">

          {/* Category form */}
          <section className="store-card h-fit p-6">
            <p className="eyebrow">
              {editingCategory
                ? "Edit Category"
                : "New Category"}
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
              {editingCategory
                ? "Update category"
                : "Create category"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Categories will later
              power the storefront
              filters and navigation.
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7 space-y-5"
            >
              <div>
                <label className="form-label">
                  Category name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Example: Programming"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Describe this category..."
                  className="form-input resize-none"
                />
              </div>

              <div>
                <label className="form-label">
                  Image URL
                </label>

                <input
                  type="url"
                  name="image"
                  value={
                    formData.image
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional for now"
                  className="form-input"
                />

                <p className="mt-2 text-xs leading-5 text-stone-400">
                  Cloudinary image uploads
                  will replace manual URLs
                  later.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Create Category"}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="btn-secondary w-full"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </section>

          {/* Category list */}
          <section className="store-card overflow-hidden">
            <div className="border-b border-stone-200 px-6 py-5">
              <p className="eyebrow">
                Catalog Structure
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                All Categories
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                {categories.length}{" "}
                categor
                {categories.length ===
                1
                  ? "y"
                  : "ies"}{" "}
                in the store.
              </p>
            </div>

            {categories.length ===
            0 ? (
              <div className="p-10 text-center">
                <p className="font-bold text-stone-700">
                  No categories yet.
                </p>

                <p className="mt-2 text-sm text-stone-500">
                  Create your first
                  category using the
                  form.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {categories.map(
                  (category) => (
                    <CategoryRow
                      key={
                        category._id
                      }
                      category={
                        category
                      }
                      onEdit={
                        handleEdit
                      }
                      onDeactivate={
                        handleDeactivate
                      }
                      onReactivate={
                        handleReactivate
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDeactivate,
  onReactivate,
}) {
  return (
    <div className="p-6 transition hover:bg-stone-50/70">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl font-black text-amber-800">
            {category.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-stone-900">
                {category.name}
              </h3>

              {category.isActive ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-600">
                  Inactive
                </span>
              )}
            </div>

            <p className="mt-1 text-xs font-bold tracking-wide text-amber-700">
              /{category.slug}
            </p>

            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">
              {category.description ||
                "No description provided."}
            </p>

            {category.createdBy && (
              <p className="mt-3 text-xs text-stone-400">
                Created by{" "}
                {
                  category
                    .createdBy
                    .name
                }
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            onClick={() =>
              onEdit(
                category
              )
            }
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:border-amber-400 hover:text-amber-700"
          >
            Edit
          </button>

          {category.isActive ? (
            <button
              onClick={() =>
                onDeactivate(
                  category._id
                )
              }
              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={() =>
                onReactivate(
                  category._id
                )
              }
              className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
}) {
  return (
    <div className="min-w-[85px] rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default AdminCategories;
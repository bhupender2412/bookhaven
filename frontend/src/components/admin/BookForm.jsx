import {
  useEffect,
  useState,
} from "react";

import api from "../../api/api";

const emptyForm = {
  title: "",
  author: "",
  description: "",
  isbn: "",
  price: "",
  discountPrice: "",
  category: "",
  publisher: "",
  language: "English",
  pages: "",
  publicationYear: "",
  coverImage: "",
  stock: "",
  featured: false,
};

function BookForm({
  editingBook = null,
  onSaved,
  onCancel,
}) {
  const [formData, setFormData] =
    useState(emptyForm);

  const [categories, setCategories] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const isEditing =
    Boolean(editingBook);

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
        } catch (error) {
          setError(
            error.response?.data
              ?.message ||
              "Failed to load categories"
          );
        }
      };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!editingBook) {
      setFormData(
        emptyForm
      );

      return;
    }

    setFormData({
      title:
        editingBook.title || "",

      author:
        editingBook.author || "",

      description:
        editingBook.description ||
        "",

      isbn:
        editingBook.isbn || "",

      price:
        editingBook.price ??
        "",

      discountPrice:
        editingBook.discountPrice ??
        "",

      category:
        editingBook.category?._id ||
        editingBook.category ||
        "",

      publisher:
        editingBook.publisher ||
        "",

      language:
        editingBook.language ||
        "English",

      pages:
        editingBook.pages ??
        "",

      publicationYear:
        editingBook.publicationYear ??
        "",

      coverImage:
        editingBook.coverImage ||
        "",

      stock:
        editingBook.stock ??
        "",

      featured:
        Boolean(
          editingBook.featured
        ),
    });
  }, [editingBook]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

    setError("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    const payload = {
      title:
        formData.title,

      author:
        formData.author,

      description:
        formData.description,

      isbn:
        formData.isbn,

      price:
        Number(
          formData.price
        ),

      discountPrice:
        formData.discountPrice ===
        ""
          ? null
          : Number(
              formData.discountPrice
            ),

      category:
        formData.category,

      publisher:
        formData.publisher,

      language:
        formData.language,

      pages:
        formData.pages === ""
          ? null
          : Number(
              formData.pages
            ),

      publicationYear:
        formData.publicationYear ===
        ""
          ? null
          : Number(
              formData.publicationYear
            ),

      coverImage:
        formData.coverImage,

      stock:
        formData.stock === ""
          ? 0
          : Number(
              formData.stock
            ),

      featured:
        formData.featured,
    };

    try {
      if (isEditing) {
        await api.patch(
          `/books/${editingBook._id}`,
          payload
        );
      } else {
        await api.post(
          "/books",
          payload
        );
      }

      setFormData(
        emptyForm
      );

      await onSaved(
        isEditing
          ? "Book updated successfully."
          : "Book created successfully."
      );
    } catch (error) {
      const validationMessage =
        error.response?.data
          ?.errors?.[0]
          ?.message;

      setError(
        validationMessage ||
          error.response?.data
            ?.message ||
          (isEditing
            ? "Failed to update book"
            : "Failed to create book")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="store-card mt-8 overflow-hidden">
      <div className="border-b border-stone-200 px-6 py-5">
        <p className="eyebrow">
          {isEditing
            ? "Edit Product"
            : "New Product"}
        </p>

        <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
          {isEditing
            ? `Edit ${editingBook.title}`
            : "Add a book"}
        </h2>

        <p className="mt-2 text-sm text-stone-500">
          {isEditing
            ? "Update product information, pricing and inventory."
            : "Add a new title to the BookHaven catalog and inventory."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6"
      >
        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Book title"
            name="title"
            value={
              formData.title
            }
            onChange={
              handleChange
            }
            required
          />

          <FormField
            label="Author"
            name="author"
            value={
              formData.author
            }
            onChange={
              handleChange
            }
            required
          />

          <FormField
            label="ISBN"
            name="isbn"
            value={
              formData.isbn
            }
            onChange={
              handleChange
            }
            required
          />

          <div>
            <label className="form-label">
              Category
            </label>

            <select
              name="category"
              value={
                formData.category
              }
              onChange={
                handleChange
              }
              required
              className="form-input"
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category._id
                    }
                    value={
                      category._id
                    }
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          <FormField
            label="Regular price"
            name="price"
            type="number"
            value={
              formData.price
            }
            onChange={
              handleChange
            }
            min="0"
            required
          />

          <FormField
            label="Discount price"
            name="discountPrice"
            type="number"
            value={
              formData.discountPrice
            }
            onChange={
              handleChange
            }
            min="0"
          />

          <FormField
            label="Publisher"
            name="publisher"
            value={
              formData.publisher
            }
            onChange={
              handleChange
            }
          />

          <FormField
            label="Language"
            name="language"
            value={
              formData.language
            }
            onChange={
              handleChange
            }
          />

          <FormField
            label="Pages"
            name="pages"
            type="number"
            value={
              formData.pages
            }
            onChange={
              handleChange
            }
            min="1"
          />

          <FormField
            label="Publication year"
            name="publicationYear"
            type="number"
            value={
              formData.publicationYear
            }
            onChange={
              handleChange
            }
            min="1000"
          />

          <FormField
            label="Stock quantity"
            name="stock"
            type="number"
            value={
              formData.stock
            }
            onChange={
              handleChange
            }
            min="0"
          />

          <FormField
            label="Cover image URL"
            name="coverImage"
            type="url"
            value={
              formData.coverImage
            }
            onChange={
              handleChange
            }
          />
        </div>

        <div className="mt-5">
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
            rows={5}
            required
            minLength={20}
            className="form-input resize-none"
          />
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <input
            type="checkbox"
            name="featured"
            checked={
              formData.featured
            }
            onChange={
              handleChange
            }
            className="h-4 w-4"
          />

          <div>
            <p className="font-bold text-stone-800">
              Featured book
            </p>

            <p className="text-xs text-stone-500">
              Featured books can appear
              prominently on the storefront.
            </p>
          </div>
        </label>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Book"
                : "Create Book"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
}) {
  return (
    <div>
      <label className="form-label">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        className="form-input"
      />
    </div>
  );
}

export default BookForm;
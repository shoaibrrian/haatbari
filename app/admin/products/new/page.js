"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, getSubcategories } from "@/lib/categories";

function AdminDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  return (
    <div
      className="admin-custom-dropdown"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={`admin-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label || "Select"}</span>

        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="m7 10 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="admin-dropdown-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === value ? "selected" : ""}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>

              {option.value === value && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="m5 12 4 4L19 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: CATEGORIES[0].name,
    subcategory: CATEGORIES[0].items[0],
    image: "",
    stock: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subcategories = getSubcategories(form.category);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCategoryChange(category) {
    const nextSubcategories = getSubcategories(category);

    setForm((current) => ({
      ...current,
      category,
      subcategory: nextSubcategories[0] || "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          category: form.category,
          subcategory: form.subcategory,
          image: form.image.trim(),
          stock: Number(form.stock),
          isActive: form.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Could not create product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (createError) {
      setError(createError.message || "Could not create product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-new-product page-width">
      <header className="admin-new-product-header">
        <div>
          <Link href="/admin/products" className="admin-back">
            ← Products
          </Link>

          <span className="eyebrow">HaatBari · Catalogue</span>

          <h1>
            Add a product.
            <br />
            <em>Build your catalogue.</em>
          </h1>

          <p>Add a new product to your HaatBari storefront.</p>
        </div>
      </header>

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <span className="kicker">01 · Product details</span>
              <h2>Tell customers about it.</h2>
            </div>

            <span className="admin-form-number">01</span>
          </div>

          <div className="admin-form-fields">
            <label className="admin-field admin-field-full">
              <span>Product title</span>

              <input
                type="text"
                placeholder="e.g. Premium Wireless Headphones"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
                maxLength={200}
              />
            </label>

            <label className="admin-field admin-field-full">
              <span>Description</span>

              <textarea
                placeholder="Describe the product, its features and what makes it useful..."
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                required
                maxLength={2000}
                rows={6}
              />

              <small>{form.description.length}/2000</small>
            </label>

            <div className="admin-field">
              <span>Category</span>

              <AdminDropdown
                value={form.category}
                onChange={handleCategoryChange}
                options={CATEGORIES.map((item) => ({
                  value: item.name,
                  label: item.name,
                }))}
              />
            </div>

            <div className="admin-field">
              <span>Subcategory</span>

              <AdminDropdown
                value={form.subcategory}
                onChange={(value) => updateField("subcategory", value)}
                options={subcategories.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </div>

            <label className="admin-field">
              <span>Price</span>

              <div className="admin-input-prefix">
                <b>৳</b>

                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="admin-field">
              <span>Stock quantity</span>

              <input
                type="number"
                placeholder="0"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                required
              />
            </label>

            <label className="admin-field admin-field-full">
              <span>Product image URL</span>

              <input
                type="url"
                placeholder="https://example.com/product-image.jpg"
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
                required
              />

              <small>Use a direct URL to the product image.</small>
            </label>
          </div>
        </section>

        <section className="admin-form-card admin-publish-card">
          <div className="admin-form-card-head">
            <div>
              <span className="kicker">02 · Visibility</span>
              <h2>Choose where it appears.</h2>
            </div>

            <span className="admin-form-number">02</span>
          </div>

          <button
            type="button"
            className={`admin-publish-toggle ${form.isActive ? "enabled" : ""}`}
            onClick={() => updateField("isActive", !form.isActive)}
          >
            <span className="admin-toggle-track">
              <i />
            </span>

            <span>
              <strong>{form.isActive ? "Published" : "Draft"}</strong>

              <small>
                {form.isActive
                  ? "This product will be visible in the storefront."
                  : "This product will stay hidden from customers."}
              </small>
            </span>
          </button>
        </section>

        {error && (
          <div className="admin-form-error">
            <span>{error}</span>
          </div>
        )}

        <div className="admin-form-actions">
          <Link href="/admin/products" className="admin-form-cancel">
            Cancel
          </Link>

          <button
            type="submit"
            className="button button-dark admin-form-submit"
            disabled={saving}
          >
            {saving ? "Creating..." : "Create product"}
            <span>{saving ? "…" : "↗"}</span>
          </button>
        </div>
      </form>
    </main>
  );
}

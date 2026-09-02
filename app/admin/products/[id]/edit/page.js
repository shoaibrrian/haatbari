"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { CATEGORIES, getSubcategories } from "@/lib/categories";
import { clearProductCache } from "@/lib/products-cache";

function AdminDropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function closeDropdown(event) {
      if (!event.target.closest(".admin-custom-dropdown")) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDropdown);

    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, []);

  return (
    <div className="admin-custom-dropdown">
      <button
        type="button"
        className={`admin-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label || placeholder}</span>

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
              type="button"
              key={option.value}
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

export default function EditProductPage({ params }) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [images, setImages] = useState([]);

  const subcategories = useMemo(() => getSubcategories(category), [category]);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Could not load product.");
        }

        const product = result?.data;

        if (!active) return;

        setTitle(product?.title || "");
        setDescription(product?.description || "");
        setPrice(product?.price ?? "");
        setStock(product?.stock ?? 0);
        setCategory(product?.category || "");
        setSubcategory(product?.subcategory || "");
        setIsActive(product?.isActive !== false);

        const productImages = [
          product?.image,
          ...(Array.isArray(product?.images) ? product.images : []),
        ].filter(Boolean);

        setImages(
          [...new Set(productImages)].map((url, index) => ({
            url,
            publicId: "",
            isExisting: true,
            id: `${url}-${index}`,
          })),
        );
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Could not load product.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const remaining = 8 - images.length;

    if (remaining <= 0) {
      window.alert("A product can have up to 8 images.");
      event.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remaining);

    setUploading(true);
    setError("");

    try {
      const uploaded = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Image upload failed.");
        }

        if (result?.data?.url) {
          uploaded.push({
            url: result.data.url,
            publicId: result.data.publicId || "",
            isExisting: false,
            id: `${result.data.url}-${Date.now()}-${Math.random()}`,
          });
        }
      }

      setImages((current) => [...current, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(imageId) {
    setImages((current) => current.filter((image) => image.id !== imageId));
  }

  function handleCategoryChange(value) {
    setCategory(value);

    const allowed = getSubcategories(value);

    if (!allowed.includes(subcategory)) {
      setSubcategory("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!title.trim()) {
        throw new Error("Product title is required.");
      }

      if (!description.trim()) {
        throw new Error("Product description is required.");
      }

      if (!category) {
        throw new Error("Please select a category.");
      }

      if (!subcategory) {
        throw new Error("Please select a subcategory.");
      }

      if (!price || Number(price) < 0) {
        throw new Error("Please enter a valid price.");
      }

      if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
        throw new Error("Stock must be a whole number.");
      }

      if (!images.length) {
        throw new Error("Please add at least one product image.");
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          subcategory,
          image: images[0].url,
          images: images.map((image) => image.url),
          stock: Number(stock),
          isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Could not update product.");
      }

      clearProductCache();

      setSuccess("Product updated successfully.");

      window.setTimeout(() => {
        window.location.href = "/admin/products";
      }, 700);
    } catch (saveError) {
      setError(saveError.message || "Could not update product.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-product-form page-width">
        <div className="empty-state">Loading product...</div>
      </main>
    );
  }

  if (error && !title && !loading) {
    return (
      <main className="admin-product-form page-width">
        <Link href="/admin/products" className="admin-back">
          ← Products
        </Link>

        <div className="admin-product-error">
          <span>{error}</span>

          <Link href="/admin/products">Back to products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-product-form page-width">
      {/* HEADER */}
      <header className="admin-form-header">
        <div>
          <Link href="/admin/products" className="admin-back">
            ← Products
          </Link>

          <span className="eyebrow">HaatBari · Catalogue</span>

          <h1>
            Edit product.
            <br />
            <em>Keep the details current.</em>
          </h1>

          <p>
            Update the product information, images, pricing and availability.
          </p>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="admin-product-error">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {success && <div className="admin-product-success">{success}</div>}

      <form className="admin-product-form-card" onSubmit={handleSubmit}>
        {/* BASIC DETAILS */}
        <section className="admin-form-section">
          <div className="admin-form-section-heading">
            <span className="kicker">01 · Details</span>

            <h2>Product information</h2>

            <p>Keep the product title and description clear and useful.</p>
          </div>

          <div className="admin-form-fields">
            <label className="admin-form-field full">
              <span>Product title</span>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Air Jordan 4 Retro"
                maxLength={200}
              />
            </label>

            <label className="admin-form-field full">
              <span>Description</span>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the product..."
                rows={6}
                maxLength={2000}
              />
            </label>
          </div>
        </section>

        {/* CATEGORY */}
        <section className="admin-form-section">
          <div className="admin-form-section-heading">
            <span className="kicker">02 · Classification</span>

            <h2>Category & subcategory</h2>

            <p>
              Choose the correct category so customers can find the product
              easily.
            </p>
          </div>

          <div className="admin-form-fields">
            <div className="admin-form-field">
              <span>Category</span>

              <AdminDropdown
                value={category}
                onChange={handleCategoryChange}
                placeholder="Select category"
                options={CATEGORIES.map((item) => ({
                  value: item.name,
                  label: item.name,
                }))}
              />
            </div>

            <div className="admin-form-field">
              <span>Subcategory</span>

              <AdminDropdown
                value={subcategory}
                onChange={setSubcategory}
                placeholder={
                  category ? "Select subcategory" : "Select category first"
                }
                options={subcategories.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </div>
          </div>
        </section>

        {/* PRICE & STOCK */}
        <section className="admin-form-section">
          <div className="admin-form-section-heading">
            <span className="kicker">03 · Commerce</span>

            <h2>Price & inventory</h2>

            <p>Set the current selling price and available stock.</p>
          </div>

          <div className="admin-form-fields">
            <label className="admin-form-field">
              <span>Price</span>

              <div className="admin-price-input">
                <span>৳</span>

                <input
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </label>

            <label className="admin-form-field">
              <span>Stock</span>

              <input
                type="number"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                placeholder="0"
                min="0"
                step="1"
              />
            </label>
          </div>
        </section>

        {/* IMAGES */}
        <section className="admin-form-section">
          <div className="admin-form-section-heading">
            <span className="kicker">04 · Visuals</span>

            <h2>Product images</h2>

            <p>The first image will be used as the main product image.</p>
          </div>

          <div className="admin-image-upload">
            <label
              className={`admin-image-upload-box ${
                uploading ? "uploading" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={uploading || images.length >= 8}
                onChange={handleImageUpload}
              />

              <span className="admin-image-upload-icon">
                {uploading ? "…" : "+"}
              </span>

              <strong>
                {uploading
                  ? "Uploading images..."
                  : images.length >= 8
                    ? "Maximum 8 images added"
                    : "Add product images"}
              </strong>

              <small>JPG, PNG, WEBP · Up to 8 images</small>
            </label>

            {images.length > 0 && (
              <div className="admin-image-preview-grid">
                {images.map((image, index) => (
                  <div className="admin-image-preview" key={image.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={`${title || "Product"} ${index + 1}`}
                    />

                    {index === 0 && (
                      <span className="admin-image-primary">Main image</span>
                    )}

                    <button
                      type="button"
                      className="admin-image-remove"
                      onClick={() => removeImage(image.id)}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="admin-image-help">
              Images are uploaded securely to Cloudinary. The first image is
              saved as the primary product image.
            </p>
          </div>
        </section>

        {/* STATUS */}
        <section className="admin-form-section">
          <div className="admin-form-section-heading">
            <span className="kicker">05 · Visibility</span>

            <h2>Storefront status</h2>

            <p>Control whether this product is visible to customers.</p>
          </div>

          <label className="admin-status-toggle">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />

            <span className="admin-toggle-ui">
              <i />
            </span>

            <span>
              <strong>
                {isActive ? "Product is active" : "Product is inactive"}
              </strong>

              <small>
                {isActive
                  ? "Customers can see and purchase this product."
                  : "This product is hidden from the storefront."}
              </small>
            </span>
          </label>
        </section>

        {/* ACTIONS */}
        <div className="admin-form-actions">
          <Link href="/admin/products" className="button button-light">
            Cancel
          </Link>

          <button
            type="submit"
            className="button button-dark"
            disabled={saving || uploading}
          >
            {saving ? "Saving..." : "Save changes"}

            <span>{saving ? "…" : "↗"}</span>
          </button>
        </div>
      </form>
    </main>
  );
}

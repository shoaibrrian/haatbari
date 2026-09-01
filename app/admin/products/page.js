"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const CATEGORIES = ["All", "Electronics", "Apparel", "Footwear", "Accessories"];

function taka(value) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");

  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products?limit=60", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Could not load products.");
      }

      setProducts(Array.isArray(result?.data) ? result.data : []);
    } catch (loadError) {
      setError(loadError.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        String(product.title || "")
          .toLowerCase()
          .includes(term) ||
        String(product.category || "")
          .toLowerCase()
          .includes(term);

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesStatus =
        status === "all" ||
        (status === "active" && product.isActive !== false) ||
        (status === "inactive" && product.isActive === false);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, query, category, status]);

  const activeCount = products.filter(
    (product) => product.isActive !== false,
  ).length;

  const inactiveCount = products.length - activeCount;

  async function deactivateProduct(product) {
    const confirmed = window.confirm(
      `Deactivate "${product.title}"? It will no longer appear in the storefront.`,
    );

    if (!confirmed) return;

    setDeletingId(product.id);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Could not deactivate product.");
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, isActive: false } : item,
        ),
      );
    } catch (deleteError) {
      window.alert(deleteError.message || "Could not deactivate this product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="admin-products page-width">
      {/* HEADER */}

      <header className="admin-products-header">
        <div>
          <Link href="/admin" className="admin-back">
            ← Dashboard
          </Link>

          <span className="eyebrow">HaatBari · Catalogue</span>

          <h1>
            Manage products.
            <br />
            <em>Your complete catalogue.</em>
          </h1>

          <p>
            Add, edit and manage everything available in your HaatBari
            storefront.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="button button-dark admin-add-product"
        >
          Add product
          <span>+</span>
        </Link>
      </header>

      {/* OVERVIEW */}

      <section className="admin-product-overview">
        <div>
          <span className="kicker">Catalogue</span>
          <strong>{products.length}</strong>
          <p>Total products</p>
        </div>

        <div>
          <span className="kicker">Published</span>
          <strong>{activeCount}</strong>
          <p>Visible in storefront</p>
        </div>

        <div>
          <span className="kicker">Inactive</span>
          <strong>{inactiveCount}</strong>
          <p>Hidden from storefront</p>
        </div>
      </section>

      {/* CONTROLS */}

      <section className="admin-product-controls">
        <div className="admin-product-search">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle
              cx="11"
              cy="11"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M16 16l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="search"
            placeholder="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {query && (
            <button type="button" onClick={() => setQuery("")}>
              ×
            </button>
          )}
        </div>

        <div className="admin-product-filter-group">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((item) => (
              <option value={item} key={item}>
                {item === "All" ? "All categories" : item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </section>

      {/* RESULT INFO */}

      <div className="admin-product-result">
        <span>
          {loading
            ? "Loading catalogue…"
            : `${filteredProducts.length} ${
                filteredProducts.length === 1 ? "product" : "products"
              }`}
        </span>

        {(query || category !== "All" || status !== "all") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setStatus("all");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="admin-product-error">
          <span>{error}</span>

          <button type="button" onClick={loadProducts}>
            Try again
          </button>
        </div>
      )}

      {/* PRODUCTS */}

      {!loading && !error && filteredProducts.length === 0 ? (
        <div className="admin-product-empty">
          <span className="admin-empty-symbol">□</span>

          <h2>No products found.</h2>

          <p>
            {products.length === 0
              ? "Your catalogue is empty. Add your first product to get started."
              : "Try changing your search or filters."}
          </p>

          {products.length === 0 ? (
            <Link href="/admin/products/new" className="button button-dark">
              Add your first product
              <span>+</span>
            </Link>
          ) : (
            <button
              type="button"
              className="button button-dark"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setStatus("all");
              }}
            >
              Show all products
              <span>↗</span>
            </button>
          )}
        </div>
      ) : (
        <section className="admin-product-table-wrap">
          <div className="admin-product-table-head">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span />
          </div>

          <div className="admin-product-table">
            {filteredProducts.map((product) => {
              const active = product.isActive !== false;
              const stock = Number(product.stock || 0);

              return (
                <article className="admin-product-row" key={product.id}>
                  <div className="admin-product-info">
                    <div className="admin-product-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.title}
                      />
                    </div>

                    <div>
                      <h3>{product.title}</h3>

                      <p>ID · {String(product.id || "").slice(-8)}</p>
                    </div>
                  </div>

                  <div className="admin-product-category">
                    {product.category || "Other"}
                  </div>

                  <div className="admin-product-price">
                    <span>৳</span>
                    {taka(product.price)}
                  </div>

                  <div
                    className={
                      stock === 0
                        ? "admin-product-stock out"
                        : stock <= 5
                          ? "admin-product-stock low"
                          : "admin-product-stock"
                    }
                  >
                    {stock}
                    {stock === 0 && <small>Out</small>}
                    {stock > 0 && stock <= 5 && <small>Low</small>}
                  </div>

                  <div>
                    <span
                      className={
                        active
                          ? "admin-product-status active"
                          : "admin-product-status inactive"
                      }
                    >
                      <i />
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="admin-product-actions">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="admin-product-edit"
                    >
                      Edit
                      <span>↗</span>
                    </Link>

                    {active && (
                      <button
                        type="button"
                        className="admin-product-delete"
                        disabled={deletingId === product.id}
                        onClick={() => deactivateProduct(product)}
                      >
                        {deletingId === product.id ? "..." : "Deactivate"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";

export default function ProductPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch("/api/products");
        const products = await response.json();
        const match = products.find((item) => (item._id || item.id) === id);
        setProduct(match || null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading)
    return (
      <main className="product-page page-width">
        <div className="empty-state">Finding that piece...</div>
      </main>
    );
  if (!product)
    return (
      <main className="product-page page-width">
        <div className="empty-state">
          That product is no longer in the market.
        </div>
        <Link href="/" className="button button-dark">
          Back to shop <span>↗</span>
        </Link>
      </main>
    );

  const cartProduct = {
    id: product._id || product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
  };

  function handleAdd() {
    addToCart(cartProduct);
    setAdded(true);
  }

  return (
    <main className="product-page page-width">
      <Link href="/" className="back-link">
        ← Back to the market
      </Link>
      <div className="product-detail-grid">
        <div className="product-detail-image">
          {/* Product image hosts are user-configurable, so keep native image loading. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image || "/placeholder.png"} alt={product.title} />
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{product.category || "From the community"}</p>
          <h1>{product.title}</h1>
          <p className="detail-price">৳{product.price}</p>
          <p className="detail-description">
            {product.description ||
              "A considered find, selected from an independent maker in Bangladesh."}
          </p>
          <div className="detail-rule" />
          <p className="detail-note">
            <strong>Why it matters</strong>
            <br />
            Your purchase supports a local maker and keeps useful, beautiful
            work in circulation.
          </p>
          <button
            type="button"
            className="button button-dark detail-add"
            onClick={handleAdd}
          >
            {added ? "Added to cart" : "Add to cart"}{" "}
            <span>{added ? "✓" : "↗"}</span>
          </button>
          {added && (
            <Link href="/cart" className="view-cart-link">
              View your cart →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

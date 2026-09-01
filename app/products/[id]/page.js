"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import { apiFetch } from "@/lib/api-client";

export default function ProductPage({ params }) {
  const { id } = use(params);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      try {
        const { data } = await apiFetch(`/api/products/${id}`);

        if (mounted) {
          setProduct(data);
          setActiveImage(data?.image || data?.images?.[0] || "");
        }
      } catch {
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const productImages = useMemo(() => {
    if (!product) return [];

    const images = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : [];

    const allImages = [product.image, ...images].filter(Boolean);

    return [...new Set(allImages)];
  }, [product]);

  useEffect(() => {
    if (productImages.length > 0) {
      setActiveImage((current) =>
        productImages.includes(current) ? current : productImages[0],
      );
    }
  }, [productImages]);

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
        <div className="product-detail-gallery">
          <div className="product-detail-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeImage || "/placeholder.png"} alt={product.title} />
          </div>

          {productImages.length > 1 && (
            <div className="product-detail-thumbnails">
              {productImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={
                    activeImage === image
                      ? "product-detail-thumbnail active"
                      : "product-detail-thumbnail"
                  }
                  onClick={() => setActiveImage(image)}
                  aria-label={`View product image ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
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

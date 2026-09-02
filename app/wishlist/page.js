"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { EASE, rise } from "@/components/Motion";
import { addToCart } from "@/lib/cart";
import { getProducts } from "@/lib/products-cache";
import {
  getWishlist,
  removeFromWishlist as removeWishlistItem,
} from "@/lib/wishlist";

import { useAuth } from "@clerk/nextjs";

const AMBIENTS = [
  "var(--amb-3)",
  "var(--amb-2)",
  "var(--amb-1)",
  "var(--amb-4)",
  "var(--amb-5)",
];

function taka(value) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export default function WishlistPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [products, setProducts] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    async function loadWishlist() {
      if (!isSignedIn) {
        setSaved([]);
        return;
      }

      try {
        const wishlist = await getWishlist();

        setSaved(wishlist.items?.map((item) => String(item.productId)) || []);
      } catch (error) {
        console.error("Wishlist load error:", error);
        setSaved([]);
      }
    }

    loadWishlist();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Wishlist products error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const wishlistProducts = useMemo(() => {
    return products.filter((product) => saved.includes(product.id));
  }, [products, saved]);

  const removeFromWishlist = async (id) => {
    try {
      await removeWishlistItem(id);

      setSaved((current) => current.filter((item) => item !== id));

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.error("Wishlist remove error:", error);
    }
  };

  const add = (product) => {
    if (!product.inStock) return;

    addToCart({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
    });

    setAddedId(product.id);

    setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1500);
  };

  return (
    <main className="subpage wishlist-page">
      {/* HEADER */}
      <section className="about-intro shop-intro">
        <div className="shell">
          <motion.span className="eyebrow" {...rise()}>
            HaatBari · Wishlist
          </motion.span>

          <motion.h1 {...rise(0.08)}>
            Things you&apos;d love
            <br />
            <em>to bring home.</em>
          </motion.h1>

          <motion.p className="intro-text" {...rise(0.16)}>
            Keep your favourite products here and come back whenever you&apos;re
            ready to buy.
          </motion.p>
        </div>
      </section>

      {/* WISHLIST */}
      <section className="band shop-band">
        <div className="shell">
          <motion.div className="shop-toolbar" {...rise()}>
            <div className="shop-title">
              <p className="kicker">Saved products</p>
              <h2>
                {saved.length === 0
                  ? "Your wishlist is empty"
                  : `${saved.length} ${
                      saved.length === 1 ? "item" : "items"
                    } saved`}
              </h2>
            </div>

            <Link href="/shop" className="btn btn-line btn-sm">
              Continue shopping
            </Link>
          </motion.div>

          {loading ? (
            <div className="empty-state">Loading your wishlist…</div>
          ) : wishlistProducts.length === 0 ? (
            <motion.div className="empty-state shop-empty" {...rise(0.08)}>
              <strong>Your wishlist is empty</strong>

              <span>Save products from the shop by clicking the ♡ icon.</span>

              <Link href="/shop" className="btn btn-ink btn-sm">
                Browse products
              </Link>
            </motion.div>
          ) : (
            <div className="catalog">
              {wishlistProducts.map((product, index) => (
                <motion.article
                  className="prod"
                  key={product.id}
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: 0.04 * (index % 3),
                      ease: EASE,
                    },
                  }}
                  whileHover={{
                    y: -6,
                  }}
                >
                  <div
                    className="prod-art"
                    style={{
                      "--amb": AMBIENTS[index % AMBIENTS.length],
                    }}
                  >
                    <Link href={`/products/${product.slug || product.id}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.title}
                      />
                    </Link>

                    {!product.inStock && (
                      <div className="product-badges">
                        <span className="product-badge sold">Sold out</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="save"
                      aria-label={`Remove ${product.title} from wishlist`}
                      aria-pressed="true"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      ♥
                    </button>
                  </div>

                  <div className="prod-in">
                    <div className="prod-main">
                      <Link href={`/products/${product.slug || product.id}`}>
                        <h3>{product.title}</h3>
                      </Link>

                      <p className="prod-meta">
                        {product.category || "Marketplace"}
                        <em>·</em>
                        {product.inStock ? "In stock" : "Out of stock"}
                      </p>
                    </div>

                    <div className="prod-right">
                      <span className="price n">
                        <span className="tk">৳</span>
                        {taka(product.price)}
                      </span>

                      <motion.button
                        type="button"
                        className={addedId === product.id ? "buy done" : "buy"}
                        disabled={!product.inStock}
                        whileTap={{
                          scale: 0.94,
                        }}
                        onClick={() => add(product)}
                      >
                        {addedId === product.id
                          ? "Added"
                          : product.inStock
                            ? "Add"
                            : "Sold out"}
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

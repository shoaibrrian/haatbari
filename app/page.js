"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { addToCart } from "@/lib/cart";
import { apiFetch } from "@/lib/api-client";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await apiFetch("/api/products?limit=60");
        if (mounted) setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = async () => {
    const res = await fetch("/api/ai-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setProducts(data);
  };

  return (
    <main>
      <section className="hero-band">
        <div className="page-width hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">A marketplace for our society</p>
            <h1 className="hero-heading text-black">
              Made nearby.
              <br />
              <em>Meant to last.</em>
            </h1>
            <p className="hero-lede mb-6 text-black">
              Discover thoughtful goods from Bangladesh&apos;s independent
              makers, family businesses, and growers.
            </p>
            <a href="#market" className="button button-dark">
              Explore the market <span>↓</span>
            </a>
          </div>
          <div className="hero-stamp" aria-label="Proudly from Bangladesh">
            <span>HAATBARI</span>
            <strong>
              From our
              <br />
              hands to
              <br />
              your home.
            </strong>
            <small>EST. 2026 · BANGLADESH</small>
          </div>
        </div>
      </section>

      <section className="market-section page-width" id="market">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The weekly edit</p>
            <h2>Good things, gathered.</h2>
          </div>
          <div className="search-box">
            <input
              value={query}
              type="search"
              placeholder="Search the market"
              aria-label="Search the market"
              onChange={(e) => setQuery(e.target.value)}
            />
            <button aria-label="Search products" onClick={handleSearch}>
              ↗
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Gathering the market...</div>
        ) : error ? (
          <div className="empty-state">
            We couldn&apos;t reach the market just now: {error}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            No finds yet. Try a different search.
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <article key={p._id || p.id} className="product-card">
                <Link
                  href={`/products/${p._id || p.id}`}
                  className="product-image"
                >
                  {/* Product image hosts are user-configurable, so keep native image loading. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image || "/placeholder.png"} alt={p.title} />
                </Link>
                <div className="product-info">
                  <p className="product-category">
                    {p.category || "From the community"}
                  </p>
                  <h2>{p.title}</h2>
                  <p className="product-description">{p.description}</p>
                  <div className="product-bottom">
                    <span className="price">৳{p.price}</span>
                    <button
                      type="button"
                      className="add-button"
                      aria-label={`Add ${p.title} to cart`}
                      onClick={() =>
                        addToCart({
                          id: p._id || p.id,
                          title: p.title,
                          description: p.description,
                          price: p.price,
                          category: p.category,
                          image: p.image,
                        })
                      }
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

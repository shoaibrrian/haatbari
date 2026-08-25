"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { addToCart } from "@/lib/cart";
import { apiFetch } from "@/lib/api-client";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const inFlight = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadCatalogue() {
      try {
        const { data } = await apiFetch("/api/products?limit=60", {
          signal: controller.signal,
        });
        if (active) setProducts(data);
      } catch (loadError) {
        if (active && loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalogue();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const runSearch = useCallback(async (rawQuery) => {
    const term = rawQuery.trim();

    inFlight.current?.abort();

    if (!term) {
      inFlight.current = null;
      setResults(null);
      setSearchMeta(null);
      setSearching(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    inFlight.current = controller;
    setSearching(true);
    setError(null);

    try {
      const { data, meta } = await apiFetch(
        `/api/search?q=${encodeURIComponent(term)}`,
        { signal: controller.signal },
      );
      setResults(data);
      setSearchMeta(meta);
    } catch (searchError) {
      if (searchError.name === "AbortError") return;
      setResults([]);
      setSearchMeta(null);
      setError(searchError.message);
    } finally {
      if (inFlight.current === controller) setSearching(false);
    }
  }, []);

  const clearSearch = () => {
    setQuery("");
    runSearch("");
  };

  const visible = results ?? products;

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
          <form
            className="search-box"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch(query);
            }}
          >
            <input
              value={query}
              type="search"
              placeholder="Search the market"
              aria-label="Search the market"
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" aria-label="Search products">
              ↗
            </button>
          </form>
        </div>

        {results !== null && !searching && !error && (
          <p className="mb-6 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
            <span>
              {results.length === 0
                ? `Nothing matched “${searchMeta?.query ?? query}”.`
                : `${results.length} ${
                    results.length === 1 ? "find" : "finds"
                  } for “${searchMeta?.query ?? query}”`}
              {searchMeta?.strategy === "loose" && results.length > 0
                ? " — closest matches"
                : ""}
            </span>
            <button type="button" className="underline" onClick={clearSearch}>
              Show everything
            </button>
          </p>
        )}

        {loading ? (
          <div className="empty-state">Gathering the market...</div>
        ) : searching ? (
          <div className="empty-state">Looking through the market...</div>
        ) : error ? (
          <div className="empty-state">
            We couldn&apos;t reach the market just now: {error}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            {results !== null
              ? "Try a different word, or browse everything above."
              : "No finds yet."}
          </div>
        ) : (
          <div className="product-grid">
            {visible.map((p) => (
              <article key={p.id} className="product-card">
                <Link
                  href={`/products/${p.slug || p.id}`}
                  className="product-image"
                >
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
                    <span className="price">৳{p.price.toFixed(2)}</span>
                    <button
                      type="button"
                      className="add-button"
                      disabled={!p.inStock}
                      aria-label={
                        p.inStock
                          ? `Add ${p.title} to cart`
                          : `${p.title} is out of stock`
                      }
                      onClick={() =>
                        addToCart({
                          id: p.id,
                          title: p.title,
                          description: p.description,
                          price: p.price,
                          category: p.category,
                          image: p.image,
                        })
                      }
                    >
                      {p.inStock ? "+ Add" : "Sold out"}
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

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE, rise } from "@/components/Motion";
import { addToCart } from "@/lib/cart";
import { getProducts } from "@/lib/products-cache";
import { apiFetch } from "@/lib/api-client";
import { readWishlist, toggleWishlist } from "@/lib/wishlist";

const AMBIENTS = [
  "var(--amb-3)",
  "var(--amb-2)",
  "var(--amb-1)",
  "var(--amb-4)",
  "var(--amb-5)",
];

const PAGE_SIZE = 12;

function taka(value) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function getProductPrice(product) {
  return Number(product.price || 0);
}

function getOriginalPrice(product) {
  return Number(
    product.originalPrice || product.compareAtPrice || product.oldPrice || 0,
  );
}

function isNewProduct(product) {
  if (product.isNew !== undefined) return Boolean(product.isNew);

  if (!product.createdAt) return false;

  const created = new Date(product.createdAt).getTime();

  if (Number.isNaN(created)) return false;

  return Date.now() - created < 1000 * 60 * 60 * 24 * 30;
}

function isSaleProduct(product) {
  const original = getOriginalPrice(product);
  const price = getProductPrice(product);

  return original > price && price > 0;
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [stockFilter, setStockFilter] = useState("all");
  const [sort, setSort] = useState("featured");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const [addedId, setAddedId] = useState(null);
  const [saved, setSaved] = useState([]);
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    const updateWishlist = () => {
      setSaved(readWishlist());
    };

    updateWishlist();

    window.addEventListener("wishlist-updated", updateWishlist);

    return () => {
      window.removeEventListener("wishlist-updated", updateWishlist);
    };
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  const inFlight = useRef(null);

  /* ---------------------------------
     LOAD PRODUCTS
  --------------------------------- */

  useEffect(() => {
    let active = true;

    async function loadCatalogue() {
      try {
        const data = await getProducts();

        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCatalogue();

    return () => {
      active = false;
    };
  }, []);

  /* ---------------------------------
     URL → INITIAL FILTERS
  --------------------------------- */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlQuery = params.get("q") || "";
    const urlCategory = params.get("category") || "";
    const urlMin = params.get("min") || "";
    const urlMax = params.get("max") || "";
    const urlStock = params.get("stock") || "all";
    const urlSort = params.get("sort") || "featured";
    const urlPage = Number(params.get("page") || 1);

    setQuery(urlQuery);
    setActiveCat(urlCategory);
    setMinPrice(urlMin);
    setMaxPrice(urlMax);

    if (["all", "in", "out"].includes(urlStock)) {
      setStockFilter(urlStock);
    }

    setSort(
      ["featured", "price-low", "price-high", "name", "newest"].includes(
        urlSort,
      )
        ? urlSort
        : "featured",
    );

    setPage(Number.isFinite(urlPage) && urlPage > 0 ? urlPage : 1);

    if (urlQuery) {
      runSearchFromUrl(urlQuery);
    }
  }, []);

  const runSearchFromUrl = useCallback(async (rawQuery) => {
    const term = rawQuery.trim();

    if (!term) return;

    const controller = new AbortController();

    inFlight.current?.abort();
    inFlight.current = controller;

    setSearching(true);
    setError(null);

    try {
      const { data, meta } = await apiFetch(
        `/api/search?q=${encodeURIComponent(term)}`,
        {
          signal: controller.signal,
        },
      );

      setResults(Array.isArray(data) ? data : []);
      setSearchMeta(meta || null);
    } catch (searchError) {
      if (searchError.name === "AbortError") return;

      setResults([]);
      setSearchMeta(null);
      setError(searchError.message);
    } finally {
      if (inFlight.current === controller) {
        setSearching(false);
      }
    }
  }, []);

  /* ---------------------------------
     SEARCH
  --------------------------------- */

  const runSearch = useCallback(async (rawQuery) => {
    const term = rawQuery.trim();

    inFlight.current?.abort();

    if (!term) {
      inFlight.current = null;
      setResults(null);
      setSearchMeta(null);
      setSearching(false);
      setError(null);
      setPage(1);
      return;
    }

    const controller = new AbortController();

    inFlight.current = controller;

    setSearching(true);
    setError(null);
    setPage(1);

    try {
      const { data, meta } = await apiFetch(
        `/api/search?q=${encodeURIComponent(term)}`,
        {
          signal: controller.signal,
        },
      );

      setResults(Array.isArray(data) ? data : []);
      setSearchMeta(meta || null);
    } catch (searchError) {
      if (searchError.name === "AbortError") return;

      setResults([]);
      setSearchMeta(null);
      setError(searchError.message);
    } finally {
      if (inFlight.current === controller) {
        setSearching(false);
      }
    }
  }, []);

  /* ---------------------------------
     URL SYNC
  --------------------------------- */

  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (activeCat) params.set("category", activeCat);
    if (minPrice !== "") params.set("min", minPrice);
    if (maxPrice !== "") params.set("max", maxPrice);
    if (stockFilter !== "all") params.set("stock", stockFilter);
    if (sort !== "featured") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();

    window.history.replaceState(
      null,
      "",
      queryString ? `/shop?${queryString}` : "/shop",
    );
  }, [query, activeCat, minPrice, maxPrice, stockFilter, sort, page, loading]);

  /* ---------------------------------
     CATEGORIES
  --------------------------------- */

  const categories = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      const name = product.category || "Other";
      map.set(name, (map.get(name) || 0) + 1);
    });

    return [...map.entries()]
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  /* ---------------------------------
     FILTER + SORT
  --------------------------------- */

  const searched = results ?? products;

  const filteredProducts = useMemo(() => {
    let list = [...searched];

    if (activeCat) {
      list = list.filter(
        (product) => (product.category || "Other") === activeCat,
      );
    }

    const minimum = minPrice === "" ? null : Number.parseFloat(minPrice);

    const maximum = maxPrice === "" ? null : Number.parseFloat(maxPrice);

    if (minimum !== null && !Number.isNaN(minimum)) {
      list = list.filter((product) => getProductPrice(product) >= minimum);
    }

    if (maximum !== null && !Number.isNaN(maximum)) {
      list = list.filter((product) => getProductPrice(product) <= maximum);
    }

    if (stockFilter === "in") {
      list = list.filter((product) => product.inStock);
    }

    if (stockFilter === "out") {
      list = list.filter((product) => !product.inStock);
    }

    if (sort === "price-low") {
      list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    }

    if (sort === "price-high") {
      list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    if (sort === "name") {
      list.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || "")),
      );
    }

    if (sort === "newest") {
      list.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();

        return bDate - aDate;
      });
    }

    return list;
  }, [searched, activeCat, minPrice, maxPrice, stockFilter, sort]);

  /* ---------------------------------
     PAGINATION
  --------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  const safePage = Math.min(page, totalPages);

  const visible = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* ---------------------------------
     FILTER HELPERS
  --------------------------------- */

  const hasFilters =
    activeCat ||
    minPrice !== "" ||
    maxPrice !== "" ||
    stockFilter !== "all" ||
    sort !== "featured";

  const clearFilters = () => {
    setActiveCat("");
    setMinPrice("");
    setMaxPrice("");
    setStockFilter("all");
    setSort("featured");
    setPage(1);
  };

  const clearSearch = () => {
    inFlight.current?.abort();

    setQuery("");
    setResults(null);
    setSearchMeta(null);
    setSearching(false);
    setError(null);
    setPage(1);
  };

  const changeCategory = (category) => {
    setActiveCat(category);
    setPage(1);
  };

  /* ---------------------------------
     CART
  --------------------------------- */

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

  /* ---------------------------------
     WISHLIST
  --------------------------------- */

  const toggleSave = (id) => {
    const updated = toggleWishlist(id);
    setSaved(updated);
  };

  /* ---------------------------------
     PRODUCT CARD
  --------------------------------- */

  const card = (product, index) => {
    const originalPrice = getOriginalPrice(product);
    const sale = isSaleProduct(product);
    const newProduct = isNewProduct(product);

    const discount =
      sale && originalPrice
        ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
        : 0;

    return (
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

          <div className="product-badges">
            {!product.inStock && (
              <span className="product-badge sold">Sold out</span>
            )}

            {sale && product.inStock && (
              <span className="product-badge sale">-{discount}%</span>
            )}

            {newProduct && !sale && product.inStock && (
              <span className="product-badge new">New</span>
            )}
          </div>

          <button
            type="button"
            className="save"
            aria-label={`Save ${product.title}`}
            aria-pressed={saved.includes(product.id)}
            onClick={() => toggleSave(product.id)}
          >
            {saved.includes(product.id) ? "♥" : "♡"}
          </button>

          <button
            type="button"
            className="quick-view"
            onClick={() => setQuickView(product)}
          >
            Quick view
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

              {sale && <s>৳{taka(originalPrice)}</s>}
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
    );
  };

  return (
    <main className="subpage shop-page">
      {/* ---------------------------------
          SHOP HEADER
      --------------------------------- */}

      <section className="about-intro shop-intro">
        <div className="shell">
          <motion.span className="eyebrow" {...rise()}>
            HaatBari · Shop
          </motion.span>

          <motion.h1 {...rise(0.08)}>
            Everything worth
            <br />
            <em>bringing home.</em>
          </motion.h1>

          <motion.p className="intro-text" {...rise(0.16)}>
            Browse electronics, apparel, footwear and accessories from sellers
            across Bangladesh. Simple prices, cash on delivery and no clutter.
          </motion.p>
        </div>
      </section>

      {/* ---------------------------------
          SHOP CONTROLS
      --------------------------------- */}

      <section className="band shop-band">
        <div className="shell">
          <motion.div className="shop-toolbar" {...rise()}>
            <div className="shop-title">
              <p className="kicker">{activeCat || "All products"}</p>

              <h2>{activeCat ? activeCat : "Shop the catalogue"}</h2>
            </div>

            <form
              className="search-box shop-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                runSearch(query);
              }}
            >
              <input
                value={query}
                type="search"
                placeholder="Search products"
                aria-label="Search products"
                onChange={(event) => setQuery(event.target.value)}
              />

              {query && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={clearSearch}
                >
                  ×
                </button>
              )}

              <button type="submit" aria-label="Search products">
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
                  />
                </svg>
              </button>
            </form>
          </motion.div>

          {/* ---------------------------------
              CATEGORY ROW
          --------------------------------- */}

          {categories.length > 0 && (
            <motion.div className="category-row" {...rise(0.06)}>
              <button
                type="button"
                className={
                  !activeCat ? "category-pill active" : "category-pill"
                }
                onClick={() => changeCategory("")}
              >
                All
                <span>{products.length}</span>
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.name}
                  className={
                    activeCat === category.name
                      ? "category-pill active"
                      : "category-pill"
                  }
                  onClick={() => changeCategory(category.name)}
                >
                  {category.name}
                  <span>{category.count}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* ---------------------------------
              FILTER BAR
          --------------------------------- */}

          <motion.div className="shop-filter-bar" {...rise(0.1)}>
            <button
              type="button"
              className={
                hasFilters ? "filter-trigger has-filter" : "filter-trigger"
              }
              onClick={() => setFilterOpen(true)}
            >
              <span className="filter-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16M7 12h10M10 18h4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Filters
              {hasFilters && (
                <i>
                  {
                    [
                      activeCat,
                      minPrice,
                      maxPrice,
                      stockFilter !== "all" ? stockFilter : "",
                    ].filter(Boolean).length
                  }
                </i>
              )}
            </button>

            <div className="filter-summary">
              {searching
                ? "Searching…"
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? "product" : "products"
                  }`}
            </div>

            <label className="sort-select">
              <span>Sort by</span>

              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </label>
          </motion.div>

          {/* ---------------------------------
              ACTIVE FILTERS
          --------------------------------- */}

          {(query ||
            activeCat ||
            minPrice ||
            maxPrice ||
            stockFilter !== "all") && (
            <div className="active-filters">
              {query && (
                <button type="button" onClick={clearSearch}>
                  Search: “{query}” ×
                </button>
              )}

              {activeCat && (
                <button type="button" onClick={() => changeCategory("")}>
                  {activeCat} ×
                </button>
              )}

              {(minPrice || maxPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setPage(1);
                  }}
                >
                  ৳{minPrice || "0"} – ৳{maxPrice || "∞"} ×
                </button>
              )}

              {stockFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => {
                    setStockFilter("all");
                    setPage(1);
                  }}
                >
                  {stockFilter === "in" ? "In stock" : "Sold out"} ×
                </button>
              )}

              {hasFilters && (
                <button
                  type="button"
                  className="clear-all"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* ---------------------------------
              RESULT LINE
          --------------------------------- */}

          {results !== null && !searching && !error && (
            <p className="result-line">
              <span>
                {results.length === 0
                  ? `Nothing matched “${searchMeta?.query ?? query}”.`
                  : `${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "result" : "results"
                    } for “${searchMeta?.query ?? query}”${
                      searchMeta?.strategy === "loose"
                        ? " — closest matches"
                        : ""
                    }`}
              </span>
            </p>
          )}

          {/* ---------------------------------
              PRODUCTS
          --------------------------------- */}

          {loading ? (
            <div className="empty-state">Loading the catalogue…</div>
          ) : searching ? (
            <div className="empty-state">Searching…</div>
          ) : error ? (
            <div className="empty-state">
              We couldn&apos;t reach the store just now: {error}
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state shop-empty">
              <strong>No products found</strong>
              <span>Try a different search or remove some filters.</span>

              <button
                type="button"
                className="btn btn-ink btn-sm"
                onClick={() => {
                  clearSearch();
                  clearFilters();
                }}
              >
                Show everything
              </button>
            </div>
          ) : (
            <>
              <div className="catalog">
                {visible.map((product, index) => card(product, index))}
              </div>

              {/* ---------------------------------
                  PAGINATION
              --------------------------------- */}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    className="page-arrow"
                    disabled={safePage === 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    ←
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1,
                  )
                    .filter((number) => {
                      if (totalPages <= 6) {
                        return true;
                      }

                      return (
                        number === 1 ||
                        number === totalPages ||
                        Math.abs(number - safePage) <= 1
                      );
                    })
                    .map((number, index, array) => (
                      <span key={number}>
                        {index > 0 && number - array[index - 1] > 1 && (
                          <b className="page-dots">…</b>
                        )}

                        <button
                          type="button"
                          className={
                            safePage === number
                              ? "page-number active"
                              : "page-number"
                          }
                          onClick={() => setPage(number)}
                        >
                          {number}
                        </button>
                      </span>
                    ))}

                  <button
                    type="button"
                    className="page-arrow"
                    disabled={safePage === totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ---------------------------------
          MOBILE FILTER DRAWER
      --------------------------------- */}

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className="filter-overlay"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setFilterOpen(false)}
            />

            <motion.aside
              className="filter-drawer"
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                duration: 0.4,
                ease: EASE,
              }}
            >
              <div className="filter-drawer-head">
                <div>
                  <p className="kicker">Refine</p>
                  <h2>Filters</h2>
                </div>

                <button
                  type="button"
                  className="drawer-close"
                  onClick={() => setFilterOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="filter-drawer-body">
                {/* CATEGORY */}

                <div className="filter-group">
                  <h3>Category</h3>

                  <div className="filter-options">
                    <button
                      type="button"
                      className={
                        !activeCat ? "filter-option active" : "filter-option"
                      }
                      onClick={() => changeCategory("")}
                    >
                      <span>All categories</span>
                      <b>{products.length}</b>
                    </button>

                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category.name}
                        className={
                          activeCat === category.name
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() => changeCategory(category.name)}
                      >
                        <span>{category.name}</span>
                        <b>{category.count}</b>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRICE */}

                <div className="filter-group">
                  <h3>Price range</h3>

                  <div className="price-inputs">
                    <label>
                      <span>Minimum</span>

                      <div>
                        <b>৳</b>
                        <input
                          type="number"
                          min="0"
                          value={minPrice}
                          placeholder="0"
                          onChange={(event) => {
                            setMinPrice(event.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                    </label>

                    <span className="price-dash">—</span>

                    <label>
                      <span>Maximum</span>

                      <div>
                        <b>৳</b>
                        <input
                          type="number"
                          min="0"
                          value={maxPrice}
                          placeholder="Any"
                          onChange={(event) => {
                            setMaxPrice(event.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* STOCK */}

                <div className="filter-group">
                  <h3>Availability</h3>

                  <div className="filter-options">
                    {[
                      ["all", "All products"],
                      ["in", "In stock"],
                      ["out", "Sold out"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        className={
                          stockFilter === value
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() => {
                          setStockFilter(value);
                          setPage(1);
                        }}
                      >
                        <span>{label}</span>

                        <i
                          className={
                            stockFilter === value ? "radio active" : "radio"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SORT */}

                <div className="filter-group">
                  <h3>Sort</h3>

                  <div className="filter-options">
                    {[
                      ["featured", "Featured"],
                      ["newest", "Newest"],
                      ["price-low", "Price: Low to high"],
                      ["price-high", "Price: High to low"],
                      ["name", "Name: A–Z"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        className={
                          sort === value
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() => {
                          setSort(value);
                          setPage(1);
                        }}
                      >
                        <span>{label}</span>

                        <i
                          className={sort === value ? "radio active" : "radio"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="filter-drawer-footer">
                <button
                  type="button"
                  className="btn btn-line"
                  onClick={clearFilters}
                >
                  Clear all
                </button>

                <button
                  type="button"
                  className="btn btn-ink"
                  onClick={() => setFilterOpen(false)}
                >
                  Show {filteredProducts.length} products
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------------------------------
          QUICK VIEW
      --------------------------------- */}

      <AnimatePresence>
        {quickView && (
          <>
            <motion.div
              className="quick-overlay"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setQuickView(null)}
            />

            <motion.div
              className="quick-modal"
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 24,
                scale: 0.97,
              }}
              transition={{
                duration: 0.35,
                ease: EASE,
              }}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="quick-close"
                aria-label="Close quick view"
                onClick={() => setQuickView(null)}
              >
                ×
              </button>

              <div className="quick-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={quickView.image || "/placeholder.png"}
                  alt={quickView.title}
                />
              </div>

              <div className="quick-copy">
                <span className="eyebrow">
                  {quickView.category || "Marketplace"}
                </span>

                <h2>{quickView.title}</h2>

                <p className="quick-price">
                  <span className="tk">৳</span>
                  {taka(quickView.price)}
                </p>

                <p className="quick-description">
                  {quickView.description ||
                    "A quality product available from HaatBari sellers across Bangladesh."}
                </p>

                <div className="quick-status">
                  <span
                    className={
                      quickView.inStock ? "status-dot" : "status-dot off"
                    }
                  />
                  {quickView.inStock ? "In stock" : "Currently unavailable"}
                </div>

                <div className="quick-actions">
                  <button
                    type="button"
                    className="btn btn-ink"
                    disabled={!quickView.inStock}
                    onClick={() => {
                      add(quickView);
                      setQuickView(null);
                    }}
                  >
                    {quickView.inStock ? "Add to cart" : "Sold out"}
                  </button>

                  <Link
                    className="btn btn-line"
                    href={`/products/${quickView.slug || quickView.id}`}
                  >
                    View details
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

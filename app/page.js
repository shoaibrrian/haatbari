"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { EASE, rise } from "@/components/Motion";
import { addToCart } from "@/lib/cart";
import { getProducts } from "@/lib/products-cache";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/wishlist";

const MotionLink = motion.create(Link);

const AMBIENTS = [
  "var(--amb-3)",
  "var(--amb-2)",
  "var(--amb-1)",
  "var(--amb-4)",
  "var(--amb-5)",
];

const REVIEWS = [
  {
    text: "Ordered at night, it arrived the next afternoon. Paid the delivery man, done.",
    name: "Nafisa R.",
    city: "Dhaka",
    initials: "NR",
  },
  {
    text: "Prices match what the sellers quote locally, and I can see stock before ordering.",
    name: "Tanvir A.",
    city: "Chattogram",
    initials: "TA",
  },
  {
    text: "Returned a pair of shoes without arguing with anyone. That alone earned my trust.",
    name: "Sumaiya K.",
    city: "Sylhet",
    initials: "SK",
  },
];

function load(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  };
}

function taka(value) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Fact({ to, pre = "", post = "", label }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / 1100, 1);
          setShown(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [to]);

  return (
    <div ref={ref}>
      <b className="n">
        {pre}
        {shown.toLocaleString("en-US")}
        {post}
      </b>
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [addedId, setAddedId] = useState(null);
  const [saved, setSaved] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth > 900);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

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

  const inFlight = useRef(null);
  const rail = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadCatalogue() {
      try {
        const data = await getProducts();

        if (active) {
          setProducts(data);
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

  const add = (p) => {
    addToCart({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
    });
    setAddedId(p.id);
    setTimeout(
      () => setAddedId((current) => (current === p.id ? null : current)),
      1500,
    );
  };

  const toggleSave = async (id) => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      const result = await Swal.fire({
        title: "Sign in required",
        text: "Please sign in to save products to your wishlist.",
        icon: "info",
        confirmButtonText: "Sign in",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        router.push("/account");
      }

      return;
    }

    const alreadySaved = saved.includes(id);

    try {
      if (alreadySaved) {
        await removeFromWishlist(id);

        setSaved((current) => current.filter((item) => item !== id));
      } else {
        await addToWishlist(id);

        setSaved((current) => [...current, id]);
      }

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.error("Wishlist error:", error);

      await Swal.fire({
        title: "Something went wrong",
        text: "We couldn't update your wishlist.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const scrollRail = (direction) => {
    const node = rail.current;
    if (!node) return;
    const step = Math.min(node.clientWidth * 0.8, 560);
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const searched = results ?? products;
  const visible = activeCat
    ? searched.filter((p) => p.category === activeCat)
    : searched;

  const featurePicks = products.slice(0, 4);
  const stagePicks = products.slice(0, 5);
  const stageItem = stagePicks[stageIndex] ?? null;
  const deal = products.reduce(
    (best, p) => (best && best.price >= p.price ? best : p),
    null,
  );

  const categories = [];
  products.forEach((p) => {
    const name = p.category || "Other";
    const found = categories.find((c) => c.name === name);
    if (found) found.count += 1;
    else categories.push({ name, count: 1 });
  });

  const review = REVIEWS[reviewIndex];

  const card = (p, index, extra, delay = 0) => (
    <motion.article
      className="prod"
      key={p.id}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay, ease: EASE },
      }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        href={`/products/${p.slug || p.id}`}
        className="prod-art"
        style={{ "--amb": AMBIENTS[index % AMBIENTS.length] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image || "/placeholder.png"} alt={p.title} />
      </Link>
      {!p.inStock && <span className="flag flag-light">Sold out</span>}
      {extra && p.inStock && <span className="flag">{extra}</span>}
      <button
        type="button"
        className="save"
        aria-label={`Save ${p.title}`}
        aria-pressed={saved.includes(p.id)}
        onClick={() => toggleSave(p.id)}
      >
        {saved.includes(p.id) ? "♥" : "♡"}
      </button>
      <div className="prod-in">
        <div>
          <h3>{p.title}</h3>
          <p className="prod-meta">
            {p.category || "Marketplace"} <em>·</em>{" "}
            {p.inStock ? "In stock" : "Out of stock"}
          </p>
        </div>
        <div className="prod-right">
          <span className="price n">
            <span className="tk">৳</span>
            {taka(p.price)}
          </span>
          <motion.button
            type="button"
            className={addedId === p.id ? "buy done" : "buy"}
            disabled={!p.inStock}
            whileTap={{ scale: 0.94 }}
            onClick={() => add(p)}
          >
            {addedId === p.id ? "Added" : p.inStock ? "Add" : "Sold out"}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );

  useEffect(() => {
    const firstLine = "Everyday things,";
    const secondLine = "chosen properly.";

    let index = 0;
    const fullText = `${firstLine}|${secondLine}`;

    const timer = setInterval(() => {
      const current = fullText.slice(0, index + 1);
      setTypedTitle(current);
      index += 1;

      if (index >= fullText.length) {
        clearInterval(timer);
      }
    }, 55);

    return () => clearInterval(timer);
  }, []);
  return (
    <main>
      <section className="hero">
        <div className="shell hero-in">
          <div>
            <motion.span className="eyebrow" {...load(0)}>
              QUALITY FINDS · FAIR PRICES
            </motion.span>
            <motion.h1 {...load(0.08)}>
              {isLargeScreen ? (
                <>
                  {typedTitle.split("|")[0].split(" ")[0]}
                  <br />
                  {typedTitle.split("|")[0].split(" ").slice(1).join(" ")}
                  <br />
                  <span>
                    {typedTitle.split("|")[1]?.split(" ")[0] || ""}
                    <br />
                    {typedTitle.split("|")[1]?.split(" ").slice(1).join(" ") ||
                      ""}
                  </span>
                </>
              ) : (
                <>
                  {typedTitle.split("|")[0]}
                  <br />
                  <span>{typedTitle.split("|")[1] || ""}</span>
                </>
              )}
            </motion.h1>
            <motion.p className="hero-lede" {...load(0.16)}>
              Electronics, apparel, footwear and accessories from sellers across
              Bangladesh. Pay cash at your door.
            </motion.p>
            <motion.div className="hero-btns" {...load(0.24)}>
              <a className="btn btn-ink" href="/shop">
                Shop the catalogue <span>↓</span>
              </a>
              <Link className="btn btn-line" href="/delivery">
                How delivery works
              </Link>
            </motion.div>
            <motion.div className="facts" {...load(0.32)}>
              <Fact to={products.length} label="Products live" />
              <Fact to={64} label="Districts covered" />
              <Fact to={7} label="Day returns" />
            </motion.div>
          </div>

          <motion.div className="hero-visual" {...load(0.18)}>
            <div className="showcase">
              {stageItem && (
                <MotionLink
                  key={`obj-${stageItem.id}`}
                  className="showcase-card"
                  href={`/products/${stageItem.slug || stageItem.id}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <span className="showcase-badge">Popular Products</span>
                  <span
                    className="showcase-media"
                    style={{ "--amb": AMBIENTS[stageIndex % AMBIENTS.length] }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stageItem.image || "/placeholder.png"}
                      alt={stageItem.title}
                    />
                  </span>
                  <span className="showcase-info">
                    <span className="showcase-text">
                      <b>{stageItem.title}</b>
                      <span>{stageItem.category || "Marketplace"}</span>
                    </span>
                    <span className="showcase-price n">
                      <span className="tk">৳</span>
                      {taka(stageItem.price)}
                    </span>
                  </span>
                </MotionLink>
              )}
            </div>
            {stagePicks.length > 1 && (
              <div className="thumbs">
                {stagePicks.map((p, i) => (
                  <motion.button
                    type="button"
                    key={p.id}
                    className="thumb"
                    aria-pressed={i === stageIndex}
                    aria-label={`Show ${p.title}`}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setStageIndex(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image || "/placeholder.png"} alt="" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="rail-wrap" id="cats">
          <motion.div className="shell rail-head" {...rise()}>
            <div>
              <p className="kicker">Browse</p>
              <h2>Four aisles, no clutter.</h2>
            </div>
            <div className="rail-nav">
              <button
                type="button"
                className="icon-btn"
                aria-label="Previous categories"
                onClick={() => scrollRail(-1)}
              >
                ←
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Next categories"
                onClick={() => scrollRail(1)}
              >
                →
              </button>
            </div>
          </motion.div>
          <div className="rail" ref={rail}>
            {categories.map((c, i) => (
              <a
                className="cat"
                key={c.name}
                href="#new"
                style={{ background: AMBIENTS[i % AMBIENTS.length] }}
                onClick={() => setActiveCat(c.name)}
              >
                <span className="cat-go">↗</span>
                <span className="cat-txt">
                  <b>{c.name}</b>
                  <span>{c.count} items</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {featurePicks.length > 0 && (
        <section className="band" id="picked">
          <div className="shell">
            <motion.div className="band-head" {...rise()}>
              <div>
                <p className="kicker">This week</p>
                <h2>Picked for you</h2>
              </div>
              <a href="/shop">See the full catalogue</a>
            </motion.div>
            <div className="pgrid">
              {featurePicks.map((p, i) =>
                card(p, i, i === 0 ? "New" : null, 0.06 * (i % 2)),
              )}
            </div>
          </div>
        </section>
      )}

      {deal && (
        <section className="dark feature" id="feature">
          <div className="shell feature-in">
            <motion.div {...rise()}>
              <span className="eyebrow eyebrow-d">Pick of the week</span>
              <h2>{deal.title}</h2>
              <p>{deal.description}</p>
              <div className="specs">
                <div>
                  <span>Category</span>
                  <b>{deal.category || "Marketplace"}</b>
                </div>
                <div>
                  <span>Availability</span>
                  <b>{deal.inStock ? "In stock now" : "Out of stock"}</b>
                </div>
                <div>
                  <span>Returns</span>
                  <b>7 days</b>
                </div>
                <div>
                  <span>Delivery</span>
                  <b>1–3 days, ৳70 flat</b>
                </div>
              </div>
              <div className="hero-btns">
                <motion.button
                  type="button"
                  className="btn btn-light"
                  disabled={!deal.inStock}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => add(deal)}
                >
                  {addedId === deal.id ? "Added" : "Add to cart"} ·{" "}
                  <span className="n">
                    <span className="tk">৳</span>
                    {taka(deal.price)}
                  </span>
                </motion.button>
                <Link
                  className="btn btn-line"
                  href={`/products/${deal.slug || deal.id}`}
                  style={{
                    borderColor: "var(--on-dark-line)",
                    color: "var(--on-dark)",
                  }}
                >
                  See details
                </Link>
              </div>
            </motion.div>
            <motion.div className="feature-stage" {...rise(0.12)}>
              <span className="feature-tag">Top price this week</span>
              <span className="halo" />
              <span className="feature-obj">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={deal.image || "/placeholder.png"} alt={deal.title} />
              </span>
            </motion.div>
          </div>
        </section>
      )}

      <section className="assure">
        <div className="shell">
          <motion.div className="band-head" {...rise()}>
            <div>
              <p className="kicker">Why HaatBari</p>
              <h2>Fewer surprises, start to finish.</h2>
            </div>
          </motion.div>
          <div className="assure-in">
            <motion.div className="assure-card" {...rise(0)}>
              <span className="assure-ico">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="7"
                    width="18"
                    height="11"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="12.5"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M6 4.5h12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <b>Pay at the door</b>
              <p>
                Cash on delivery on every order. No card, no wallet, no advance
                payment.
              </p>
            </motion.div>
            <motion.div className="assure-card" {...rise(0.07)}>
              <span className="assure-ico">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 6h11v10H2zM13 9.5h5l3 3.5V16h-8z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="6.5"
                    cy="18.5"
                    r="1.8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="17"
                    cy="18.5"
                    r="1.8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <b>৳70 flat, everywhere</b>
              <p>
                One delivery price for the whole country, no zone surcharge.
              </p>
            </motion.div>
            <motion.div className="assure-card" {...rise(0.14)}>
              <span className="assure-ico">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20.5 12a8.5 8.5 0 10-3.2 6.6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M20.5 5.5V12H14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <b>7 day returns</b>
              <p>
                Wrong size or changed your mind? Send it back within a week.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="say">
        <motion.div className="shell say-in" {...rise()}>
          <p className="kicker">Buyers</p>
          <motion.blockquote
            key={`quote-${review.name}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {review.text}
          </motion.blockquote>
          <motion.div
            className="say-who"
            key={`who-${review.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.32, delay: 0.05, ease: EASE }}
          >
            <span className="av">{review.initials}</span>
            <div>
              <b>{review.name}</b>
              <span>{review.city}</span>
            </div>
          </motion.div>
          <div className="dots">
            {REVIEWS.map((r, i) => (
              <button
                type="button"
                key={r.name}
                className="dot"
                aria-pressed={i === reviewIndex}
                aria-label={`Review ${i + 1}`}
                onClick={() => setReviewIndex(i)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="dark join">
        <div className="shell">
          <motion.h2 {...rise()}>Know when the good stuff lands.</motion.h2>
          <motion.p {...rise(0.07)}>
            One short email a week: new arrivals, restocks, and honest price
            drops.
          </motion.p>
          <motion.form
            {...rise(0.14)}
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
            />
            <button type="submit" className="btn btn-light">
              Join
            </button>
          </motion.form>
        </div>
      </section>
    </main>
  );
}

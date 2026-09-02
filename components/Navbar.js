"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, readCart } from "@/lib/cart";
import { wishlistCount } from "@/lib/wishlist";
import { useUser, useClerk } from "@clerk/nextjs";

const CATEGORIES = [
  {
    name: "Electronics",
    items: ["Mobiles", "Laptops", "Headphones", "Cameras", "Accessories"],
  },
  {
    name: "Fashion",
    items: ["Men's Clothing", "Women's Clothing", "Shoes", "Bags", "Watches"],
  },
  {
    name: "Home & Living",
    items: ["Furniture", "Kitchen", "Home Decor", "Lighting", "Appliances"],
  },
  {
    name: "Beauty & Care",
    items: ["Skincare", "Makeup", "Hair Care", "Fragrances", "Personal Care"],
  },
  {
    name: "Sports & Fitness",
    items: ["Sportswear", "Gym Equipment", "Outdoor", "Cycling", "Fitness"],
  },
  {
    name: "Books & Stationery",
    items: ["Books", "Notebooks", "Pens", "Office Supplies", "Art Supplies"],
  },
  {
    name: "Grocery & Food",
    items: ["Groceries", "Snacks", "Beverages", "Fresh Food", "Cooking"],
  },
  {
    name: "Automotive",
    items: ["Motorcycles", "Car Accessories", "Bike Accessories", "Tools"],
  },
];

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [count, setCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    const updateCounts = () => {
      setCount(cartCount(readCart()));
      setWishCount(wishlistCount());
    };

    updateCounts();

    window.addEventListener("cart-updated", updateCounts);
    window.addEventListener("wishlist-updated", updateCounts);

    return () => {
      window.removeEventListener("cart-updated", updateCounts);
      window.removeEventListener("wishlist-updated", updateCounts);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 30);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="util">
        <div className="shell util-in">
          <span>
            Free delivery over <b>৳2,000</b> · Cash on delivery everywhere
          </span>

          <nav>
            <Link href="/cart">Track order</Link>
            <Link href="/about">Help</Link>
            <Link href="/about">Sell with us</Link>
          </nav>
        </div>
      </div>

      <header className={stuck ? "nav stuck" : "nav"}>
        <div className="shell nav-in">
          {/* LOGO */}
          <Link
            className="brand"
            href="/"
            aria-label="HaatBari home"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
          >
            <img src="/logo.png" alt="HaatBari" className="logo" />
            <b>HaatBari</b>
          </Link>

          {/* MAIN MENU */}
          <nav className="menu" aria-label="Main navigation">
            <Link href="/shop">Shop</Link>

            {/* CATEGORIES */}
            <div
              className="nav-category"
              onMouseEnter={() => setCategoryOpen(true)}
              onMouseLeave={() => setCategoryOpen(false)}
            >
              <button
                type="button"
                className="category-nav-btn"
                onClick={() => setCategoryOpen((open) => !open)}
                aria-expanded={categoryOpen}
              >
                Categories
                <span className={categoryOpen ? "chevron open" : "chevron"}>
                  ↓
                </span>
              </button>

              {categoryOpen && (
                <div className="category-mega-menu">
                  <div className="category-mega-inner">
                    <div className="category-heading">
                      <span className="kicker">Browse</span>
                      <h2>Shop by category</h2>
                      <p>Find everything you need from HaatBari sellers.</p>

                      <Link
                        href="/shop"
                        className="category-all-link"
                        onClick={() => setCategoryOpen(false)}
                      >
                        View all products →
                      </Link>
                    </div>

                    <div className="category-grid">
                      {CATEGORIES.map((category) => (
                        <div className="category-column" key={category.name}>
                          <Link
                            href={`/shop?category=${encodeURIComponent(
                              category.name,
                            )}`}
                            className="category-main"
                            onClick={() => setCategoryOpen(false)}
                          >
                            {category.name}
                          </Link>

                          <div className="category-items">
                            {category.items.map((item) => (
                              <Link
                                key={item}
                                href={`/shop?category=${encodeURIComponent(
                                  item,
                                )}`}
                                onClick={() => setCategoryOpen(false)}
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nav-offers">
              <button type="button" className="offers-nav-btn">
                Offers
                <span className="chevron">↓</span>
              </button>

              <div className="offers-mega-menu">
                <div className="offers-mega-inner">
                  <div className="offers-heading">
                    <span className="kicker">Limited time</span>
                    <h2>Offers & deals</h2>
                    <p>
                      Save more on your favorite products with our latest deals.
                    </p>

                    <Link href="/offers" className="offers-all-link">
                      View all offers →
                    </Link>
                  </div>

                  <div className="offers-grid">
                    <Link href="/offers" className="offer-card">
                      <span className="offer-label">UP TO</span>
                      <strong>40% OFF</strong>
                      <h3>Fashion</h3>
                      <p>Fresh styles, shoes & accessories.</p>
                      <span className="offer-arrow">Shop now →</span>
                    </Link>

                    <Link href="/offers" className="offer-card">
                      <span className="offer-label">SAVE</span>
                      <strong>৳500 OFF</strong>
                      <h3>Electronics</h3>
                      <p>Deals on gadgets & accessories.</p>
                      <span className="offer-arrow">Explore →</span>
                    </Link>

                    <Link href="/offers" className="offer-card">
                      <span className="offer-label">SPECIAL</span>
                      <strong>25% OFF</strong>
                      <h3>Home & Living</h3>
                      <p>Upgrade your space for less.</p>
                      <span className="offer-arrow">Shop now →</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/about">Our story</Link>
          </nav>

          {/* RIGHT SIDE TOOLS */}
          <div className="tools">
            <Link
              className="icon-btn"
              href="/#new"
              aria-label="Search products"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />

                <path
                  d="M16 16l4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </Link>
            <Link
              className="icon-btn wishlist-btn"
              href="/wishlist"
              aria-label={`Wishlist ${wishCount} items`}
            >
              Wishlist
              {wishCount > 0 && <i>{wishCount}</i>}
            </Link>
            <Link className="icon-btn cart-btn" href="/cart">
              Cart <i>{count}</i>
            </Link>
            <Link className="btn btn-ink btn-sm" href="/checkout">
              Checkout
            </Link>

            <div className="account-menu">
              <Link
                className="icon-btn account-btn"
                href="/account"
                aria-label="Account"
              >
                {isLoaded && isSignedIn && user ? (
                  user.hasImage ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "Account"}
                      className="navbar-avatar"
                    />
                  ) : (
                    <span className="navbar-avatar navbar-avatar-fallback">
                      {(
                        user.fullName ||
                        user.firstName ||
                        user.primaryEmailAddress?.emailAddress ||
                        "Customer"
                      )
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M4.5 21c.9-4.2 3.5-6.3 7.5-6.3s6.6 2.1 7.5 6.3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </Link>

              {isLoaded && isSignedIn ? (
                <div className="account-dropdown">
                  <div className="account-dropdown-user">
                    <strong>
                      {user?.fullName ||
                        user?.firstName ||
                        user?.primaryEmailAddress?.emailAddress?.split(
                          "@",
                        )[0] ||
                        "Customer"}
                    </strong>
                    <span>{user?.primaryEmailAddress?.emailAddress || ""}</span>
                  </div>

                  <div className="account-dropdown-divider" />

                  <Link href="/account/profile">My Account</Link>
                  <Link href="/customer/dashboard">Customer Dashboard</Link>
                  <Link href="/orders">My Orders</Link>
                  <Link href="/wishlist">Wishlist</Link>
                  <Link href="/cart">Cart</Link>

                  <div className="account-dropdown-divider" />

                  <button
                    type="button"
                    className="account-dropdown-action"
                    onClick={() => signOut({ redirectUrl: "/" })}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

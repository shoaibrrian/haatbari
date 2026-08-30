"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, readCart } from "@/lib/cart";

export default function Navbar() {
  const [count, setCount] = useState(0);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const updateCount = () => setCount(cartCount(readCart()));
    updateCount();
    window.addEventListener("cart-updated", updateCount);
    return () => window.removeEventListener("cart-updated", updateCount);
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

          <nav className="menu" aria-label="Main navigation">
            <Link href="/#new">Shop</Link>
            <Link href="/#cats">Categories</Link>
            <Link href="/#feature">Deals</Link>
            <Link href="/about">Our story</Link>
          </nav>

          <div className="tools">
            <a className="icon-btn" href="/#new" aria-label="Search products">
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
            </a>
            <Link className="icon-btn cart-btn" href="/cart">
              Cart <i>{count}</i>
            </Link>
            <Link className="btn btn-ink btn-sm" href="/checkout">
              Checkout
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

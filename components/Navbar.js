"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, readCart } from "@/lib/cart";

export default function Navbar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => setCount(cartCount(readCart()));
    updateCount();
    window.addEventListener("cart-updated", updateCount);
    return () => window.removeEventListener("cart-updated", updateCount);
  }, []);

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="brand" aria-label="HaatBari home">
          <span className="brand-mark">HB</span>
          <span>
            <strong className="brand-name text-black">HaatBari</strong>
            <small>Local finds, shared proudly</small>
          </span>
        </Link>

        <nav className="main-nav text-black" aria-label="Main navigation">
          <Link href="/">Shop</Link>
          <Link href="/about">Our story</Link>
          <Link href="/cart" className="nav-cart">
            Cart <span>{count}</span>
          </Link>
          <Link href="/checkout" className="nav-checkout">
            Checkout
          </Link>
        </nav>
      </div>
    </header>
  );
}

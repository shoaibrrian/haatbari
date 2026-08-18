"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, readCart, writeCart } from "@/lib/cart";

const deliveryFee = 70;

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const syncCart = window.setTimeout(() => setCart(readCart()), 0);
    return () => window.clearTimeout(syncCart);
  }, []);

  function updateCart(nextCart) {
    setCart(nextCart);
    writeCart(nextCart);
  }

  function changeQuantity(id, change) {
    updateCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  }

  function removeItem(id) {
    updateCart(cart.filter((item) => item.id !== id));
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const total = subtotal ? subtotal + deliveryFee : 0;

  return (
    <main className="cart-page page-width">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">Your saved finds</p>
          <h1>
            Your <em>cart.</em>
          </h1>
        </div>
        <span>
          {cartCount(cart)} {cartCount(cart) === 1 ? "item" : "items"}
        </span>
      </div>
      {cart.length === 0 ? (
        <section className="cart-empty">
          <p>Your basket is waiting for something good.</p>
          <Link href="/#market" className="button button-dark">
            Explore the market <span>↗</span>
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Cart items">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                  />
                </div>
                <div className="cart-item-copy">
                  <p className="product-category">
                    {item.category || "From the community"}
                  </p>
                  <h2>{item.title}</h2>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="cart-item-controls">
                  <strong>৳{item.price * item.quantity}</strong>
                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.title} quantity`}
                      onClick={() => changeQuantity(item.id, -1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.title} quantity`}
                      onClick={() => changeQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="cart-summary">
            <p className="eyebrow">Order summary</p>
            <div>
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div>
              <span>Delivery</span>
              <span>৳{deliveryFee}</span>
            </div>
            <div className="cart-total">
              <strong>Total</strong>
              <strong>৳{total}</strong>
            </div>
            <Link href="/checkout" className="button button-dark checkout-link">
              Continue to checkout <span>↗</span>
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}

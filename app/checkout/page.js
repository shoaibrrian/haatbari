"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readCart, writeCart } from "@/lib/cart";

const deliveryFee = 70;

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [submitted, setSubmitted] = useState(false);

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

  if (submitted) {
    return (
      <main className="checkout-page page-width confirmation">
        <p className="eyebrow">Order received</p>
        <h1>
          Thank you for
          <br />
          <em>shopping close.</em>
        </h1>
        <p>
          Your order is being prepared with care. We&apos;ll send delivery
          details to your phone shortly.
        </p>
        <Link href="/" className="button button-dark">
          Back to the market <span>↗</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="checkout-page page-width">
      <div className="checkout-heading">
        <div>
          <p className="eyebrow">Almost yours</p>
          <h1>
            Complete your
            <br />
            <em>order.</em>
          </h1>
        </div>
        <span className="step-count">01 — 02</span>
      </div>
      <div className="checkout-grid">
        <form
          className="checkout-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <fieldset>
            <legend>Where should we deliver?</legend>
            <div className="form-row">
              <label>
                First name
                <input required name="firstName" />
              </label>
              <label>
                Last name
                <input required name="lastName" />
              </label>
            </div>
            <label>
              Phone number
              <input
                required
                type="tel"
                name="phone"
                placeholder="01XXXXXXXXX"
              />
            </label>
            <label>
              Delivery address
              <textarea
                required
                name="address"
                rows="3"
                placeholder="House, road, area, city"
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Payment</legend>
            <label className="payment-choice">
              <input type="radio" name="payment" defaultChecked />{" "}
              <span>
                <strong>Cash on delivery</strong>
                <small>Pay when your order arrives</small>
              </span>
            </label>
            <label className="payment-choice muted">
              <input type="radio" name="payment" />{" "}
              <span>
                <strong>Card or mobile wallet</strong>
                <small>Coming soon</small>
              </span>
            </label>
          </fieldset>
          <button className="button button-dark submit-button" type="submit">
            Place order <span>↗</span>
          </button>
        </form>
        <aside className="order-summary">
          <p className="eyebrow">Your basket</p>
          {cart.length === 0 ? (
            <div className="checkout-empty">
              <p>Your basket is empty.</p>
              <Link href="/#market">Return to the market →</Link>
            </div>
          ) : (
            cart.map((item) => (
              <div className="summary-item" key={item.id}>
                <div className="summary-art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || "/placeholder.png"} alt="" />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    ৳{item.price} × {item.quantity}
                  </small>
                  <button
                    type="button"
                    className="summary-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <span>৳{item.price * item.quantity}</span>
                <div className="summary-quantity">
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
            ))
          )}
          <div className="summary-total">
            <span>Subtotal</span>
            <span>৳{subtotal}</span>
            <span>Delivery</span>
            <span>৳{cart.length ? deliveryFee : 0}</span>
            <strong>Total</strong>
            <strong>৳{total}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const itemPrice = 850;
  const delivery = 70;

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
          <div className="summary-item">
            <div className="summary-art">HB</div>
            <div>
              <strong>Community favourite</strong>
              <small>Handpicked from Bangladesh</small>
            </div>
            <span>৳{itemPrice * quantity}</span>
          </div>
          <div className="quantity-row">
            <span>Quantity</span>
            <div>
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="summary-total">
            <span>Delivery</span>
            <span>৳{delivery}</span>
            <strong>Total</strong>
            <strong>৳{itemPrice * quantity + delivery}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

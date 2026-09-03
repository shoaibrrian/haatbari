"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import Swal from "sweetalert2";

import { apiFetch } from "@/lib/api-client";
import { readCart, writeCart } from "@/lib/cart";
import {
  DELIVERY_FEES,
  MAX_QUANTITY_PER_ITEM,
} from "@/modules/order/order.constants";

function describeStockProblem(problem) {
  const name = problem.title || "An item in your basket";

  if (problem.reason === "insufficient_stock") {
    return `${name} — only ${problem.available} left, you asked for ${problem.requested}.`;
  }

  return `${name} is no longer available.`;
}

function extractMessages(apiError) {
  if (!Array.isArray(apiError.details)) return [];

  if (apiError.code === "UNPROCESSABLE") {
    return apiError.details.map(describeStockProblem);
  }

  return apiError.details
    .map((issue) => issue?.message)
    .filter((message) => typeof message === "string");
}

export default function CheckoutPage() {
  const { isLoaded, isSignedIn } = useAuth();

  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [deliveryArea, setDeliveryArea] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          ? {
              ...item,
              quantity: Math.min(
                MAX_QUANTITY_PER_ITEM,
                Math.max(1, item.quantity + change),
              ),
            }
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

  const deliveryFee = DELIVERY_FEES[deliveryArea] || 0;

  const total = cart.length ? subtotal + deliveryFee : 0;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!cart.length) {
      setError("Your basket is empty. Add a product before placing the order.");
      return;
    }

    if (!isLoaded) return;

    setSubmitting(true);
    setError("");
    setMessages([]);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const { data: order } = await apiFetch("/api/orders", {
        method: "POST",
        body: {
          customer: {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: formData.get("phone"),
            address: formData.get("address"),
          },
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod: formData.get("payment"),
        },
      });

      // Clear cart
      writeCart([]);
      setCart([]);

      // Reset delivery form
      form.reset();

      // Update navbar cart count
      window.dispatchEvent(new Event("cart-updated"));

      // Logged-in customer
      if (isSignedIn) {
        const result = await Swal.fire({
          title: "Order placed successfully!",
          html: `
  <div class="hb-order-success">
    <p class="hb-order-success-message">
      Your order has been received successfully.
    </p>

    <div class="hb-order-info">
      <div>
        <span>Order ID</span>
        <strong>${order.id}</strong>
      </div>

      <div>
        <span>Total</span>
        <strong>৳${order.total}</strong>
      </div>
    </div>
  </div>
`,
          icon: "success",
          confirmButtonText: "View my orders",
          showCancelButton: true,
          cancelButtonText: "Continue shopping",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          window.location.href = "/orders";
        } else {
          window.location.href = "/";
        }

        return;
      }

      // Guest customer
      await Swal.fire({
        title: "Order placed successfully!",
        html: `
  <div class="hb-order-success">
    <p class="hb-order-success-message">
      Your order has been received successfully.
    </p>

    <div class="hb-order-info">
      <div>
        <span>Order ID</span>
        <strong>${order.id}</strong>
      </div>

      <div>
        <span>Total</span>
        <strong>৳${order.total}</strong>
      </div>
    </div>
  </div>
`,
        icon: "success",
        confirmButtonText: "Continue shopping",
      });

      window.location.href = "/";
    } catch (submitError) {
      const detailed = extractMessages(submitError);

      setMessages(detailed);
      setError(detailed.length ? "" : submitError.message);
    } finally {
      setSubmitting(false);
    }
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
        <form className="checkout-form" onSubmit={handleSubmit}>
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

            <label className="delivery-area-field">
              Delivery area
              <div className="custom-delivery-select">
                <input
                  type="hidden"
                  name="deliveryArea"
                  value={deliveryArea}
                  required
                />

                <button
                  type="button"
                  className={`custom-delivery-trigger ${
                    deliveryArea ? "selected" : ""
                  }`}
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <span>
                    {deliveryArea === "inside_dhaka"
                      ? "Inside Dhaka — ৳80"
                      : deliveryArea === "outside_dhaka"
                        ? "Outside Dhaka — ৳150"
                        : "Select delivery area"}
                  </span>

                  <span
                    className={`custom-delivery-arrow ${
                      dropdownOpen ? "open" : ""
                    }`}
                  >
                    ⌄
                  </span>
                </button>

                <div
                  className={`custom-delivery-menu ${
                    dropdownOpen ? "open" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryArea("inside_dhaka");
                      setDropdownOpen(false);
                    }}
                  >
                    <span>Inside Dhaka</span>
                    <strong>৳80</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryArea("outside_dhaka");
                      setDropdownOpen(false);
                    }}
                  >
                    <span>Outside Dhaka</span>
                    <strong>৳150</strong>
                  </button>
                </div>
              </div>
            </label>
          </fieldset>

          <fieldset>
            <legend>Payment</legend>

            <label className="payment-choice">
              <input
                type="radio"
                name="payment"
                value="cash_on_delivery"
                defaultChecked
              />

              <span>
                <strong>Cash on delivery</strong>
                <small>Pay when your order arrives</small>
              </span>
            </label>

            <label className="payment-choice muted">
              <input
                type="radio"
                name="payment"
                value="card_or_mobile_wallet"
                disabled
              />

              <span>
                <strong>Card or mobile wallet</strong>
                <small>Coming soon</small>
              </span>
            </label>
          </fieldset>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          {messages.length > 0 && (
            <ul className="checkout-error" role="alert">
              {messages.map((message, index) => (
                <li key={`${index}-${message}`}>{message}</li>
              ))}
            </ul>
          )}

          <button
            className="button button-dark submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Placing order..." : "Place order"}{" "}
            <span>{submitting ? "…" : "↗"}</span>
          </button>
        </form>

        <aside className="order-summary">
          <p className="eyebrow">Your basket</p>

          {cart.length === 0 ? (
            <div className="checkout-empty">
              <p>Your basket is empty.</p>
              <Link href="/shop">Return to the market →</Link>
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

                <span>৳{(item.price * item.quantity).toFixed(2)}</span>

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
            <span>৳{subtotal.toFixed(2)}</span>

            <span>Delivery</span>
            <span>৳{cart.length ? deliveryFee : 0}</span>

            <strong>Total</strong>
            <strong>৳{total.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

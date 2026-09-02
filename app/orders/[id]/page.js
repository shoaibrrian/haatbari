"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function OrderDetailsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const params = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const response = await fetch(`/api/customer/orders/${params.id}`);

        if (!response.ok) {
          throw new Error("Order not found");
        }

        const result = await response.json();

        setOrder(result.data?.data || result.data);
      } catch (error) {
        console.error("Order details error:", error);
        setError("We couldn't find this order.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [isLoaded, isSignedIn, params.id]);

  if (!isLoaded || loading) {
    return (
      <main className="order-details-page page-width">
        <div className="order-details-loading">
          <div className="order-details-skeleton order-details-skeleton-title" />
          <div className="order-details-skeleton order-details-skeleton-text" />
          <div className="order-details-skeleton order-details-skeleton-card" />
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="order-details-page page-width">
        <section className="order-details-empty">
          <p className="eyebrow">HaatBari account</p>

          <h1>
            Sign in to view your
            <br />
            <em>order.</em>
          </h1>

          <Link href="/account" className="orders-primary-button">
            Sign in →
          </Link>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page page-width">
        <section className="order-details-empty">
          <p className="eyebrow">Order</p>

          <h1>
            Order not
            <br />
            <em>found.</em>
          </h1>

          <p>This order may not exist or may not belong to your account.</p>

          <Link href="/orders" className="orders-primary-button">
            ← Back to orders
          </Link>
        </section>
      </main>
    );
  }

  const orderNumber = order.id?.slice(-6).toUpperCase();

  return (
    <main className="order-details-page page-width">
      <header className="order-details-header">
        <div>
          <Link href="/orders" className="order-details-back">
            ← My orders
          </Link>

          <p className="eyebrow">Order details</p>

          <h1>
            Order
            <br />
            <em>#{orderNumber}</em>
          </h1>

          <p className="order-details-date">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <span className={`orders-status orders-status-${order.status}`}>
          {order.status}
        </span>
      </header>

      <section className="order-details-grid">
        <div className="order-details-main">
          <div className="order-details-section-heading">
            <div>
              <p className="eyebrow">Your purchase</p>
              <h2>Items</h2>
            </div>

            <span>
              {order.items?.length || 0}{" "}
              {order.items?.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="order-items-list">
            {order.items?.map((item, index) => (
              <div
                className="order-item-row"
                key={`${item.productId}-${index}`}
              >
                <div className="order-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  )}
                </div>

                <div className="order-item-info">
                  <strong>{item.title}</strong>

                  <span>
                    ৳{Number(item.unitPrice || 0).toLocaleString()} ×{" "}
                    {item.quantity}
                  </span>
                </div>

                <strong className="order-item-price">
                  ৳{Number(item.lineTotal || 0).toLocaleString()}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <aside className="order-details-summary">
          <p className="eyebrow">Summary</p>

          <div className="order-summary-list">
            <div>
              <span>Subtotal</span>
              <strong>৳{Number(order.subtotal || 0).toLocaleString()}</strong>
            </div>

            <div>
              <span>Delivery</span>
              <strong>
                ৳{Number(order.deliveryFee || 0).toLocaleString()}
              </strong>
            </div>

            <div className="order-summary-total">
              <span>Total</span>
              <strong>৳{Number(order.total || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div className="order-payment">
            <span>Payment</span>
            <strong>
              {order.paymentMethod === "cash_on_delivery"
                ? "Cash on delivery"
                : order.paymentMethod}
            </strong>
          </div>
        </aside>
      </section>

      <section className="order-delivery-card">
        <div className="order-details-section-heading">
          <div>
            <p className="eyebrow">Delivery</p>
            <h2>Delivery information</h2>
          </div>
        </div>

        <div className="order-delivery-grid">
          <div>
            <span>Name</span>
            <strong>
              {order.customer?.firstName} {order.customer?.lastName}
            </strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{order.customer?.phone}</strong>
          </div>

          <div>
            <span>Address</span>
            <strong>{order.customer?.address}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

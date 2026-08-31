"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatStatus(status) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const query =
        status === "all" ? "" : `?status=${encodeURIComponent(status)}`;

      const response = await fetch(`/api/orders${query}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load orders.");
      }

      setOrders(result.data?.items || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [status]);

  async function updateStatus(orderId, nextStatus) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update order.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: result.data.status }
            : order,
        ),
      );
    } catch (err) {
      setError(err.message || "Could not update order.");
    }
  }

  return (
    <main className="admin-page page-width">
      <header className="admin-page-header">
        <div>
          <Link href="/admin" className="admin-back">
            ← Dashboard
          </Link>

          <p className="eyebrow">Store operations</p>

          <h1>
            Manage
            <br />
            <em>orders.</em>
          </h1>

          <p className="admin-subtitle">
            Review customer orders and keep fulfilment moving.
          </p>
        </div>
      </header>

      <section className="admin-order-toolbar">
        <div className="admin-status-tabs">
          {STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              className={status === item ? "active" : ""}
              onClick={() => setStatus(item)}
            >
              {item === "all" ? "All orders" : formatStatus(item)}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="admin-refresh"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh ↻"}
        </button>
      </section>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-orders">
        {loading ? (
          <div className="admin-empty">
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <p className="eyebrow">Nothing here yet</p>
            <h2>No orders found.</h2>
            <p>
              Customer orders will appear here once someone completes a
              purchase.
            </p>
          </div>
        ) : (
          <>
            <div className="admin-orders-head">
              <span>Order</span>
              <span>Customer</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {orders.map((order) => (
              <article className="admin-order-row" key={order.id}>
                <div className="admin-order-id">
                  <span>Order</span>
                  <strong>#{order.id.slice(-8).toUpperCase()}</strong>
                </div>

                <div className="admin-customer">
                  <strong>
                    {order.customer.firstName} {order.customer.lastName}
                  </strong>
                  <span>{order.customer.phone}</span>
                </div>

                <div className="admin-order-date">
                  {formatDate(order.createdAt)}
                </div>

                <div className="admin-order-total">
                  <strong>৳{Number(order.total).toFixed(2)}</strong>
                  <span>
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div>
                  <span className={`order-status status-${order.status}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="admin-order-action">
                  <Link href={`/admin/orders/${order.id}`}>
                    View order →
                  </Link>
                </div>
              </article>
            ))}
          </>
        )}
      </section>
    </main>
  );
}

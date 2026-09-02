"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatStatus(status) {
  return (
    STATUS_LABELS[status] ||
    status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatMoney(value) {
  return `৳${Number(value || 0).toFixed(2)}`;
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
        throw new Error(result?.message || "Failed to load orders.");
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

  async function handleRefresh() {
    await loadOrders();

    await Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Orders refreshed",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
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
              disabled={loading && status === item}
            >
              {item === "all" ? "All orders" : formatStatus(item)}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="admin-refresh"
          onClick={handleRefresh}
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
        <div className="admin-orders-topline">
          <div>
            <p className="eyebrow">Order queue</p>
            <h2>
              {loading
                ? "Loading orders..."
                : `${orders.length} ${
                    orders.length === 1 ? "order" : "orders"
                  }`}
            </h2>
          </div>

          {!loading && orders.length > 0 && (
            <span className="admin-orders-count">
              {status === "all" ? "All statuses" : formatStatus(status)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="admin-empty admin-orders-empty">
            <div className="admin-orders-loader" />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty admin-orders-empty">
            <p className="eyebrow">Nothing here yet</p>
            <h2>No orders found.</h2>
            <p>
              Customer orders will appear here once someone completes a
              purchase.
            </p>
          </div>
        ) : (
          <div className="admin-orders-list">
            <div className="admin-orders-head">
              <span>Order</span>
              <span>Customer</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
              <span />
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
                  <strong>{formatMoney(order.total)}</strong>
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
                    View order
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

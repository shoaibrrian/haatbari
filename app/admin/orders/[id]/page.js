"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const ORDER_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatStatus(status) {
  return (
    STATUS_LABELS[status] ||
    status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatMoney(value) {
  return `৳${Number(value || 0).toFixed(2)}`;
}

export default function AdminOrderDetailsPage({ params }) {
  const { id } = use(params);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState("");

  async function loadOrder() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${id}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load order.");
      }

      setOrder(result.data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  const nextStatuses = useMemo(() => {
    if (!order) return [];
    return ORDER_STATUS_TRANSITIONS[order.status] || [];
  }, [order]);

  async function updateStatus(nextStatus) {
    if (!order || changing) return;

    const isCancelling = nextStatus === "cancelled";

    const result = await Swal.fire({
      title: isCancelling
        ? "Cancel this order?"
        : `Mark as ${formatStatus(nextStatus)}?`,
      text: isCancelling
        ? "The order will be cancelled and its reserved stock will be returned."
        : `This will move the order from ${formatStatus(order.status)} to ${formatStatus(nextStatus)}.`,
      icon: isCancelling ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: isCancelling
        ? "Yes, cancel order"
        : `Yes, ${formatStatus(nextStatus)}`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "haatbari-swal-popup",
        title: "haatbari-swal-title",
        htmlContainer: "haatbari-swal-text",
        confirmButton: isCancelling
          ? "haatbari-swal-danger"
          : "haatbari-swal-confirm",
        cancelButton: "haatbari-swal-cancel",
      },
    });

    if (!result.isConfirmed) return;

    setChanging(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || "Could not update order.");
      }

      setOrder(responseData.data);

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Order ${formatStatus(nextStatus).toLowerCase()}`,
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (err) {
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Could not update order",
        text: err.message || "Something went wrong.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });

      setError(err.message || "Could not update order.");
    } finally {
      setChanging(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-page page-width">
        <div className="admin-detail-loading">
          <div className="admin-orders-loader" />
          <p>Loading order...</p>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="admin-page page-width">
        <Link href="/admin/orders" className="admin-back">
          ← Orders
        </Link>

        <div className="admin-empty admin-order-error-state">
          <p className="eyebrow">Unable to load</p>
          <h2>Order not found.</h2>
          <p>{error}</p>

          <button
            type="button"
            className="admin-primary-button"
            onClick={loadOrder}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="admin-page page-width">
      <header className="admin-order-detail-header">
        <div>
          <Link href="/admin/orders" className="admin-back">
            ← Orders
          </Link>

          <p className="eyebrow">Order details</p>

          <h1>
            Order
            <br />
            <em>#{order.id.slice(-8).toUpperCase()}.</em>
          </h1>

          <p className="admin-subtitle">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="admin-order-header-status">
          <span className={`order-status status-${order.status}`}>
            {formatStatus(order.status)}
          </span>
        </div>
      </header>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-order-detail-grid">
        <div className="admin-order-main">
          <div className="admin-detail-card">
            <div className="admin-detail-card-head">
              <div>
                <p className="eyebrow">Items</p>
                <h2>
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "product" : "products"}
                </h2>
              </div>
            </div>

            <div className="admin-order-items">
              {order.items.map((item) => (
                <article className="admin-order-item" key={item.productId}>
                  <div className="admin-order-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>

                  <div className="admin-order-item-info">
                    <strong>{item.title}</strong>

                    <span>
                      {item.quantity} × {formatMoney(item.unitPrice)}
                    </span>
                  </div>

                  <strong className="admin-order-item-total">
                    {formatMoney(item.lineTotal)}
                  </strong>
                </article>
              ))}
            </div>

            <div className="admin-order-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatMoney(order.subtotal)}</strong>
              </div>

              <div>
                <span>Delivery fee</span>
                <strong>{formatMoney(order.deliveryFee)}</strong>
              </div>

              <div className="admin-order-summary-total">
                <span>Total</span>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>
          </div>

          <div className="admin-detail-card">
            <div className="admin-detail-card-head">
              <div>
                <p className="eyebrow">Customer</p>
                <h2>Delivery information</h2>
              </div>
            </div>

            <div className="admin-customer-profile">
              <div className="admin-customer-avatar">
                {order.customer.firstName?.charAt(0)}
                {order.customer.lastName?.charAt(0)}
              </div>

              <div className="admin-customer-profile-info">
                <strong>
                  {order.customer.firstName} {order.customer.lastName}
                </strong>

                <span>{order.customer.phone}</span>
              </div>
            </div>

            <div className="admin-detail-info">
              <div>
                <span>Phone</span>
                <strong>{order.customer.phone}</strong>
              </div>

              <div>
                <span>Delivery address</span>
                <strong>{order.customer.address}</strong>
              </div>

              <div>
                <span>Payment method</span>
                <strong>
                  {order.paymentMethod === "cash_on_delivery"
                    ? "Cash on delivery"
                    : order.paymentMethod}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <aside className="admin-order-sidebar">
          <div className="admin-detail-card">
            <div className="admin-detail-card-head">
              <div>
                <p className="eyebrow">Fulfilment</p>
                <h2>Order status</h2>
              </div>
            </div>

            <div className="admin-order-status-current">
              <span>Current status</span>

              <strong className={`order-status status-${order.status}`}>
                {formatStatus(order.status)}
              </strong>
            </div>

            {nextStatuses.length > 0 ? (
              <div className="admin-status-actions">
                <p>Move order to</p>

                <div className="admin-status-buttons">
                  {nextStatuses.map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      className={
                        nextStatus === "cancelled"
                          ? "admin-order-status-button admin-order-status-danger"
                          : "admin-order-status-button"
                      }
                      onClick={() => updateStatus(nextStatus)}
                      disabled={changing}
                    >
                      {changing ? "Updating..." : formatStatus(nextStatus)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="admin-order-terminal">
                <span>This order is in a final status.</span>
              </div>
            )}
          </div>

          <div className="admin-detail-card admin-order-meta-card">
            <p className="eyebrow">Summary</p>

            <div className="admin-meta-row">
              <span>Order ID</span>
              <strong>#{order.id.slice(-8).toUpperCase()}</strong>
            </div>

            <div className="admin-meta-row">
              <span>Items</span>
              <strong>{order.items.length}</strong>
            </div>

            <div className="admin-meta-row">
              <span>Payment</span>
              <strong>COD</strong>
            </div>

            <div className="admin-meta-row">
              <span>Placed</span>
              <strong>{formatDate(order.createdAt)}</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

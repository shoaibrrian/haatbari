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
  return STATUS_LABELS[status] || status;
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

function getInitials(firstName = "", lastName = "") {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function AdminOrderDetailsPage({ params }) {
  const { id } = use(params);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
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
    } catch (loadError) {
      setError(loadError.message || "Could not load order.");
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

  async function changeStatus(nextStatus) {
    if (!order || changingStatus) return;

    const result = await Swal.fire({
      title: `Move order to ${formatStatus(nextStatus)}?`,
      text:
        nextStatus === "cancelled"
          ? "This will cancel the order and return the ordered products to stock."
          : `The order will move from ${formatStatus(order.status)} to ${formatStatus(nextStatus)}.`,
      icon: nextStatus === "cancelled" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText:
        nextStatus === "cancelled"
          ? "Yes, cancel order"
          : `Yes, ${formatStatus(nextStatus).toLowerCase()}`,
      cancelButtonText: "Keep order",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "haatbari-swal-popup",
        title: "haatbari-swal-title",
        htmlContainer: "haatbari-swal-text",
        confirmButton:
          nextStatus === "cancelled"
            ? "haatbari-swal-danger"
            : "haatbari-swal-confirm",
        cancelButton: "haatbari-swal-cancel",
      },
    });

    if (!result.isConfirmed) return;

    setChangingStatus(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${id}`, {
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
        throw new Error(
          responseData?.message || "Could not update order status.",
        );
      }

      setOrder(responseData.data);

      await Swal.fire({
        icon: "success",
        title: "Order updated",
        text: `Order is now ${formatStatus(nextStatus)}.`,
        confirmButtonText: "Done",
        buttonsStyling: false,
        customClass: {
          popup: "haatbari-swal-popup",
          title: "haatbari-swal-title",
          htmlContainer: "haatbari-swal-text",
          confirmButton: "haatbari-swal-confirm",
        },
      });
    } catch (statusError) {
      setError(statusError.message || "Could not update order status.");

      await Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: statusError.message || "Could not update order status.",
        confirmButtonText: "Close",
        buttonsStyling: false,
        customClass: {
          popup: "haatbari-swal-popup",
          title: "haatbari-swal-title",
          htmlContainer: "haatbari-swal-text",
          confirmButton: "haatbari-swal-confirm",
        },
      });
    } finally {
      setChangingStatus(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-page page-width">
        <div className="admin-empty">
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

        <div className="admin-error" role="alert">
          {error}
        </div>
      </main>
    );
  }

  if (!order) return null;

  const customerName =
    `${order.customer.firstName} ${order.customer.lastName}`.trim();

  return (
    <main className="admin-page page-width">
      <header className="admin-page-header admin-order-detail-header">
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
          <section className="admin-detail-card">
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
                <div className="admin-order-item" key={item.productId}>
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
                </div>
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

              <div className="admin-order-grand-total">
                <span>Total</span>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>
          </section>

          <section className="admin-detail-card">
            <div className="admin-detail-card-head">
              <div>
                <p className="eyebrow">Fulfilment</p>
                <h2>Order status</h2>
              </div>
            </div>

            <div className="admin-order-status-current">
              <div>
                <span className="admin-detail-label">Current status</span>

                <span className={`order-status status-${order.status}`}>
                  {formatStatus(order.status)}
                </span>
              </div>

              <div>
                <span className="admin-detail-label">Payment</span>

                <strong>
                  {order.paymentMethod === "cash_on_delivery"
                    ? "Cash on delivery"
                    : order.paymentMethod}
                </strong>
              </div>
            </div>

            {nextStatuses.length > 0 ? (
              <div className="admin-status-actions">
                <span className="admin-detail-label">Move order to</span>

                <div className="admin-status-buttons">
                  {nextStatuses.map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      className={
                        nextStatus === "cancelled"
                          ? "admin-order-status-danger"
                          : "admin-order-status-button"
                      }
                      onClick={() => changeStatus(nextStatus)}
                      disabled={changingStatus}
                    >
                      {changingStatus
                        ? "Updating..."
                        : formatStatus(nextStatus)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="admin-order-terminal">
                This order is in a final status and cannot be changed.
              </div>
            )}
          </section>
        </div>

        <aside className="admin-order-sidebar">
          <section className="admin-detail-card">
            <div className="admin-detail-card-head">
              <div>
                <p className="eyebrow">Customer</p>
                <h2>Customer details</h2>
              </div>
            </div>

            <div className="admin-customer-profile">
              <div className="admin-customer-avatar">
                {getInitials(order.customer.firstName, order.customer.lastName)}
              </div>

              <div>
                <strong>{customerName}</strong>
                <span>{order.customer.phone}</span>
              </div>
            </div>

            <div className="admin-detail-info">
              <div>
                <span className="admin-detail-label">Phone</span>
                <strong>{order.customer.phone}</strong>
              </div>

              <div>
                <span className="admin-detail-label">Delivery address</span>
                <strong>{order.customer.address}</strong>
              </div>
            </div>
          </section>

          <section className="admin-detail-card">
            <div className="admin-detail-card-head">
              <div>
                <p className="eyebrow">Payment</p>
                <h2>Payment details</h2>
              </div>
            </div>

            <div className="admin-detail-info">
              <div>
                <span className="admin-detail-label">Method</span>

                <strong>
                  {order.paymentMethod === "cash_on_delivery"
                    ? "Cash on delivery"
                    : order.paymentMethod}
                </strong>
              </div>

              <div>
                <span className="admin-detail-label">Amount</span>

                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

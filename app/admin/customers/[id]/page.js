"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString("en-BD")}`;
}

function getInitials(firstName, lastName) {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

function getStatusClass(status) {
  return `admin-customer-status admin-customer-status-${status}`;
}

export default function AdminCustomerDetailsPage({ params }) {
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        const response = await fetch(`/api/admin/customers/${id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load customer.");
        }

        setCustomer(result.data?.customer || null);
        setStats(result.data?.stats || null);
        setOrders(result.data?.orders || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [params]);

  if (loading) {
    return (
      <main className="admin-page page-width">
        <div className="admin-customer-detail-loading">
          <div className="admin-orders-loader" />
          <p>Loading customer...</p>
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="admin-page page-width">
        <Link href="/admin/customers" className="admin-back">
          ← Customers
        </Link>

        <div className="admin-customer-detail-error">
          <p className="eyebrow">Customer unavailable</p>

          <h1>
            Customer
            <br />
            <em>not found.</em>
          </h1>

          <p>{error || "This customer could not be found."}</p>

          <Link href="/admin/customers" className="admin-primary-link">
            Back to customers →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page page-width">
      <header className="admin-page-header">
        <div>
          <Link href="/admin/customers" className="admin-back">
            ← Customers
          </Link>

          <p className="eyebrow">Customer profile</p>

          <h1>
            {customer.firstName}
            <br />
            <em>{customer.lastName}.</em>
          </h1>

          <p className="admin-subtitle">
            Customer profile, activity and order history.
          </p>
        </div>
      </header>

      <section className="admin-customer-profile">
        <div className="admin-customer-profile-main">
          <div className="admin-customer-profile-avatar">
            {getInitials(customer.firstName, customer.lastName)}
          </div>

          <div>
            <p className="eyebrow">Registered customer</p>

            <h2>
              {customer.firstName} {customer.lastName}
            </h2>

            <p>Joined {formatDate(customer.createdAt)}</p>
          </div>
        </div>

        <div className="admin-customer-profile-contact">
          <div>
            <span>Email</span>
            <strong>{customer.email || "—"}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{customer.phone || "—"}</strong>
          </div>

          <div>
            <span>Address</span>
            <strong>{customer.address || "No address added"}</strong>
          </div>
        </div>
      </section>

      <section className="admin-customer-stat-grid">
        <article className="admin-customer-stat">
          <span>Total orders</span>
          <strong>{stats?.totalOrders || 0}</strong>
          <small>All orders placed</small>
        </article>

        <article className="admin-customer-stat">
          <span>Active orders</span>
          <strong>{stats?.activeOrders || 0}</strong>
          <small>Excluding cancelled</small>
        </article>

        <article className="admin-customer-stat">
          <span>Total spent</span>
          <strong>{formatMoney(stats?.totalSpent)}</strong>
          <small>Completed order value</small>
        </article>
      </section>

      <section className="admin-customer-orders">
        <div className="admin-customer-orders-header">
          <div>
            <p className="eyebrow">Order history</p>

            <h2>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </h2>
          </div>

          <span>{customer.firstName}'s activity</span>
        </div>

        {orders.length === 0 ? (
          <div className="admin-empty admin-customer-orders-empty">
            <p className="eyebrow">No orders</p>

            <h2>No order history yet.</h2>

            <p>Orders placed by this customer will appear here.</p>
          </div>
        ) : (
          <div className="admin-customer-order-list">
            {orders.map((order) => (
              <article className="admin-customer-order-row" key={order.id}>
                <div className="admin-customer-order-id">
                  <span>Order</span>

                  <strong>#{order.id.slice(-8).toUpperCase()}</strong>
                </div>

                <div className="admin-customer-order-date">
                  <span>Date</span>

                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div className="admin-customer-order-items">
                  <span>Items</span>

                  <strong>
                    {order.items} {order.items === 1 ? "item" : "items"}
                  </strong>
                </div>

                <div className="admin-customer-order-status">
                  <span>Status</span>

                  <strong className={getStatusClass(order.status)}>
                    {order.status}
                  </strong>
                </div>

                <div className="admin-customer-order-total">
                  <span>Total</span>

                  <strong>{formatMoney(order.total)}</strong>
                </div>

                <div className="admin-customer-order-action">
                  <Link href={`/admin/orders/${order.id}`}>
                    View
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="admin-footer">
        <span>HaatBari Admin</span>

        <span>Store management · Orders · Products · Customers</span>
      </footer>
    </main>
  );
}

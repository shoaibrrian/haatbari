"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(firstName, lastName) {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function loadCustomers(search = "") {
    try {
      if (search) {
        setSearching(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams({
        limit: "50",
      });

      if (search.trim()) {
        params.set("q", search.trim());
      }

      const response = await fetch(
        `/api/admin/customers?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load customers.");
      }

      setCustomers(result.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function handleRefresh() {
    await loadCustomers(query);

    await Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Customers refreshed",
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

          <p className="eyebrow">Customer management</p>

          <h1>
            Manage
            <br />
            <em>customers.</em>
          </h1>

          <p className="admin-subtitle">
            View registered customers and keep track of their activity.
          </p>
        </div>
      </header>

      <section className="admin-customer-toolbar">
        <div className="admin-customer-search">
          <span>⌕</span>

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers..."
          />
        </div>

        <button
          type="button"
          className="admin-refresh"
          onClick={handleRefresh}
          disabled={loading || searching}
        >
          {loading || searching ? "Loading..." : "Refresh ↻"}
        </button>
      </section>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-customers">
        <div className="admin-customers-topline">
          <div>
            <p className="eyebrow">Customer directory</p>

            <h2>
              {loading
                ? "Loading customers..."
                : `${customers.length} ${
                    customers.length === 1 ? "customer" : "customers"
                  }`}
            </h2>
          </div>

          {!loading && (
            <span className="admin-customers-count">
              {query.trim() ? "Search results" : "All customers"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="admin-empty admin-customers-empty">
            <div className="admin-orders-loader" />
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="admin-empty admin-customers-empty">
            <p className="eyebrow">
              {query.trim() ? "No matches" : "Nothing here yet"}
            </p>

            <h2>
              {query.trim() ? "No customers found." : "No customers yet."}
            </h2>

            <p>
              {query.trim()
                ? "Try searching with a different name, email or phone number."
                : "Registered customers will appear here once they create an account."}
            </p>
          </div>
        ) : (
          <div className="admin-customers-list">
            <div className="admin-customers-head">
              <span>Customer</span>
              <span>Contact</span>
              <span>Orders</span>
              <span>Joined</span>
              <span />
            </div>

            {customers.map((customer) => (
              <article className="admin-customer-row" key={customer.id}>
                <div className="admin-customer-main">
                  <div className="admin-customer-avatar">
                    {getInitials(customer.firstName, customer.lastName)}
                  </div>

                  <div className="admin-customer-main-info">
                    <strong>
                      {customer.firstName} {customer.lastName}
                    </strong>

                    <span>{customer.email || "No email"}</span>
                  </div>
                </div>

                <div className="admin-customer-contact">
                  <span>{customer.phone || "—"}</span>
                </div>

                <div className="admin-customer-orders">
                  <strong>{customer.orderCount}</strong>

                  <span>{customer.orderCount === 1 ? "order" : "orders"}</span>
                </div>

                <div className="admin-customer-date">
                  {formatDate(customer.createdAt)}
                </div>

                <div className="admin-customer-action">
                  <Link href={`/admin/customers/${customer.id}`}>
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

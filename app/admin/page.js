"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function formatMoney(value) {
  const amount = Number(value || 0);

  if (amount >= 1000000) {
    return `৳${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `৳${(amount / 1000).toFixed(1)}K`;
  }

  return `৳${amount.toFixed(0)}`;
}

function formatGrowth(value) {
  const amount = Number(value || 0);

  if (amount === 0) {
    return "No change this month";
  }

  return `${amount > 0 ? "+" : ""}${amount.toFixed(1)}% this month`;
}

export default function AdminPage() {
  const { data: session } = useSession();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminName = session?.user?.firstName || session?.user?.name || "Admin";

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load dashboard.");
      }

      setDashboard(result.data);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    {
      label: "Total orders",
      value: loading ? "—" : String(dashboard?.orders?.total ?? 0),
      note: loading ? "Loading..." : formatGrowth(dashboard?.orders?.growth),
      icon: "↗",
    },
    {
      label: "Products",
      value: loading ? "—" : String(dashboard?.products?.total ?? 0),
      note: loading
        ? "Loading..."
        : `${dashboard?.products?.lowStock ?? 0} low in stock`,
      icon: "□",
    },
    {
      label: "Customers",
      value: loading ? "—" : String(dashboard?.customers?.total ?? 0),
      note: loading
        ? "Loading..."
        : `+${dashboard?.customers?.thisMonth ?? 0} this month`,
      icon: "◎",
    },
    {
      label: "Revenue",
      value: loading ? "—" : formatMoney(dashboard?.revenue?.thisMonth),
      note: loading ? "Loading..." : formatGrowth(dashboard?.revenue?.growth),
      icon: "৳",
    },
  ];

  const operations = [
    {
      number: "01",
      title: "Manage products",
      description: "Add, edit and organize products in your store.",
      href: "/admin/products",
      action: "Open products",
    },
    {
      number: "02",
      title: "Manage orders",
      description: "Review orders, update status and handle deliveries.",
      href: "/admin/orders",
      action: "View orders",
    },
    {
      number: "03",
      title: "Customers",
      description: "View registered customers and their account details.",
      href: "/admin/customers",
      action: "View customers",
    },
  ];

  const quickLinks = [
    {
      title: "Add product",
      description: "Create a new product listing.",
      href: "/admin/products/new",
      symbol: "+",
    },
    {
      title: "All products",
      description: "Browse your complete catalog.",
      href: "/admin/products",
      symbol: "↗",
    },
    {
      title: "Orders",
      description: "Check recent customer orders.",
      href: "/admin/orders",
      symbol: "□",
    },
    {
      title: "Storefront",
      description: "Open the public HaatBari store.",
      href: "/shop",
      symbol: "◎",
    },
  ];

  return (
    <main className="admin-page page-width">
      <header className="admin-header">
        <div>
          <span className="eyebrow">HaatBari administration</span>

          <h1>
            Good to see you,
            <br />
            <em>{adminName}.</em>
          </h1>

          <p className="admin-header-copy">
            Manage your store, products, orders and customers from one place.
          </p>
        </div>

        <div className="admin-header-side">
          <div className="admin-status">
            <span className="admin-status-dot" />
            Store is live
          </div>

          <Link href="/shop" className="admin-store-link">
            View storefront
            <span>↗</span>
          </Link>
        </div>
      </header>

      <section className="admin-stats" aria-label="Store overview">
        {stats.map((stat) => (
          <article className="admin-stat" key={stat.label}>
            <div className="admin-stat-top">
              <span>{stat.label}</span>

              <span className="admin-stat-icon">{stat.icon}</span>
            </div>

            <strong>{stat.value}</strong>

            <p>{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="admin-main-grid">
        <div className="admin-primary">
          <div className="admin-section-heading">
            <div>
              <span className="kicker">Store operations</span>

              <h2>
                Run the store.
                <br />
                <em>Keep things moving.</em>
              </h2>
            </div>

            <span className="admin-section-count">03 areas</span>
          </div>

          <div className="admin-operation-list">
            {operations.map((item) => (
              <Link
                href={item.href}
                className="admin-operation"
                key={item.number}
              >
                <span className="admin-operation-number">{item.number}</span>

                <div className="admin-operation-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <span className="admin-operation-action">
                  {item.action}
                  <span>↗</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="admin-side-card">
          <div className="admin-side-card-top">
            <span className="kicker">Today</span>
            <span className="admin-live-dot" />
          </div>

          <h3>
            Your store
            <br />
            <em>at a glance.</em>
          </h3>

          <div className="admin-today-list">
            <div>
              <span>Pending orders</span>

              <strong>
                {loading ? "—" : (dashboard?.today?.pendingOrders ?? 0)}
              </strong>
            </div>

            <div>
              <span>Low stock items</span>

              <strong>
                {loading ? "—" : (dashboard?.today?.lowStockItems ?? 0)}
              </strong>
            </div>

            <div>
              <span>New customers</span>

              <strong>
                {loading ? "—" : (dashboard?.today?.newCustomers ?? 0)}
              </strong>
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="button button-dark admin-full-button"
          >
            Review orders
            <span>↗</span>
          </Link>
        </aside>
      </section>

      <section className="admin-quick-section">
        <div className="admin-section-heading admin-section-heading-small">
          <div>
            <span className="kicker">Quick access</span>
            <h2>Everything you need.</h2>
          </div>
        </div>

        <div className="admin-quick-grid">
          {quickLinks.map((item) => (
            <Link
              href={item.href}
              className="admin-quick-card"
              key={item.title}
            >
              <span className="admin-quick-symbol">{item.symbol}</span>

              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <span className="admin-quick-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="admin-footer">
        <span>HaatBari Admin</span>

        <span>Store management · Orders · Products · Customers</span>
      </footer>
    </main>
  );
}

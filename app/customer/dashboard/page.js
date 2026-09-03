"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

export default function CustomerDashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        const response = await fetch("/api/customer/dashboard");

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const result = await response.json();
        setDashboard(result.data);
        const accountResponse = await fetch("/api/customer/account");

        if (accountResponse.ok) {
          const accountResult = await accountResponse.json();
          setProfile(accountResult?.data?.data || null);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <main className="customer-dashboard page-width">
        <section className="customer-dashboard-loading">
          <div className="dashboard-skeleton dashboard-skeleton-title" />
          <div className="dashboard-skeleton dashboard-skeleton-text" />

          <div className="dashboard-stats-skeleton">
            <div className="dashboard-skeleton dashboard-skeleton-card" />
            <div className="dashboard-skeleton dashboard-skeleton-card" />
            <div className="dashboard-skeleton dashboard-skeleton-card" />
            <div className="dashboard-skeleton dashboard-skeleton-card" />
          </div>
        </section>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="customer-dashboard page-width">
        <section className="customer-empty-state">
          <p className="eyebrow">HaatBari account</p>
          <h1>
            Sign in to view your
            <br />
            <em>dashboard.</em>
          </h1>
          <Link href="/account" className="customer-dashboard-primary">
            Sign in →
          </Link>
        </section>
      </main>
    );
  }

  const data = dashboard?.data || {};
  const stats = data.stats || {};
  const customer = data.customer;
  const recentOrders = data.recentOrders || [];

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    "Customer";

  return (
    <main className="customer-dashboard page-width">
      <section className="customer-dashboard-hero">
        <div>
          <p className="eyebrow">Customer dashboard</p>

          <h1>
            Welcome back,
            <br />
            <em>{displayName}.</em>
          </h1>

          <p className="customer-dashboard-intro">
            Keep track of your orders, spending and delivery details from one
            place.
          </p>
        </div>

        <div className="customer-dashboard-profile">
          {user?.hasImage ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="customer-dashboard-avatar"
            />
          ) : (
            <span className="customer-dashboard-avatar customer-dashboard-avatar-fallback">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}

          <div>
            <strong>{displayName}</strong>
            <span>
              {user?.primaryEmailAddress?.emailAddress || "HaatBari customer"}
            </span>
          </div>
        </div>
      </section>

      <section className="customer-dashboard-stats">
        <div className="customer-stat">
          <span>Total orders</span>
          <strong>{stats.totalOrders ?? 0}</strong>
        </div>

        <div className="customer-stat">
          <span>Pending orders</span>
          <strong>{stats.pendingOrders ?? 0}</strong>
        </div>

        <div className="customer-stat">
          <span>Delivered</span>
          <strong>{stats.deliveredOrders ?? 0}</strong>
        </div>

        <div className="customer-stat">
          <span>Total spent</span>
          <strong>৳{Number(stats.totalSpent || 0).toLocaleString()}</strong>
        </div>
      </section>

      <section className="customer-dashboard-grid">
        <div className="customer-dashboard-orders">
          <div className="customer-section-heading">
            <div>
              <p className="eyebrow">Your activity</p>
              <h2>Recent orders</h2>
            </div>

            <Link href="/orders">View all →</Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="customer-order-list">
              {recentOrders.map((order) => (
                <div className="customer-order-row" key={order.id}>
                  <div>
                    <strong>Order #{order.id?.slice(-6).toUpperCase()}</strong>

                    <span>
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "item" : "items"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="customer-order-meta">
                    <strong>
                      ৳{Number(order.total || 0).toLocaleString()}
                    </strong>

                    <span
                      className={`customer-order-status status-${order.status}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="customer-no-orders">
              <span>01</span>
              <div>
                <strong>No orders yet</strong>
                <p>Your recent orders will appear here after checkout.</p>
              </div>
              <Link href="/shop">Start shopping →</Link>
            </div>
          )}
        </div>

        <aside className="customer-dashboard-details">
          <div className="customer-section-heading">
            <div>
              <p className="eyebrow">Delivery details</p>
              <h2>Your information</h2>
            </div>
          </div>

          {profile ? (
            <div className="customer-details-list">
              <div>
                <span>Name</span>
                <strong>
                  {profile.firstName} {profile.lastName}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{profile.phone}</strong>
              </div>

              <div>
                <span>Address</span>
                <strong>{profile.address}</strong>
              </div>
            </div>
          ) : (
            <div className="customer-details-empty">
              <p>
                Your delivery information will appear here after your first
                order.
              </p>
              <Link href="/shop">Shop now →</Link>
            </div>
          )}

          <Link
            href="/account/profile"
            className="customer-dashboard-secondary"
          >
            Manage account
          </Link>
        </aside>
      </section>

      <div className="customer-dashboard-footer">
        <span>HaatBari</span>
        <span>Everything you need, in one place.</span>
        <Link href="/shop">Continue shopping →</Link>
      </div>
    </main>
  );
}

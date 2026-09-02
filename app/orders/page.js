"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function OrdersPage() {
  const { isLoaded, isSignedIn } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        const response = await fetch("/api/customer/orders?limit=50");

        if (!response.ok) {
          throw new Error("Failed to load orders");
        }

        const result = await response.json();

        setOrders(result.data?.data?.items || []);
      } catch (error) {
        console.error("Orders error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <main className="orders-page page-width">
        <div className="orders-loading">
          <div className="orders-skeleton orders-skeleton-title" />
          <div className="orders-skeleton orders-skeleton-text" />

          <div className="orders-loading-list">
            <div className="orders-skeleton orders-skeleton-row" />
            <div className="orders-skeleton orders-skeleton-row" />
            <div className="orders-skeleton orders-skeleton-row" />
          </div>
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="orders-page page-width">
        <section className="orders-empty-state">
          <p className="eyebrow">HaatBari account</p>

          <h1>
            Sign in to view your
            <br />
            <em>orders.</em>
          </h1>

          <Link href="/account" className="orders-primary-button">
            Sign in →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page page-width">
      <header className="orders-header">
        <div>
          <p className="eyebrow">Your activity</p>

          <h1>
            My
            <br />
            <em>orders.</em>
          </h1>

          <p className="orders-header-copy">
            Track your purchases and keep an eye on every delivery from one
            place.
          </p>
        </div>

        <Link href="/shop" className="orders-shop-link">
          Continue shopping →
        </Link>
      </header>

      {orders.length > 0 ? (
        <section className="orders-list">
          {orders.map((order) => (
            <article className="orders-card" key={order.id}>
              <div className="orders-card-main">
                <div className="orders-card-number">
                  <span>Order</span>
                  <strong>#{order.id?.slice(-6).toUpperCase()}</strong>
                </div>

                <div className="orders-card-info">
                  <strong>
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </strong>

                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="orders-card-right">
                <strong>৳{Number(order.total || 0).toLocaleString()}</strong>

                <span className={`orders-status orders-status-${order.status}`}>
                  {order.status}
                </span>

                <Link href={`/orders/${order.id}`}>View order →</Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="orders-no-orders">
          <span>01</span>

          <div>
            <strong>No orders yet</strong>
            <p>
              Your orders will appear here after you complete your first
              purchase.
            </p>
          </div>

          <Link href="/shop">Start shopping →</Link>
        </section>
      )}
    </main>
  );
}

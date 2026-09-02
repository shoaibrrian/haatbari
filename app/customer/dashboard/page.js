"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function CustomerDashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return <main className="page-width">Loading...</main>;
  }

  if (!isSignedIn) {
    return (
      <main className="page-width">
        <h1>Please sign in first</h1>
      </main>
    );
  }

  const stats = dashboard?.data?.stats;

  return (
    <main className="page-width">
      <section>
        <p className="eyebrow">Customer Dashboard</p>

        <h1>
          Your HaatBari
          <br />
          <em>account.</em>
        </h1>

        <div>
          <p>Total orders</p>
          <strong>{stats?.totalOrders ?? 0}</strong>
        </div>

        <div>
          <p>Pending orders</p>
          <strong>{stats?.pendingOrders ?? 0}</strong>
        </div>

        <div>
          <p>Delivered orders</p>
          <strong>{stats?.deliveredOrders ?? 0}</strong>
        </div>

        <div>
          <p>Total spent</p>
          <strong>৳{stats?.totalSpent ?? 0}</strong>
        </div>
      </section>
    </main>
  );
}

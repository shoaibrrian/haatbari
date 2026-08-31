"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Check the session after successful login
    const sessionResponse = await fetch("/api/auth/session");
    const session = await sessionResponse.json();

    if (session?.user?.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/account";
    }
  }

  return (
    <main className="account-page page-width">
      <section className="account-card">
        <div className="account-intro">
          <p className="eyebrow">Welcome back</p>

          <h1>
            Sign in to
            <br />
            <em>HaatBari.</em>
          </h1>

          <p>
            Access your account, view your orders and manage your HaatBari
            experience.
          </p>
        </div>

        <form className="account-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button-dark account-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            <span>{loading ? "…" : "↗"}</span>
          </button>

          <p className="account-switch">
            Don&apos;t have an account?{" "}
            <Link href="/account/login?mode=register">Create account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

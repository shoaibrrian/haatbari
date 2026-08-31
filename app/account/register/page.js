"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to create your account.");
      }

      router.push("/account/login?registered=true");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="account-page page-width">
      <section className="account-card">
        <div className="account-intro">
          <p className="eyebrow">Welcome to HaatBari</p>

          <h1>
            Create your
            <br />
            <em>account.</em>
          </h1>

          <p>
            Save your details, keep track of your orders, and make your next
            purchase faster.
          </p>
        </div>

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              First name
              <input
                required
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
              />
            </label>

            <label>
              Last name
              <input
                required
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </label>
          </div>

          <label>
            Email address
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </label>

          <label>
            Phone number
            <input
              required
              type="tel"
              name="phone"
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm password
            <input
              required
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              minLength={8}
              autoComplete="new-password"
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
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
            <span>{submitting ? "…" : "↗"}</span>
          </button>

          <p className="account-switch">
            Already have an account?{" "}
            <Link href="/account/login">Sign in →</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

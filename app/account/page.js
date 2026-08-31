"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AccountPage() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState(
    searchParams.get("mode") === "register" ? "register" : "login",
  );

  return (
    <main className="account-page page-width">
      <section className="account-shell">
        <div className="account-intro">
          <p className="eyebrow">Your HaatBari account</p>

          <h1>
            Shop better.
            <br />
            <em>Keep everything.</em>
          </h1>

          <p>
            Create an account to keep your orders, delivery details and shopping
            history together in one place.
          </p>

          <div className="account-benefits">
            <div>
              <strong>01</strong>
              <span>Track your orders</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Save your delivery details</span>
            </div>

            <div>
              <strong>03</strong>
              <span>View your complete order history</span>
            </div>
          </div>
        </div>

        <div className="account-form-wrap">
          <div className="account-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Create account
            </button>
          </div>

          {mode === "login" ? (
            <form className="account-form">
              <div>
                <p className="eyebrow">Welcome back</p>
                <h2>Sign in</h2>
                <p>Access your HaatBari orders and account details.</p>
              </div>

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
              </label>

              <button type="submit" className="button button-dark">
                Sign in <span>↗</span>
              </button>

              <p className="account-switch">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setMode("register")}>
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form className="account-form">
              <div>
                <p className="eyebrow">Join HaatBari</p>
                <h2>Create account</h2>
                <p>
                  Register once and keep your future orders connected to you.
                </p>
              </div>

              <div className="form-row">
                <label>
                  First name
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    required
                  />
                </label>

                <label>
                  Last name
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    required
                  />
                </label>
              </div>

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  minLength={8}
                  required
                />
              </label>

              <button type="submit" className="button button-dark">
                Create account <span>↗</span>
              </button>

              <p className="account-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </section>

      <div className="account-footer-note">
        <span>HaatBari</span>
        <span>Secure account · Order history · Easy checkout</span>
        <Link href="/shop">Continue shopping →</Link>
      </div>
    </main>
  );
}

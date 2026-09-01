"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AccountPage() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState(
    searchParams.get("mode") === "register" ? "register" : "login",
  );

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      console.log("SIGN IN RESULT:", result);

      if (result?.error) {
        setLoginError("Invalid email or password.");
        setLoginLoading(false);
        return;
      }

      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();

      console.log("SESSION:", session);

      if (session?.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/account";
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setLoginError("Something went wrong. Please try again.");
      setLoginLoading(false);
    }
  }

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
              onClick={() => {
                setMode("login");
                setLoginError("");
              }}
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
            <form className="account-form" onSubmit={handleLogin}>
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
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              {loginError && (
                <p className="account-error" role="alert">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="button button-dark"
                disabled={loginLoading}
              >
                {loginLoading ? "Signing in..." : "Sign in"}
                <span>{loginLoading ? "…" : "↗"}</span>
              </button>

              <p className="account-switch">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setLoginError("");
                  }}
                >
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form
              className="account-form"
              onSubmit={(event) => {
                event.preventDefault();
                window.location.href = "/account/register";
              }}
            >
              <div>
                <p className="eyebrow">Join HaatBari</p>

                <h2>Create account</h2>

                <p>
                  Register once and keep your future orders connected to you.
                </p>
              </div>

              <button type="submit" className="button button-dark">
                Continue to registration <span>↗</span>
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

"use client";

import Link from "next/link";
import { useState } from "react";
import { SignIn, SignUp, useAuth } from "@clerk/nextjs";

export default function AccountPage() {
  const { isLoaded } = useAuth();
  const [mode, setMode] = useState("login");

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

          <div className="account-form clerk-account-form">
            {!isLoaded ? (
              <div className="account-loading">
                <div className="account-loading-line account-loading-title" />
                <div className="account-loading-line" />
                <div className="account-loading-line account-loading-short" />

                <div className="account-loading-button" />
                <div className="account-loading-divider" />

                <div className="account-loading-input" />
                <div className="account-loading-input" />
                <div className="account-loading-button" />
              </div>
            ) : mode === "login" ? (
              <>
                <div>
                  <p className="eyebrow">Welcome back</p>

                  <h2>Sign in</h2>

                  <p>Access your HaatBari orders and account details.</p>
                </div>

                <SignIn
                  key="haatbari-sign-in"
                  routing="virtual"
                  appearance={{
                    layout: {
                      socialButtonsPlacement: "top",
                      socialButtonsVariant: "blockButton",
                    },
                    elements: {
                      rootBox: "hb-clerk-root",
                      card: "hb-clerk-card",
                      header: "hb-clerk-header",
                      headerTitle: "hb-clerk-header-title",
                      headerSubtitle: "hb-clerk-header-subtitle",

                      socialButtons: "hb-clerk-social-buttons",
                      socialButtonsBlockButton: "hb-clerk-social-button",
                      socialButtonsBlockButtonText: "hb-clerk-social-text",

                      dividerRow: "hb-clerk-divider-row",
                      dividerLine: "hb-clerk-divider-line",
                      dividerText: "hb-clerk-divider-text",

                      form: "hb-clerk-form",
                      formFieldRow: "hb-clerk-field-row",
                      formFieldLabel: "hb-clerk-label",
                      formFieldInput: "hb-clerk-input",

                      formButtonPrimary: "hb-clerk-primary",

                      footer: "hb-clerk-footer",
                      footerAction: "hb-clerk-footer-action",
                      footerActionLink: "hb-clerk-link",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <div>
                  <p className="eyebrow">Join HaatBari</p>

                  <h2>Create account</h2>

                  <p>
                    Register once and keep your future orders connected to you.
                  </p>
                </div>

                <SignUp
                  key="haatbari-sign-up"
                  routing="virtual"
                  appearance={{
                    layout: {
                      socialButtonsPlacement: "top",
                      socialButtonsVariant: "blockButton",
                    },
                    elements: {
                      rootBox: "hb-clerk-root",
                      card: "hb-clerk-card",
                      header: "hb-clerk-header",
                      headerTitle: "hb-clerk-header-title",
                      headerSubtitle: "hb-clerk-header-subtitle",

                      socialButtons: "hb-clerk-social-buttons",
                      socialButtonsBlockButton: "hb-clerk-social-button",
                      socialButtonsBlockButtonText: "hb-clerk-social-text",

                      dividerRow: "hb-clerk-divider-row",
                      dividerLine: "hb-clerk-divider-line",
                      dividerText: "hb-clerk-divider-text",

                      form: "hb-clerk-form",
                      formFieldRow: "hb-clerk-field-row",
                      formFieldLabel: "hb-clerk-label",
                      formFieldInput: "hb-clerk-input",

                      formButtonPrimary: "hb-clerk-primary",

                      footer: "hb-clerk-footer",
                      footerAction: "hb-clerk-footer-action",
                      footerActionLink: "hb-clerk-link",
                    },
                  }}
                />
              </>
            )}
          </div>
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

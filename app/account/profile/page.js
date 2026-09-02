"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

export default function AccountProfilePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function loadAccount() {
      try {
        const response = await fetch("/api/customer/account");

        if (!response.ok) {
          throw new Error("Failed to load account");
        }

        const result = await response.json();

        const data = result.data?.data || result.data;

        setForm({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || "",
          phone: data?.phone || "",
          address: data?.address || "",
        });
      } catch (error) {
        console.error("Account error:", error);

        Swal.fire({
          title: "Something went wrong",
          text: "We couldn't load your account information.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [isLoaded, isSignedIn]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch("/api/customer/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            result?.data?.error?.message ||
            "Failed to update account",
        );
      }

      const data = result.data?.data || result.data;

      setForm((current) => ({
        ...current,
        firstName: data?.firstName || current.firstName,
        lastName: data?.lastName || current.lastName,
        phone: data?.phone || current.phone,
        address: data?.address || current.address,
      }));

      await Swal.fire({
        title: "Account updated",
        text: "Your information has been saved successfully.",
        icon: "success",
        confirmButtonText: "Done",
      });
    } catch (error) {
      console.error("Account update error:", error);

      Swal.fire({
        title: "Update failed",
        text: error.message || "We couldn't update your account.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <main className="account-profile-page page-width">
        <div className="account-profile-loading">
          <div className="account-profile-skeleton account-profile-skeleton-title" />
          <div className="account-profile-skeleton account-profile-skeleton-card" />
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="account-profile-page page-width">
        <section className="account-profile-empty">
          <p className="eyebrow">HaatBari account</p>

          <h1>
            Sign in to manage
            <br />
            your <em>account.</em>
          </h1>

          <Link href="/account" className="orders-primary-button">
            Sign in →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="account-profile-page page-width">
      <header className="account-profile-header">
        <div>
          <Link href="/customer/dashboard" className="account-profile-back">
            ← Dashboard
          </Link>

          <p className="eyebrow">Account settings</p>

          <h1>
            Your
            <br />
            <em>information.</em>
          </h1>

          <p>
            Keep your contact and delivery information up to date for a smoother
            HaatBari experience.
          </p>
        </div>

        <div className="account-profile-avatar-wrap">
          <div className="account-profile-avatar">
            {user?.hasImage ? (
              <img src={user.imageUrl} alt={user.fullName || "Account"} />
            ) : (
              <span>
                {(form.firstName || user?.firstName || "C")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <label className="account-profile-photo-button">
            Change photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];

                if (!file || !user) return;

                try {
                  const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                  };

                  const compressedFile = await imageCompression(file, options);

                  await user.setProfileImage({
                    file: compressedFile,
                  });

                  await Swal.fire({
                    title: "Photo updated",
                    text: "Your profile photo has been updated successfully.",
                    icon: "success",
                    confirmButtonText: "Done",
                  });
                } catch (error) {
                  console.error("Profile photo error:", error);

                  Swal.fire({
                    title: "Upload failed",
                    text: "We couldn't update your profile photo.",
                    icon: "error",
                    confirmButtonText: "OK",
                  });
                }

                event.target.value = "";
              }}
            />
          </label>
        </div>
      </header>

      <section className="account-profile-card">
        <form onSubmit={handleSubmit}>
          <div className="account-profile-section">
            <div>
              <p className="eyebrow">Personal details</p>
              <h2>Basic information</h2>
            </div>

            <div className="account-profile-fields">
              <label>
                <span>First name</span>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Last name</span>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="account-profile-full">
                <span>Email</span>
                <input type="email" value={form.email} disabled />
                <small>
                  Email is managed through your HaatBari account sign-in.
                </small>
              </label>

              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="account-profile-full">
                <span>Delivery address</span>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={4}
                  placeholder="House, road, area and city"
                />
              </label>
            </div>
          </div>

          <div className="account-profile-footer">
            <Link href="/customer/dashboard">Cancel</Link>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes →"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

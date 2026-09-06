import { apiFetch } from "@/lib/api-client";

const GUEST_WISHLIST_KEY = "haatbari-wishlist";

function readGuestWishlist() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch (error) {
    console.error("Guest wishlist read error:", error);
    return [];
  }
}

function writeGuestWishlist(items) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      GUEST_WISHLIST_KEY,
      JSON.stringify([...new Set(items.map(String))]),
    );

    window.dispatchEvent(new Event("wishlist-updated"));
  } catch (error) {
    console.error("Guest wishlist write error:", error);
  }
}

export function getGuestWishlist() {
  return readGuestWishlist();
}

export function guestWishlistCount() {
  return readGuestWishlist().length;
}

export function addToGuestWishlist(productId) {
  const id = String(productId);
  const current = readGuestWishlist();

  if (!current.includes(id)) {
    writeGuestWishlist([...current, id]);
  }

  return readGuestWishlist();
}

export function removeFromGuestWishlist(productId) {
  const id = String(productId);
  const current = readGuestWishlist();

  writeGuestWishlist(current.filter((item) => item !== id));

  return readGuestWishlist();
}

export function clearGuestWishlist() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    window.dispatchEvent(new Event("wishlist-updated"));
  } catch (error) {
    console.error("Guest wishlist clear error:", error);
  }
}

// Existing MongoDB wishlist functions — unchanged

export async function getWishlist() {
  const response = await apiFetch("/api/customer/wishlist");

  return (
    response?.data?.data || {
      items: [],
      count: 0,
    }
  );
}

export async function addToWishlist(productId) {
  const response = await apiFetch("/api/customer/wishlist", {
    method: "POST",
    body: { productId },
  });

  return response?.data;
}

export async function removeFromWishlist(productId) {
  const response = await apiFetch(
    `/api/customer/wishlist?productId=${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );

  return response?.data;
}

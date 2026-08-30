const KEY = "haatbari-wishlist";

export function readWishlist() {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isWishlisted(id) {
  return readWishlist().includes(id);
}

export function toggleWishlist(id) {
  const current = readWishlist();

  const updated = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];

  localStorage.setItem(KEY, JSON.stringify(updated));

  window.dispatchEvent(new Event("wishlist-updated"));

  return updated;
}

export function wishlistCount() {
  return readWishlist().length;
}

export function clearWishlist() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("wishlist-updated"));
}

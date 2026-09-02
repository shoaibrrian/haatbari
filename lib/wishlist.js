import { apiFetch } from "@/lib/api-client";

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

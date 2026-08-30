import { apiFetch } from "@/lib/api-client";

const PRODUCT_CACHE_KEY = "haatbari-products-cache";
const PRODUCT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function readCachedProducts() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PRODUCT_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);

    if (!cached || !Array.isArray(cached.products) || !cached.cachedAt) {
      localStorage.removeItem(PRODUCT_CACHE_KEY);
      return null;
    }

    const isExpired = Date.now() - cached.cachedAt > PRODUCT_CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(PRODUCT_CACHE_KEY);
      return null;
    }

    return cached.products;
  } catch {
    localStorage.removeItem(PRODUCT_CACHE_KEY);
    return null;
  }
}

export function writeCachedProducts(products) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      PRODUCT_CACHE_KEY,
      JSON.stringify({
        products,
        cachedAt: Date.now(),
      }),
    );
  } catch {
    // Ignore localStorage quota/private-mode errors.
  }
}

export async function getProducts() {
  const cached = readCachedProducts();

  if (cached) {
    return cached;
  }

  const { data } = await apiFetch("/api/products?limit=60");

  writeCachedProducts(data);

  return data;
}

export function clearProductCache() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PRODUCT_CACHE_KEY);
}

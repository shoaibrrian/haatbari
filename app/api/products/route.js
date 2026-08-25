import { paginated } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { listProducts } from "@/modules/product/product.service";

/**
 * Note what is absent: no connectDB, no Product model, no try/catch, no
 * validation, no `.select('-embedding')`. Every one of those now lives in the
 * layer that owns it. If this file ever grows an `if`, the rule has been broken.
 *
 * There is deliberately no POST yet. Adding an unauthenticated "create product"
 * endpoint would be a new version of the /api/seed hole we are here to close,
 * so POST lands together with authentication.
 */
export const GET = withRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const { items, meta } = await listProducts(Object.fromEntries(searchParams));
  return paginated(items, meta);
});

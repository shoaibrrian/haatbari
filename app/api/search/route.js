import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { searchProducts } from "@/modules/product/product.service";

export const GET = withRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const { items, strategy, query } = await searchProducts(
    Object.fromEntries(searchParams),
  );

  return ok(items, {
    meta: { query, strategy, total: items.length },
  });
});

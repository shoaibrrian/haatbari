import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { getProduct } from "@/modules/product/product.service";

/**
 * `[identifier]`, not `[id]`, because the service accepts either a Mongo id or
 * a slug. Naming the segment `id` would be a lie to the next reader.
 *
 * In Next 15+ `params` is a Promise, so it must be awaited.
 */
export const GET = withRoute(async (_request, { params }) => {
  const { identifier } = await params;
  return ok(await getProduct(identifier));
});

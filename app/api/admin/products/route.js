import { paginated, ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { createProduct, listProducts } from "@/modules/product/product.service";

export const GET = withRoute(async (request) => {
  const { searchParams } = new URL(request.url);

  const query = Object.fromEntries(searchParams);
  query.includeInactive = true;

  const { items, meta } = await listProducts(query);

  return paginated(items, meta);
});

export const POST = withRoute(async (request) => {
  const body = await request.json();

  const product = await createProduct(body);

  return ok(product, { status: 201 });
});

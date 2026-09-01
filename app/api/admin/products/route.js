import { paginated, ok, fail } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createProduct, listProducts } from "@/modules/product/product.service";

export const GET = withRoute(async (request) => {
  const session = await requireAdmin();

  if (!session) {
    return fail({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Admin access required",
    });
  }

  const { searchParams } = new URL(request.url);

  const query = Object.fromEntries(searchParams);
  query.includeInactive = true;

  const { items, meta } = await listProducts(query);

  return paginated(items, meta);
});

export const POST = withRoute(async (request) => {
  const session = await requireAdmin();

  if (!session) {
    return fail({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Admin access required",
    });
  }

  const body = await request.json();

  const product = await createProduct(body);

  return ok(product, { status: 201 });
});

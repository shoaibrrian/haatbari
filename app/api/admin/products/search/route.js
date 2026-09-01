import { ok, fail } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { requireAdmin } from "@/lib/auth/require-admin";
import { searchAdminProducts } from "@/modules/product/product.service";

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

  const { items, strategy, query } = await searchAdminProducts(
    Object.fromEntries(searchParams),
  );

  return ok(items, {
    meta: {
      query,
      strategy,
      total: items.length,
    },
  });
});

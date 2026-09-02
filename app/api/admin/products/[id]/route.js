import { ok, fail } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { requireAdmin } from "@/lib/auth/require-admin";

import {
  getProductAdmin,
  updateProduct,
  deactivateProduct,
  activateProduct,
} from "@/modules/product/product.service";

export const GET = withRoute(async (request, context) => {
  const session = await requireAdmin();

  if (!session) {
    return fail({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Admin access required",
    });
  }

  const { id } = await context.params;

  const product = await getProductAdmin(id);

  return ok(product);
});

export const PATCH = withRoute(async (request, context) => {
  const session = await requireAdmin();

  if (!session) {
    return fail({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Admin access required",
    });
  }

  const { id } = await context.params;
  const body = await request.json();

  const product = await updateProduct(id, body);

  return ok(product);
});

export const DELETE = withRoute(async (request, context) => {
  const session = await requireAdmin();

  if (!session) {
    return fail({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Admin access required",
    });
  }

  const { id } = await context.params;

  const product = await deactivateProduct(id);

  return ok(product);
});

export const PUT = withRoute(async (request, context) => {
  const session = await requireAdmin();

  if (!session) {
    return fail({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Admin access required",
    });
  }

  const { id } = await context.params;

  const product = await activateProduct(id);

  return ok(product);
});

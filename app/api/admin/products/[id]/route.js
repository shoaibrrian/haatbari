import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import {
  updateProduct,
  deactivateProduct,
} from "@/modules/product/product.service";

export const PATCH = withRoute(async (request, context) => {
  const { id } = await context.params;
  const body = await request.json();

  const product = await updateProduct(id, body);

  return ok(product);
});

export const DELETE = withRoute(async (request, context) => {
  const { id } = await context.params;

  const product = await deactivateProduct(id);

  return ok(product);
});

import { requireAdmin } from "@/lib/auth/require-admin";

import { ok } from "@/lib/http/response";

import { withRoute } from "@/lib/http/with-route";

import { getOrder, updateOrderStatus } from "@/modules/order/order.service";

import readJson from "@/lib/http/read-json";

function unauthorized() {
  return new Response(
    JSON.stringify({
      message: "Admin access required",
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

export const GET = withRoute(async (_request, context) => {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  const { id } = await context.params;

  const order = await getOrder(id);

  return ok(order);
});

export const PATCH = withRoute(async (request, context) => {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  const { id } = await context.params;

  const order = await updateOrderStatus(id, await readJson(request));

  return ok(order);
});

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth-options";
import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { getOrder, updateOrderStatus } from "@/modules/order/order.service";
import readJson from "@/lib/http/read-json";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return session;
}

export const GET = withRoute(async (_request, context) => {
  const session = await requireAdmin();

  if (!session) {
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

  const { id } = await context.params;

  const order = await getOrder(id);

  return ok(order);
});

export const PATCH = withRoute(async (request, context) => {
  const session = await requireAdmin();

  if (!session) {
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

  const { id } = await context.params;

  const order = await updateOrderStatus(id, await readJson(request));

  return ok(order);
});

import { auth } from "@clerk/nextjs/server";
import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { findOrderById } from "@/modules/order/order.repository";
import { toPublicOrder } from "@/modules/order/order.dto";

export const GET = withRoute(async (request, { params }) => {
  const { userId } = await auth();

  if (!userId) {
    return ok({
      authenticated: false,
      data: null,
    });
  }

  const { id } = await params;

  const order = await findOrderById(id);

  if (!order || order.clerkUserId !== userId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Order not found",
        },
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return ok({
    authenticated: true,
    data: toPublicOrder(order),
  });
});

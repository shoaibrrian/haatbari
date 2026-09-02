import { auth } from "@clerk/nextjs/server";
import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { findOrders } from "@/modules/order/order.repository";
import { toPublicOrder } from "@/modules/order/order.dto";

export const GET = withRoute(async (request) => {
  const { userId } = await auth();

  if (!userId) {
    return ok({
      authenticated: false,
      data: null,
    });
  }

  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const { items, total } = await findOrders({
    clerkUserId: userId,
    page,
    limit,
  });

  return ok({
    authenticated: true,
    data: {
      items: items.map(toPublicOrder),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

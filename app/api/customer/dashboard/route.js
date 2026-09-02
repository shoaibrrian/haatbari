import { auth } from "@clerk/nextjs/server";

import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";

import { findOrders } from "@/modules/order/order.repository";
import { toPublicOrder } from "@/modules/order/order.dto";
import { syncClerkUser } from "@/lib/auth/sync-clerk-user";

export const GET = withRoute(async () => {
  const { userId } = await auth();


  if (!userId) {
    return ok({
      authenticated: false,
      data: null,
    });
  }

  const user = await syncClerkUser(userId);

  const { items: orders } = await findOrders({
    clerkUserId: userId,
    limit: 50,
  });

  const activeOrders = orders.filter((order) => order.status !== "cancelled");

  const pendingOrders = activeOrders.filter(
    (order) => order.status === "pending",
  ).length;

  const deliveredOrders = activeOrders.filter(
    (order) => order.status === "delivered",
  ).length;

  const totalSpent = activeOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  const recentOrders = orders.slice(0, 5).map(toPublicOrder);

  const latestOrder = orders[0] || null;

  return ok({
    authenticated: true,
    data: {
      stats: {
        totalOrders: activeOrders.length,
        pendingOrders,
        deliveredOrders,
        totalSpent,
      },

      customer: latestOrder
        ? {
            firstName: latestOrder.customer.firstName,
            lastName: latestOrder.customer.lastName,
            phone: latestOrder.customer.phone,
            address: latestOrder.customer.address,
          }
        : null,

      recentOrders,
    },
  });
});

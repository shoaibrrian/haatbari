import { requireAdmin } from "@/lib/auth/require-admin";

import { withRoute } from "@/lib/http/with-route";
import { ok } from "@/lib/http/response";

import Order from "@/modules/order/order.model";
import Product from "@/modules/product/product.model";

export const GET = withRoute(async () => {
  const admin = await requireAdmin();

  if (!admin) {
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

  const [orderStats, productCount] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          revenue: {
            $sum: "$total",
          },
        },
      },
    ]),

    Product.countDocuments({ isActive: true }),
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  };

  return ok({
    totalOrders: stats.totalOrders,
    pendingOrders: stats.pendingOrders,
    products: productCount,
    revenue: stats.revenue,
  });
});

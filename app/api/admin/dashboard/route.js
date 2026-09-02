import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";
import connectDB from "@/lib/db/connect";
import Product from "@/modules/product/product.model";
import Order from "@/modules/order/order.model";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Admin access required",
      },
      { status: 401 },
    );
  }

  try {
    await connectDB();

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const usersCollection = Product.db.collection("users");

    const [
      totalOrders,
      currentMonthOrders,
      previousMonthOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalCustomers,
      newCustomers,
      currentRevenue,
      previousRevenue,
      pendingOrders,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({
        status: { $ne: "cancelled" },
      }),

      // Orders this month
      Order.countDocuments({
        status: { $ne: "cancelled" },
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      }),

      // Orders previous month
      Order.countDocuments({
        status: { $ne: "cancelled" },
        createdAt: {
          $gte: startOfPreviousMonth,
          $lt: startOfMonth,
        },
      }),

      // Total products
      Product.countDocuments(),

      // Active products
      Product.countDocuments({
        isActive: true,
      }),

      // Active products with low stock
      Product.countDocuments({
        isActive: true,
        stock: {
          $gt: 0,
          $lte: 5,
        },
      }),

      // Total customers
      usersCollection.countDocuments({
        role: { $ne: "admin" },
      }),

      // New customers this month
      usersCollection.countDocuments({
        role: { $ne: "admin" },
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      }),

      // Revenue this month
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: {
              $gte: startOfMonth,
              $lt: startOfNextMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total",
            },
          },
        },
      ]),

      // Revenue previous month
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: {
              $gte: startOfPreviousMonth,
              $lt: startOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total",
            },
          },
        },
      ]),

      // Pending orders
      Order.countDocuments({
        status: "pending",
      }),
    ]);

    const revenueThisMonth = currentRevenue[0]?.total ?? 0;

    const revenuePreviousMonth = previousRevenue[0]?.total ?? 0;

    function calculateGrowth(current, previous) {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }

      return ((current - previous) / previous) * 100;
    }

    const orderGrowth = calculateGrowth(
      currentMonthOrders,
      previousMonthOrders,
    );

    const revenueGrowth = calculateGrowth(
      revenueThisMonth,
      revenuePreviousMonth,
    );

    return NextResponse.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          thisMonth: currentMonthOrders,
          growth: orderGrowth,
        },

        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
        },

        customers: {
          total: totalCustomers,
          thisMonth: newCustomers,
        },

        revenue: {
          thisMonth: revenueThisMonth,
          growth: revenueGrowth,
        },

        today: {
          pendingOrders,
          lowStockItems: lowStockProducts,
          newCustomers,
        },
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard statistics.",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

import connectDB from "@/lib/db/connect";
import Product from "@/modules/product/product.model";
import Order from "@/modules/order/order.model";

export async function GET(_request, context) {
  const admin = await requireAdmin();

  if (!admin) {
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

    const { id } = await context.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid customer id.",
        },
        { status: 400 },
      );
    }

    const usersCollection = Product.db.collection("users");

    const customer = await usersCollection.findOne(
      {
        _id: new Product.db.base.Types.ObjectId(id),
        role: { $ne: "admin" },
      },
      {
        projection: {
          passwordHash: 0,
        },
      },
    );

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        { status: 404 },
      );
    }

    const orders = await Order.find({
      "customer.phone": customer.phone,
    })
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .lean();

    const totalSpent = orders.reduce((sum, order) => {
      if (order.status === "cancelled") {
        return sum;
      }

      return sum + Number(order.total || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer._id.toString(),
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          role: customer.role || "buyer",
          createdAt: customer.createdAt || null,
        },

        stats: {
          totalOrders: orders.length,
          activeOrders: orders.filter((order) => order.status !== "cancelled")
            .length,
          totalSpent,
        },

        orders: orders.map((order) => ({
          id: order._id.toString(),
          total: order.total,
          status: order.status,
          items: order.items?.length || 0,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Admin customer details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load customer details.",
      },
      { status: 500 },
    );
  }
}

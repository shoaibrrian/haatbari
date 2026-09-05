import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

import connectDB from "@/lib/db/connect";
import Product from "@/modules/product/product.model";
import Order from "@/modules/order/order.model";

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      50,
    );

    const search = searchParams.get("q")?.trim() || "";

    const usersCollection = Product.db.collection("users");

    const filter = {
      role: { $ne: "admin" },
    };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      usersCollection
        .find(filter, {
          projection: {
            passwordHash: 0,
          },
        })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),

      usersCollection.countDocuments(filter),
    ]);

    const phones = customers.map((customer) => customer.phone).filter(Boolean);

    let orderCounts = [];

    if (phones.length > 0) {
      orderCounts = await Order.aggregate([
        {
          $match: {
            "customer.phone": {
              $in: phones,
            },
          },
        },
        {
          $group: {
            _id: "$customer.phone",
            count: {
              $sum: 1,
            },
          },
        },
      ]);
    }

    const orderCountMap = new Map(
      orderCounts.map((item) => [item._id, item.count]),
    );

    const items = customers.map((customer) => ({
      id: customer._id.toString(),
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      role: customer.role || "buyer",
      createdAt: customer.createdAt || null,
      orderCount: orderCountMap.get(customer.phone) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        query: search,
      },
    });
  } catch (error) {
    console.error("Admin customers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load customers.",
      },
      { status: 500 },
    );
  }
}

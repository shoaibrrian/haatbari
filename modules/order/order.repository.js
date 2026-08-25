import connectDB from "../../lib/db/connect.js";
import Order from "./order.model.js";

export async function createOrder(data, options = {}) {
  await connectDB();
  const [order] = await Order.create([data], options);
  return order.toObject();
}

export async function findOrderById(id, options = {}) {
  await connectDB();
  return Order.findById(id, null, options).lean();
}

export async function findOrders({ status, phone, page = 1, limit = 20 } = {}) {
  await connectDB();

  const filter = {};
  if (status) filter.status = status;
  if (phone) filter["customer.phone"] = phone;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { items, total };
}

export async function updateOrderStatusById(
  id,
  status,
  { expectedStatus, ...options } = {},
) {
  await connectDB();

  const filter = { _id: id };
  if (expectedStatus) filter.status = expectedStatus;

  return Order.findOneAndUpdate(
    filter,
    { status },
    { returnDocument: "after", runValidators: true, ...options },
  ).lean();
}

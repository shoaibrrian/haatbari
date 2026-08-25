import withTransaction from "../../lib/db/with-transaction.js";
import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from "../../lib/errors/app-error.js";
import {
  decrementProductStock,
  findProductsByIds,
  incrementProductStock,
} from "../product/product.repository.js";
import { DELIVERY_FEE, ORDER_STATUS_TRANSITIONS } from "./order.constants.js";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  orderIdSchema,
  toPublicOrder,
  updateOrderStatusSchema,
} from "./order.dto.js";
import {
  createOrder,
  findOrderById,
  findOrders,
  updateOrderStatusById,
} from "./order.repository.js";

function round2(value) {
  return Math.round(value * 100) / 100;
}

export async function placeOrder(input) {
  const { customer, items, paymentMethod } = createOrderSchema.parse(input);

  return withTransaction(async (session) => {
    const products = await findProductsByIds(
      items.map((item) => item.productId),
      { session },
    );

    const byId = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const problems = [];
    const lineItems = [];

    for (const item of items) {
      const product = byId.get(item.productId);

      if (!product || !product.isActive) {
        problems.push({
          productId: item.productId,
          reason: "unavailable",
        });
        continue;
      }

      if (product.stock < item.quantity) {
        problems.push({
          productId: item.productId,
          title: product.title,
          reason: "insufficient_stock",
          requested: item.quantity,
          available: product.stock,
        });
        continue;
      }

      lineItems.push({
        productId: product._id,
        title: product.title,
        slug: product.slug,
        image: product.image,
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal: round2(product.price * item.quantity),
      });
    }

    if (problems.length > 0) {
      throw new UnprocessableError(
        "Some items in your basket are no longer available",
        problems,
      );
    }

    const subtotal = round2(
      lineItems.reduce((sum, item) => sum + item.lineTotal, 0),
    );
    const deliveryFee = DELIVERY_FEE;
    const total = round2(subtotal + deliveryFee);

    for (const item of lineItems) {
      const reserved = await decrementProductStock(
        item.productId,
        item.quantity,
        { session },
      );

      if (!reserved) {
        throw new ConflictError(
          `${item.title} just went out of stock. Please review your basket.`,
        );
      }
    }

    const order = await createOrder(
      {
        customer,
        items: lineItems,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
      },
      { session },
    );

    return toPublicOrder(order);
  });
}

export async function getOrder(id) {
  const orderId = orderIdSchema.parse(id);
  const order = await findOrderById(orderId);

  if (!order) throw new NotFoundError("Order");

  return toPublicOrder(order);
}

export async function listOrders(query = {}) {
  const { page, limit, status, phone } = listOrdersQuerySchema.parse(query);
  const { items, total } = await findOrders({ page, limit, status, phone });

  return {
    items: items.map(toPublicOrder),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateOrderStatus(id, input) {
  const orderId = orderIdSchema.parse(id);
  const { status } = updateOrderStatusSchema.parse(input);

  const current = await findOrderById(orderId);
  if (!current) throw new NotFoundError("Order");

  if (current.status === status) return toPublicOrder(current);

  const allowed = ORDER_STATUS_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(status)) {
    throw new ConflictError(
      `Cannot move an order from ${current.status} to ${status}`,
      { from: current.status, allowed },
    );
  }

  if (status !== "cancelled") {
    const updated = await updateOrderStatusById(orderId, status, {
      expectedStatus: current.status,
    });

    if (!updated) {
      throw new ConflictError("This order was just updated by someone else.");
    }

    return toPublicOrder(updated);
  }

  return withTransaction(async (session) => {
    const updated = await updateOrderStatusById(orderId, status, {
      expectedStatus: current.status,
      session,
    });

    if (!updated) {
      throw new ConflictError("This order was just updated by someone else.");
    }

    for (const item of current.items) {
      await incrementProductStock(item.productId, item.quantity, { session });
    }

    return toPublicOrder(updated);
  });
}

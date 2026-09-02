import { auth } from "@clerk/nextjs/server";

import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import {
  findOrderById,
  updateOrderStatusById,
} from "@/modules/order/order.repository";
import { toPublicOrder } from "@/modules/order/order.dto";
import { ORDER_STATUS_TRANSITIONS } from "@/modules/order/order.constants";

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

export const PATCH = withRoute(async (request, { params }) => {
  const { userId } = await auth();

  if (!userId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Authentication required",
        },
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const { id } = await params;

  const order = await findOrderById(id);

  // Customer can only modify their own order.
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

  // Customer is only allowed to cancel these statuses.
  const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.status] || [];

  if (!allowedStatuses.includes("cancelled")) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "This order can no longer be cancelled",
        },
      }),
      {
        status: 409,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const updatedOrder = await updateOrderStatusById(id, "cancelled", {
    expectedStatus: order.status,
  });

  // Protect against a race condition where the order changed
  // between reading and updating it.
  if (!updatedOrder) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Order status changed. Please try again.",
        },
      }),
      {
        status: 409,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return ok({
    authenticated: true,
    data: toPublicOrder(updatedOrder),
  });
});

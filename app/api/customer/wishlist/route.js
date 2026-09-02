import { auth } from "@clerk/nextjs/server";

import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";

import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "@/modules/wishlist/wishlist.service.js";

export const GET = withRoute(async () => {
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

  const wishlist = await getWishlist(userId);

  return ok({
    authenticated: true,
    data: wishlist,
  });
});

export const POST = withRoute(async (request) => {
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

  const body = await request.json();
  const { productId } = body;

  if (!productId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Product ID is required",
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const item = await addToWishlist(userId, productId);

  return ok({
    authenticated: true,
    data: item,
  });
});

export const DELETE = withRoute(async (request) => {
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

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Product ID is required",
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  await removeFromWishlist(userId, productId);

  return ok({
    authenticated: true,
    data: {
      productId,
      removed: true,
    },
  });
});

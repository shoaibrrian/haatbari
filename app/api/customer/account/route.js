import { auth, currentUser } from "@clerk/nextjs/server";

import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";

import connectDB from "@/lib/db/connect";
import User from "@/modules/user/user.model";

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

  const clerkUser = await currentUser();

  if (!clerkUser || !user) {
    return ok({
      authenticated: false,
      data: null,
    });
  }

  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim() || "";

  return ok({
    authenticated: true,
    data: {
      firstName: user.firstName || clerkUser.firstName || "",
      lastName: user.lastName || clerkUser.lastName || "",
      email,
      phone: user.phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || "",
      address: user.address || "",
      imageUrl: clerkUser.imageUrl || "",
    },
  });
});

export const PATCH = withRoute(async (request) => {
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

  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phone = String(body.phone || "").trim();
  const address = String(body.address || "").trim();

  if (firstName.length < 2 || lastName.length < 2) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "First name and last name are required",
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

  if (!phone) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Phone number is required",
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

  await connectDB();

  const user = await syncClerkUser(userId);

  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Customer account not found",
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

  user.firstName = firstName;
  user.lastName = lastName;
  user.phone = phone;
  user.address = address;

  await user.save();

  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Customer account not found",
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
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
    },
  });
});

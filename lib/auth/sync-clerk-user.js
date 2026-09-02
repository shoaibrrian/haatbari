import { currentUser } from "@clerk/nextjs/server";

import connectDB from "@/lib/db/connect";
import User from "@/modules/user/user.model";

export async function syncClerkUser(userId) {
  if (!userId) {
    return null;
  }

  await connectDB();

  // Already synced
  let user = await User.findOne({ clerkUserId: userId });

  if (user) {
    return user;
  }

  // Get user from Clerk
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress
    ?.toLowerCase()
    .trim();

  if (!email) {
    return null;
  }

  // Check if this email already exists in MongoDB
  user = await User.findOne({ email });

  if (user) {
    user.clerkUserId = userId;

    if (!user.firstName) {
      user.firstName = clerkUser.firstName || "";
    }

    if (!user.lastName) {
      user.lastName = clerkUser.lastName || "";
    }

    if (!user.phone) {
      user.phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || "";
    }

    await user.save();

    return user;
  }

  // Create new MongoDB customer
  user = await User.create({
    clerkUserId: userId,
    firstName: clerkUser.firstName || "Customer",
    lastName: clerkUser.lastName || "User",
    email,
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || "00000000000",
    address: "",
    passwordHash: "clerk-managed",
    role: "buyer",
  });

  return user;
}

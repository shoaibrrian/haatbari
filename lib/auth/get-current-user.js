import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/modules/user/user.model";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  await connectDB();

  let user = await User.findOne({ clerkUserId: userId });

  if (user) {
    return user;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return null;
  }

  user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (user) {
    user.clerkUserId = userId;
    await user.save();

    return user;
  }

  user = await User.create({
    clerkUserId: userId,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    email: email.toLowerCase().trim(),
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || "",
    passwordHash: "clerk-managed",
    role: "buyer",
  });

  return user;
}

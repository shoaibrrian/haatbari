import { auth, clerkClient } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const role = user.publicMetadata?.role;

  if (role !== "admin") {
    return null;
  }

  return {
    userId,
    role,
  };
}

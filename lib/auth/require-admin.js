import { auth } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();

  const role = sessionClaims?.metadata?.role;

  if (!userId || role !== "admin") {
    return null;
  }

  return {
    userId,
    role,
  };
}

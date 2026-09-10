import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const { userId } = await auth();

    if (!userId) {
      return Response.redirect(new URL("/account", req.url));
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const role = user.publicMetadata?.role;

    if (role !== "admin") {
      return Response.redirect(new URL("/account", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

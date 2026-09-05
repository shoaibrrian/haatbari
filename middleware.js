import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const { userId, sessionClaims } = await auth();

    const role = sessionClaims?.metadata?.role;

    if (!userId || role !== "admin") {
      return Response.redirect(new URL("/account", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

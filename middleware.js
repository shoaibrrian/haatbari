import { clerkMiddleware } from "@clerk/nextjs/server";
import { getToken } from "next-auth/jwt";

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Protect admin routes with the existing NextAuth admin role
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token?.role !== "admin") {
      return Response.redirect(new URL("/account", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;

    // Only admins can access /admin
    if (role !== "admin") {
      return Response.redirect(new URL("/account", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Let middleware run even when there is no session.
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};

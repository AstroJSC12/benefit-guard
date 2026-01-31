import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isOnboarding = req.nextUrl.pathname === "/onboarding";
    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

    if (isDashboard && token && !token.onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (isOnboarding && token?.onboarded) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
        const isHomePage = req.nextUrl.pathname === "/";
        const isApiRoute = req.nextUrl.pathname.startsWith("/api");

        if (isAuthPage || isHomePage || isApiRoute) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/auth/:path*",
  ],
};

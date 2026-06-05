import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["Admin", "Staff"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("ecommerce_role")?.value;
  const authenticated = request.cookies.get("ecommerce_authenticated")?.value === "1";

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const protectedCustomerRoutes = [
    "/cart",
    "/checkout",
    "/account",
    "/orders",
    "/wishlist",
  ];
  const isProtectedCustomer = protectedCustomerRoutes.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  if (isAdminRoute) {
    if (!authenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (!role || !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  if (isProtectedCustomer && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && authenticated && role && ADMIN_ROLES.includes(role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cart",
    "/checkout",
    "/account/:path*",
    "/orders/:path*",
    "/wishlist",
    "/login",
    "/register",
  ],
};

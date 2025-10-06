import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // If the user is not authenticated and trying to access protected routes
    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }

    // Role-based access control
    const userRole = token.role as string

    // Admin-only routes
    if (pathname.startsWith("/admin")) {
      if (userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      // Keep current admin sub-route on refresh; do not redirect
    }

    // Employee and Admin routes (master data management)
    if (pathname.startsWith("/master")) {
      if (!["EMPLOYEE", "ADMIN"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Dashboard access for all authenticated users
    if (pathname.startsWith("/dashboard")) {
      // Only redirect to /admin/inventory when landing on /dashboard root
      if (userRole === "ADMIN" && (pathname === "/dashboard" || pathname === "/dashboard/")) {
        return NextResponse.redirect(new URL("/admin/inventory", req.url))
      }
      return NextResponse.next()
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/master/:path*", "/inventory/:path*"]
} 
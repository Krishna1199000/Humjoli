import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If the user is not authenticated and trying to access protected routes
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/master/:path*"]
} 
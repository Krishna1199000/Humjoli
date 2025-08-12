import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function adminAuthMiddleware(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }
    
    return null // Continue to the next middleware/handler
  } catch (error) {
    console.error("Admin auth middleware error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export function withAdminAuth(handler: Function) {
  return async (request: NextRequest) => {
    const authResult = await adminAuthMiddleware(request)
    if (authResult) {
      return authResult
    }
    
    return handler(request)
  }
} 
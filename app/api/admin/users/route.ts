import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all users with their sessions for last login info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          orderBy: {
            expires: 'desc'
          },
          take: 1,
          select: {
            expires: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include last login info
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      status: "Active", // You can add a status field to your User model if needed
      joined: user.createdAt.toISOString().split('T')[0],
      lastLogin: user.sessions.length > 0 && user.sessions[0].expires > new Date() 
        ? "Online" 
        : user.sessions.length > 0 
          ? user.sessions[0].expires.toISOString().split('T')[0]
          : "Never"
    }))

    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
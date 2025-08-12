import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch user's favorites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("GET Session:", session)
    console.log("GET User ID:", session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user exists by email (more reliable than ID after database reset)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    console.log("GET User found:", user)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id
      },
      include: {
        inventory: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

// POST - Add item to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("Session:", session)
    console.log("User ID:", session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inventoryId } = await request.json()
    console.log("Inventory ID:", inventoryId)

    if (!inventoryId) {
      return NextResponse.json({ error: "Inventory ID is required" }, { status: 400 })
    }

    // Check if user exists by email (more reliable than ID after database reset)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    console.log("User found:", user)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if inventory item exists
    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_inventoryId: {
          userId: user.id,
          inventoryId: inventoryId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ error: "Item already in favorites" }, { status: 400 })
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        inventoryId: inventoryId
      },
      include: {
        inventory: true
      }
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json({ error: "Failed to add to favorites" }, { status: 500 })
  }
}

// DELETE - Remove item from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const inventoryId = searchParams.get('inventoryId')

    if (!inventoryId) {
      return NextResponse.json({ error: "Inventory ID is required" }, { status: 400 })
    }

    // Check if user exists by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove from favorites
    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        inventoryId: inventoryId
      }
    })

    return NextResponse.json({ message: "Removed from favorites" })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return NextResponse.json({ error: "Failed to remove from favorites" }, { status: 500 })
  }
} 
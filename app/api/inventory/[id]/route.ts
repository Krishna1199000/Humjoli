import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadImage, deleteImage } from "@/lib/cloudinary"

// GET - Fetch single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication for inventory access
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow CUSTOMER, EMPLOYEE, and ADMIN to view inventory items
    if (!["CUSTOMER", "EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: params.id }
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json({ error: "Failed to fetch inventory item" }, { status: 500 })
  }
}

// PUT - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to update inventory items
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions. Only employees and admins can update inventory items." }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const quantity = parseInt(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const minStock = parseInt(formData.get('minStock') as string)
    const maxStock = formData.get('maxStock') ? parseInt(formData.get('maxStock') as string) : null
    const location = formData.get('location') as string
    const supplier = formData.get('supplier') as string
    const image = formData.get('image') as File

    // Validate required fields
    if (!name || !category || quantity < 0 || price < 0 || minStock < 0) {
      return NextResponse.json({ 
        error: "Missing required fields or invalid values" 
      }, { status: 400 })
    }

    // Get existing item
    const existingItem = await prisma.inventory.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    let imageUrl = existingItem.imageUrl

    // Handle image upload to Cloudinary
    if (image && image.size > 0) {
      try {
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Upload new image to Cloudinary
        imageUrl = await uploadImage(buffer, 'humjoli/inventory')
        
        // Delete old image if it exists
        if (existingItem.imageUrl) {
          try {
            await deleteImage(existingItem.imageUrl)
          } catch (error) {
            console.error('Error deleting old image:', error)
            // Continue even if old image deletion fails
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        return NextResponse.json({ 
          error: "Failed to upload image" 
        }, { status: 500 })
      }
    }

    // Determine status based on quantity
    let status = 'IN_STOCK'
    if (quantity === 0) {
      status = 'OUT_OF_STOCK'
    } else if (quantity <= minStock) {
      status = 'LOW_STOCK'
    }

    // Update inventory item
    const updatedItem = await prisma.inventory.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        category,
        quantity,
        price,
        imageUrl,
        minStock,
        maxStock,
        location: location || null,
        supplier: supplier || null,
        status: status as any,
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 })
  }
}

// DELETE - Delete inventory item (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete inventory items
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions. Only admins can delete inventory items." }, { status: 403 })
    }

    // Get existing item to delete image
    const existingItem = await prisma.inventory.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    // Delete image from Cloudinary or local storage if exists
    if (existingItem.imageUrl) {
      try {
        await deleteImage(existingItem.imageUrl)
      } catch (error) {
        console.error("Error deleting image:", error)
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete inventory item
    await prisma.inventory.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Inventory item deleted successfully" })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 })
  }
} 
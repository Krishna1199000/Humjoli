import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/cloudinary"

// GET - Fetch all inventory items with optional filters
export async function GET(request: NextRequest) {
  try {
    // Check authentication for inventory access
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow CUSTOMER, EMPLOYEE, and ADMIN to view inventory
    if (!["CUSTOMER", "EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const inventory = await prisma.inventory.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

// POST - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to create inventory items
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions. Only employees and admins can add inventory items." }, { status: 403 })
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

    let imageUrl = null

    // Handle image upload to Cloudinary
    if (image && image.size > 0) {
      try {
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Upload to Cloudinary
        imageUrl = await uploadImage(buffer, 'humjoli/inventory')
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

    // Create inventory item
    const inventoryItem = await prisma.inventory.create({
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

    return NextResponse.json(inventoryItem, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
  }
} 
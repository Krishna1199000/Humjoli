import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all vendors with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to access vendors
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { isActive: true }
    
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get vendors with calculated balances
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        _count: {
          select: {
            purchases: true,
            payments: true
          }
        },
        purchases: {
          select: {
            amount: true
          }
        },
        payments: {
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        businessName: 'asc'
      },
      skip,
      take: limit
    })

    // Calculate balances for each vendor
    const vendorsWithBalance = vendors.map(vendor => {
      const totalPurchases = vendor.purchases.reduce((sum, purchase) => sum + purchase.amount, 0)
      const totalPayments = vendor.payments.reduce((sum, payment) => sum + payment.amount, 0)
      const balance = totalPurchases - totalPayments

      return {
        ...vendor,
        balance,
        totalPurchases,
        totalPayments,
        purchases: undefined, // Remove detailed purchases from list response
        payments: undefined   // Remove detailed payments from list response
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.vendor.count({ where })

    return NextResponse.json({
      vendors: vendorsWithBalance,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 })
  }
}

// POST - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to create vendors
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const {
      businessName,
      contactName,
      phone,
      email,
      gstin,
      address,
      notes,
      tags
    } = body

    // Validate required fields
    if (!businessName) {
      return NextResponse.json({ 
        error: "Business name is required" 
      }, { status: 400 })
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format" 
      }, { status: 400 })
    }

    // Check for duplicate business name
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        businessName: { equals: businessName, mode: 'insensitive' },
        isActive: true
      }
    })

    if (existingVendor) {
      return NextResponse.json({ 
        error: "Vendor with this business name already exists" 
      }, { status: 400 })
    }

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        businessName,
        contactName: contactName || null,
        phone: phone || null,
        email: email || null,
        gstin: gstin || null,
        address: address || null,
        notes: notes || null,
        tags: tags || null,
      }
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error("Error creating vendor:", error)
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}


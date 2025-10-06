import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all customers with search and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow all authenticated users to view customers (needed for invoice creation)
    if (!["CUSTOMER", "EMPLOYEE", "ADMIN"].includes(session.user.role)) {
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
        { displayName: { contains: search, mode: 'insensitive' } },
        { fullLegalName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const customers = await prisma.enhancedCustomer.findMany({
      where,
      include: {
        _count: {
          select: {
            invoices: true
          }
        }
      },
      orderBy: {
        displayName: 'asc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.enhancedCustomer.count({ where })

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to create customers
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const {
      displayName,
      fullLegalName,
      email,
      phone,
      billingAddress,
      shippingAddress,
      gstin,
      defaultPaymentTerms,
      preferredContact,
      notes,
      tags
    } = body

    // Validate required fields
    if (!displayName) {
      return NextResponse.json({ 
        error: "Display name is required" 
      }, { status: 400 })
    }

    if (!phone) {
      return NextResponse.json({ 
        error: "Phone number is required" 
      }, { status: 400 })
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format" 
      }, { status: 400 })
    }

    // Validate preferred contact method
    if (preferredContact && !['EMAIL', 'PHONE', 'SMS'].includes(preferredContact)) {
      return NextResponse.json({ 
        error: "Invalid preferred contact method" 
      }, { status: 400 })
    }

    // Check for duplicate email if provided
    if (email) {
      const existingCustomer = await prisma.enhancedCustomer.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          isActive: true
        }
      })

      if (existingCustomer) {
        return NextResponse.json({ 
          error: "Customer with this email already exists" 
        }, { status: 400 })
      }
    }

    // Create customer
    const customer = await prisma.enhancedCustomer.create({
      data: {
        displayName,
        fullLegalName: fullLegalName || null,
        email: email || null,
        phone,
        billingAddress: billingAddress || null,
        shippingAddress: shippingAddress || null,
        gstin: gstin || null,
        defaultPaymentTerms: defaultPaymentTerms || null,
        preferredContact: preferredContact || null,
        notes: notes || null,
        tags: tags || null,
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
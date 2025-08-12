import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch all customers with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          phone: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          gstNumber: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive'
      }
    }

    if (phone) {
      where.phone = {
        contains: phone,
        mode: 'insensitive'
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.customer.count({ where })

    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

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

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, address, gstNumber } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    // Check if customer with same phone already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: { phone }
    })

    if (existingCustomer) {
      return NextResponse.json({ error: "Customer with this phone number already exists" }, { status: 400 })
    }

    // Check if customer with same email already exists (if email provided)
    if (email) {
      const existingEmailCustomer = await prisma.customer.findFirst({
        where: { email }
      })

      if (existingEmailCustomer) {
        return NextResponse.json({ error: "Customer with this email already exists" }, { status: 400 })
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        gstNumber
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
} 
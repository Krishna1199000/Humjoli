import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all salary payments for an employee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Check if employee exists
    const employee = await prisma.enhancedEmployee.findUnique({
      where: { id: params.id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Get salary payments with pagination
    const payments = await prisma.salaryPayment.findMany({
      where: { employeeId: params.id },
      orderBy: [
        { month: 'desc' },
        { paidDate: 'desc' }
      ],
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.salaryPayment.count({
      where: { employeeId: params.id }
    })

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching salary payments:", error)
    return NextResponse.json({ error: "Failed to fetch salary payments" }, { status: 500 })
  }
}

// POST - Create new salary payment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if employee exists
    const employee = await prisma.enhancedEmployee.findUnique({
      where: { id: params.id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const body = await request.json()
    const { amount, month, paidDate, reference, notes } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        error: "Valid amount is required" 
      }, { status: 400 })
    }

    if (!month) {
      return NextResponse.json({ 
        error: "Month is required" 
      }, { status: 400 })
    }

    if (!paidDate) {
      return NextResponse.json({ 
        error: "Payment date is required" 
      }, { status: 400 })
    }

    // Check for duplicate payment for the same month
    const existingPayment = await prisma.salaryPayment.findUnique({
      where: {
        employeeId_month: {
          employeeId: params.id,
          month: month
        }
      }
    })

    if (existingPayment) {
      return NextResponse.json({ 
        error: "Salary payment for this month already exists" 
      }, { status: 400 })
    }

    // Create salary payment
    const payment = await prisma.salaryPayment.create({
      data: {
        employeeId: params.id,
        amount,
        month,
        paidDate: new Date(paidDate),
        reference: reference || null,
        notes: notes || null
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error creating salary payment:", error)
    return NextResponse.json({ error: "Failed to create salary payment" }, { status: 500 })
  }
}
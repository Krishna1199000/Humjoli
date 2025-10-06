import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single salary payment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const payment = await prisma.salaryPayment.findFirst({
      where: {
        id: params.paymentId,
        employeeId: params.id
      }
    })

    if (!payment) {
      return NextResponse.json({ error: "Salary payment not found" }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error fetching salary payment:", error)
    return NextResponse.json({ error: "Failed to fetch salary payment" }, { status: 500 })
  }
}

// PUT - Update salary payment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if payment exists and belongs to employee
    const existingPayment = await prisma.salaryPayment.findFirst({
      where: {
        id: params.paymentId,
        employeeId: params.id
      }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: "Salary payment not found" }, { status: 404 })
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

    // Check for duplicate payment for the same month (excluding current payment)
    if (month !== existingPayment.month) {
      const duplicatePayment = await prisma.salaryPayment.findFirst({
        where: {
          employeeId: params.id,
          month: month,
          id: { not: params.paymentId }
        }
      })

      if (duplicatePayment) {
        return NextResponse.json({ 
          error: "Another salary payment for this month already exists" 
        }, { status: 400 })
      }
    }

    // Update payment
    const payment = await prisma.salaryPayment.update({
      where: { id: params.paymentId },
      data: {
        amount,
        month,
        paidDate: new Date(paidDate),
        reference: reference || null,
        notes: notes || null
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error updating salary payment:", error)
    return NextResponse.json({ error: "Failed to update salary payment" }, { status: 500 })
  }
}

// DELETE - Delete salary payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete salary payments
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if payment exists and belongs to employee
    const existingPayment = await prisma.salaryPayment.findFirst({
      where: {
        id: params.paymentId,
        employeeId: params.id
      }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: "Salary payment not found" }, { status: 404 })
    }

    // Delete payment
    await prisma.salaryPayment.delete({
      where: { id: params.paymentId }
    })

    return NextResponse.json({ message: "Salary payment deleted successfully" })
  } catch (error) {
    console.error("Error deleting salary payment:", error)
    return NextResponse.json({ error: "Failed to delete salary payment" }, { status: 500 })
  }
}














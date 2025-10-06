import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single payment
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

    const payment = await prisma.vendorPayment.findFirst({
      where: {
        id: params.paymentId,
        vendorId: params.id
      }
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error fetching payment:", error)
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}

// PUT - Update payment
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

    // Check if payment exists and belongs to vendor
    const existingPayment = await prisma.vendorPayment.findFirst({
      where: {
        id: params.paymentId,
        vendorId: params.id
      }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const body = await request.json()
    const { amount, date, paymentMethod, reference, notes } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        error: "Valid amount is required" 
      }, { status: 400 })
    }

    if (!date) {
      return NextResponse.json({ 
        error: "Date is required" 
      }, { status: 400 })
    }

    // Update payment
    const payment = await prisma.vendorPayment.update({
      where: { id: params.paymentId },
      data: {
        amount,
        date: new Date(date),
        paymentMethod: paymentMethod || null,
        reference: reference || null,
        notes: notes || null
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}

// DELETE - Delete payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete payments
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if payment exists and belongs to vendor
    const existingPayment = await prisma.vendorPayment.findFirst({
      where: {
        id: params.paymentId,
        vendorId: params.id
      }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Delete payment
    await prisma.vendorPayment.delete({
      where: { id: params.paymentId }
    })

    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}














import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single purchase
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, purchaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        id: params.purchaseId,
        vendorId: params.id
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("Error fetching purchase:", error)
    return NextResponse.json({ error: "Failed to fetch purchase" }, { status: 500 })
  }
}

// PUT - Update purchase
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, purchaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if purchase exists and belongs to vendor
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        id: params.purchaseId,
        vendorId: params.id
      }
    })

    if (!existingPurchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    const body = await request.json()
    const { amount, date, reference, description } = body

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

    // Update purchase
    const purchase = await prisma.purchase.update({
      where: { id: params.purchaseId },
      data: {
        amount,
        date: new Date(date),
        reference: reference || null,
        description: description || null
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("Error updating purchase:", error)
    return NextResponse.json({ error: "Failed to update purchase" }, { status: 500 })
  }
}

// DELETE - Delete purchase
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, purchaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete purchases
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if purchase exists and belongs to vendor
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        id: params.purchaseId,
        vendorId: params.id
      }
    })

    if (!existingPurchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    // Delete purchase
    await prisma.purchase.delete({
      where: { id: params.purchaseId }
    })

    return NextResponse.json({ message: "Purchase deleted successfully" })
  } catch (error) {
    console.error("Error deleting purchase:", error)
    return NextResponse.json({ error: "Failed to delete purchase" }, { status: 500 })
  }
}














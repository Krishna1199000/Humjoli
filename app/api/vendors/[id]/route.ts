import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single vendor with purchases and payments
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

    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        purchases: {
          orderBy: { date: 'desc' }
        },
        payments: {
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    // Calculate balances
    const totalPurchases = vendor.purchases.reduce((sum, purchase) => sum + purchase.amount, 0)
    const totalPayments = vendor.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const balance = totalPurchases - totalPayments

    return NextResponse.json({
      ...vendor,
      balance,
      totalPurchases,
      totalPayments
    })
  } catch (error) {
    console.error("Error fetching vendor:", error)
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 })
  }
}

// PUT - Update vendor
export async function PUT(
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

    // Check if vendor exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { id: params.id }
    })

    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    // Check for duplicate business name (excluding current vendor)
    const duplicateVendor = await prisma.vendor.findFirst({
      where: {
        businessName: { equals: businessName, mode: 'insensitive' },
        isActive: true,
        id: { not: params.id }
      }
    })

    if (duplicateVendor) {
      return NextResponse.json({ 
        error: "Another vendor with this business name already exists" 
      }, { status: 400 })
    }

    // Update vendor
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
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

    return NextResponse.json(vendor)
  } catch (error) {
    console.error("Error updating vendor:", error)
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 })
  }
}

// DELETE - Soft delete vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete vendors
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions. Only admins can delete vendors." }, { status: 403 })
    }

    // Check if vendor exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { id: params.id }
    })

    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.vendor.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: "Vendor deleted successfully" })
  } catch (error) {
    console.error("Error deleting vendor:", error)
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 })
  }
}


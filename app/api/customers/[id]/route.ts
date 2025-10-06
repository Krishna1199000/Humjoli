import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["CUSTOMER", "EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const customer = await prisma.enhancedCustomer.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Latest 10 invoices
        },
        _count: {
          select: {
            invoices: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

// PUT - Update customer
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

    // Check if customer exists
    const existingCustomer = await prisma.enhancedCustomer.findUnique({
      where: { id: params.id }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Check for duplicate email (excluding current customer)
    if (email) {
      const duplicateCustomer = await prisma.enhancedCustomer.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          isActive: true,
          id: { not: params.id }
        }
      })

      if (duplicateCustomer) {
        return NextResponse.json({ 
          error: "Another customer with this email already exists" 
        }, { status: 400 })
      }
    }

    // Update customer
    const customer = await prisma.enhancedCustomer.update({
      where: { id: params.id },
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

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

// DELETE - Soft delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete customers
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions. Only admins can delete customers." }, { status: 403 })
    }

    // Check if customer exists
    const existingCustomer = await prisma.enhancedCustomer.findUnique({
      where: { id: params.id }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Check if customer has invoices
    const invoiceCount = await prisma.enhancedInvoice.count({
      where: { customerId: params.id }
    })

    if (invoiceCount > 0) {
      return NextResponse.json({ 
        error: "Cannot delete customer with existing invoices. Please archive instead." 
      }, { status: 400 })
    }

    // Soft delete by setting isActive to false
    await prisma.enhancedCustomer.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
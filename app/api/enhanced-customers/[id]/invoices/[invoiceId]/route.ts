import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const invoice = await prisma.enhancedInvoice.findFirst({
      where: {
        id: params.invoiceId,
        customerId: params.id
      },
      include: {
        items: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if invoice exists and belongs to customer
    const existingInvoice = await prisma.enhancedInvoice.findFirst({
      where: {
        id: params.invoiceId,
        customerId: params.id
      }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      issueDate,
      dueDate,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      notes,
      terms,
      items
    } = body

    // Validate required fields
    if (!issueDate) {
      return NextResponse.json({ 
        error: "Issue date is required" 
      }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ 
        error: "At least one item is required" 
      }, { status: 400 })
    }

    // Update invoice and items
    const invoice = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.enhancedInvoiceItem.deleteMany({
        where: { invoiceId: params.invoiceId }
      })

      // Update invoice and create new items
      return tx.enhancedInvoice.update({
        where: { id: params.invoiceId },
        data: {
          issueDate: new Date(issueDate),
          dueDate: dueDate ? new Date(dueDate) : null,
          subtotal,
          taxAmount: taxAmount ?? 0,
          discountAmount: discountAmount ?? 0,
          total,
          notes: notes || null,
          terms: terms || null,
          items: {
            create: items.map((item: any) => ({
              name: item.name,
              description: item.description || null,
              quantity: item.quantity,
              rate: item.rate,
              discount: item.discount ?? 0,
              taxRate: item.taxRate ?? 0,
              amount: item.amount
            }))
          }
        },
        include: {
          items: true
        }
      })
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete invoices
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if invoice exists and belongs to customer
    const existingInvoice = await prisma.enhancedInvoice.findFirst({
      where: {
        id: params.invoiceId,
        customerId: params.id
      }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Delete invoice (cascade will handle items)
    await prisma.enhancedInvoice.delete({
      where: { id: params.invoiceId }
    })

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}




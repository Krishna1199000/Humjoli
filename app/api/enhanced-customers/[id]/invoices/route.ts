import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all invoices for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Check if customer exists
    const customer = await prisma.enhancedCustomer.findUnique({
      where: { id: params.id }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Get invoices with pagination
    const invoices = await prisma.enhancedInvoice.findMany({
      where: { customerId: params.id },
      include: {
        items: true
      },
      orderBy: { issueDate: 'desc' },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.enhancedInvoice.count({
      where: { customerId: params.id }
    })

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

// POST - Create new invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if customer exists
    const customer = await prisma.enhancedCustomer.findUnique({
      where: { id: params.id }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
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

    // Generate invoice number
    const lastInvoice = await prisma.enhancedInvoice.findFirst({
      orderBy: { invoiceNo: 'desc' }
    })

    const nextNumber = lastInvoice 
      ? parseInt(lastInvoice.invoiceNo.split('-')[1]) + 1 
      : 1
    const invoiceNo = `INV-${String(nextNumber).padStart(6, '0')}`

    // Create invoice with items
    const invoice = await prisma.enhancedInvoice.create({
      data: {
        customerId: params.id,
        employeeId: session.user.id,
        invoiceNo,
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

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}




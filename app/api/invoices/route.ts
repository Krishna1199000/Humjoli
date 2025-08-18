import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// Ensure this route runs on the Node.js runtime (not Edge)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all invoices
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const customerName = searchParams.get('customerName')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { quotationNo: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerTel: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (customerName) {
      where.customerName = { contains: customerName, mode: 'insensitive' }
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerAddress,
      customerTel,
      customerState,
      customerStateCode,
      customerGSTIN,
      refName,
      bookingDate,
      eventDate,
      startTime,
      endTime,
      manager,
      advanceAmount,
      balanceAmount,
      remarks,
      totalAmount,
      cgstAmount,
      sgstAmount,
      taxableAmount,
      sacCode,
      invoiceValueInWords,
      items
    } = body

    // Validate required fields
    if (!customerName || !customerAddress || !customerTel || !items || items.length === 0) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    // Get or create invoice counter
    let counter = await prisma.invoiceCounter.findFirst()
    if (!counter) {
      counter = await prisma.invoiceCounter.create({
        data: { currentNumber: 1 }
      })
    }

    // Generate quotation number
    const quotationNo = counter.currentNumber.toString().padStart(5, '0')

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        quotationNo,
        customerName,
        customerAddress,
        customerTel,
        customerState,
        customerStateCode,
        customerGSTIN: customerGSTIN || null,
        refName: refName || null,
        bookingDate: new Date(bookingDate),
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        manager: manager || null,
        advanceAmount: parseFloat(advanceAmount) || 0,
        balanceAmount: parseFloat(balanceAmount) || 0,
        remarks: remarks || null,
        totalAmount: parseFloat(totalAmount) || 0,
        cgstAmount: parseFloat(cgstAmount) || 0,
        sgstAmount: parseFloat(sgstAmount) || 0,
        taxableAmount: parseFloat(taxableAmount) || 0,
        sacCode: sacCode || "00440035",
        invoiceValueInWords,
        items: {
          create: items.map((item: any) => ({
            srl: item.srl,
            particular: item.particular,
            quantity: item.quantity,
            rent: parseFloat(item.rent),
            amount: parseFloat(item.amount)
          }))
        },
        status: 'PENDING'
      },
      include: {
        items: true
      }
    })

    // Increment counter
    await prisma.invoiceCounter.update({
      where: { id: counter.id },
      data: { currentNumber: counter.currentNumber + 1 }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Error creating invoice:", error)
    
    // Type guard for Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ 
        error: "Invoice with this quotation number already exists" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
} 
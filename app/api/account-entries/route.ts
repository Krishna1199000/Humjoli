import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all account entries with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to access entries
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { counterParty: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    // Get entries with pagination
    const entries = await prisma.accountEntry.findMany({
      where,
      orderBy: {
        date: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.accountEntry.count({ where })

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching account entries:", error)
    return NextResponse.json({ error: "Failed to fetch account entries" }, { status: 500 })
  }
}

// POST - Create new account entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to create entries
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const {
      type,
      amount, // rupees from client
      currency,
      reason,
      counterParty,
      date
    } = body

    // Validate required fields
    if (!type || !["CREDIT", "DEBIT"].includes(type)) {
      return NextResponse.json({ 
        error: "Valid entry type (CREDIT/DEBIT) is required" 
      }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        error: "Valid amount is required" 
      }, { status: 400 })
    }

    // Default currency to INR
    const normalizedCurrency = currency || "INR"

    if (!reason) {
      return NextResponse.json({ 
        error: "Reason is required" 
      }, { status: 400 })
    }

    if (!date) {
      return NextResponse.json({ 
        error: "Date is required" 
      }, { status: 400 })
    }

    // Normalize amount to paise (integer)
    const amountInPaise = Math.round(parseFloat(String(amount)) * 100)

    // Create entry in a transaction to update invoice if needed
    const entry = await prisma.$transaction(async (tx) => {
      const entry = await tx.accountEntry.create({
        data: {
          type,
          amount: amountInPaise,
          currency: normalizedCurrency,
          reason,
          counterParty: counterParty || null,
          date: new Date(date),
          createdBy: session.user.id
        }
      })

      // If this is a credit entry with an invoice, update the invoice's paid amount
      if (type === "CREDIT" && body.invoiceId) {
        // Try enhanced invoice first
        let invoice = await tx.enhancedInvoice.findUnique({
          where: { id: body.invoiceId }
        })

        if (invoice) {
          // Enhanced invoice found - update it
          const newPaidAmount = invoice.paidAmount + amountInPaise
          await tx.enhancedInvoice.update({
            where: { id: body.invoiceId },
            data: {
              paidAmount: newPaidAmount,
              status: newPaidAmount === invoice.total 
                ? "PAID" 
                : newPaidAmount > 0 
                  ? "SEMI_PAID" 
                  : invoice.status
            }
          })
        } else {
          // Try old invoice format
          const oldInvoice = await tx.invoice.findUnique({
            where: { id: body.invoiceId }
          })

          if (oldInvoice) {
            // Update old invoice balance
            const rupees = amountInPaise / 100
            const newBalanceAmount = Math.max(0, oldInvoice.balanceAmount - rupees)
            const newAdvanceAmount = oldInvoice.advanceAmount + rupees
            
            await tx.invoice.update({
              where: { id: body.invoiceId },
              data: {
                balanceAmount: newBalanceAmount,
                advanceAmount: newAdvanceAmount,
                status: newBalanceAmount === 0 ? 'PAID' : 'PENDING'
              }
            })
          } else {
            throw new Error("Invoice not found")
          }
        }
      }

      return entry
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Error creating account entry:", error)
    return NextResponse.json({ error: "Failed to create account entry" }, { status: 500 })
  }
}

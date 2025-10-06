import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch account entries with filters and running balance
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to access accounts
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') // CREDIT or DEBIT
    const counterParty = searchParams.get('counterParty')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    
    if (type && ['CREDIT', 'DEBIT'].includes(type)) {
      where.type = type
    }
    
    if (counterParty) {
      where.counterParty = { contains: counterParty, mode: 'insensitive' }
    }

    // Get all entries for running balance calculation (in date order)
    const allEntries = await prisma.accountEntry.findMany({
      where: endDate ? { date: { lte: new Date(endDate) } } : {},
      orderBy: [
        { date: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    // Calculate running balance for all entries
    let runningBalance = 0
    const entriesWithBalance = allEntries.map(entry => {
      if (entry.type === 'CREDIT') {
        runningBalance += entry.amount
      } else {
        runningBalance -= entry.amount
      }
      
      return {
        ...entry,
        amount: entry.amount / 100, // Convert to rupees
        runningBalance: runningBalance / 100 // Convert to rupees
      }
    })

    // Apply filters and pagination to get the displayed entries
    const filteredEntries = await prisma.accountEntry.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Add running balance to filtered entries
    const entriesWithRunningBalance = filteredEntries.map(entry => {
      const entryWithBalance = entriesWithBalance.find(e => e.id === entry.id)
      return {
        ...entry,
        amount: entry.amount / 100, // Convert to rupees
        runningBalance: entryWithBalance ? entryWithBalance.runningBalance : 0
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.accountEntry.count({ where })

    // Calculate summary
    const summary = {
      totalCredits: entriesWithBalance
        .filter(e => e.type === 'CREDIT')
        .reduce((sum, e) => sum + (e.amount / 100), 0),
      totalDebits: entriesWithBalance
        .filter(e => e.type === 'DEBIT')
        .reduce((sum, e) => sum + (e.amount / 100), 0),
      currentBalance: runningBalance / 100,
      totalEntries: allEntries.length
    }

    return NextResponse.json({
      entries: entriesWithRunningBalance,
      summary,
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

    // Allow EMPLOYEE and ADMIN to create account entries
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { type, amount, reason, counterParty, date } = body

    // Validate required fields
    if (!type || !['CREDIT', 'DEBIT'].includes(type)) {
      return NextResponse.json({ 
        error: "Valid entry type (CREDIT or DEBIT) is required" 
      }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        error: "Valid amount is required" 
      }, { status: 400 })
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ 
        error: "Reason is required" 
      }, { status: 400 })
    }

    // Convert amount to paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100)

    const entry = await prisma.accountEntry.create({
      data: {
        type,
        amount: amountInPaise,
        reason: reason.trim(),
        counterParty: counterParty?.trim() || null,
        date: date ? new Date(date) : new Date(),
        createdBy: session.user.id
      }
    })

    // Calculate running balance up to this entry
    const entriesUpToThis = await prisma.accountEntry.findMany({
      where: {
        OR: [
          { date: { lt: entry.date } },
          { 
            date: entry.date,
            createdAt: { lte: entry.createdAt }
          }
        ]
      },
      orderBy: [
        { date: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    let runningBalance = 0
    entriesUpToThis.forEach(e => {
      if (e.type === 'CREDIT') {
        runningBalance += e.amount
      } else {
        runningBalance -= e.amount
      }
    })

    return NextResponse.json({
      ...entry,
      amount: entry.amount / 100, // Convert back to rupees for response
      runningBalance: runningBalance / 100
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating account entry:", error)
    return NextResponse.json({ error: "Failed to create account entry" }, { status: 500 })
  }
}



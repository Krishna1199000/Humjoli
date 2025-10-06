import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single account entry
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

    const entry = await prisma.accountEntry.findUnique({
      where: { id: params.id }
    })

    if (!entry) {
      return NextResponse.json({ error: "Account entry not found" }, { status: 404 })
    }

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
      amount: entry.amount / 100, // Convert to rupees
      runningBalance: runningBalance / 100
    })
  } catch (error) {
    console.error("Error fetching account entry:", error)
    return NextResponse.json({ error: "Failed to fetch account entry" }, { status: 500 })
  }
}

// PUT - Update account entry (limited fields for audit trail)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can update account entries for audit purposes
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions. Only admins can update account entries." }, { status: 403 })
    }

    const body = await request.json()
    const { reason, counterParty } = body

    // Check if entry exists
    const existingEntry = await prisma.accountEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Account entry not found" }, { status: 404 })
    }

    // Only allow updating reason and counterParty for audit trail
    const entry = await prisma.accountEntry.update({
      where: { id: params.id },
      data: {
        reason: reason?.trim() || existingEntry.reason,
        counterParty: counterParty?.trim() || existingEntry.counterParty,
      }
    })

    return NextResponse.json({
      ...entry,
      amount: entry.amount / 100 // Convert to rupees
    })
  } catch (error) {
    console.error("Error updating account entry:", error)
    return NextResponse.json({ error: "Failed to update account entry" }, { status: 500 })
  }
}

// DELETE - Delete account entry (admin only, for corrections)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete account entries
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions. Only admins can delete account entries." }, { status: 403 })
    }

    // Check if entry exists
    const existingEntry = await prisma.accountEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Account entry not found" }, { status: 404 })
    }

    // Check if entry is recent (within 24 hours) for safety
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (existingEntry.createdAt < oneDayAgo) {
      return NextResponse.json({ 
        error: "Cannot delete account entries older than 24 hours for audit compliance" 
      }, { status: 400 })
    }

    await prisma.accountEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Account entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting account entry:", error)
    return NextResponse.json({ error: "Failed to delete account entry" }, { status: 500 })
  }
}



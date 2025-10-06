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

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Error fetching account entry:", error)
    return NextResponse.json({ error: "Failed to fetch account entry" }, { status: 500 })
  }
}

// PUT - Update account entry
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

    // Check if entry exists
    const existingEntry = await prisma.accountEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Account entry not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      type,
      amount,
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

    // Update entry
    const entry = await prisma.accountEntry.update({
      where: { id: params.id },
      data: {
        type,
        amount: amountInPaise,
        currency: normalizedCurrency,
        reason,
        counterParty: counterParty || null,
        date: new Date(date)
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Error updating account entry:", error)
    return NextResponse.json({ error: "Failed to update account entry" }, { status: 500 })
  }
}

// DELETE - Delete account entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete entries
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if entry exists
    const existingEntry = await prisma.accountEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Account entry not found" }, { status: 404 })
    }

    // Delete entry
    await prisma.accountEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Account entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting account entry:", error)
    return NextResponse.json({ error: "Failed to delete account entry" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all invoices with customer details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to access invoices
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get invoices with customer details
    const invoices = await prisma.enhancedInvoice.findMany({
      select: {
        id: true,
        invoiceNo: true,
        customerId: true,
        total: true,
        paidAmount: true,
        customer: {
          select: {
            displayName: true
          }
        }
      },
      where: {
        status: {
          in: ["PENDING", "SEMI_PAID"] // Only get unpaid or partially paid invoices
        }
      },
      orderBy: {
        issueDate: 'desc'
      }
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}












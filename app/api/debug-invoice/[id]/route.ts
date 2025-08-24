import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== DEBUG INVOICE ENDPOINT ===')
    console.log('Invoice ID:', params.id)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Fetch invoice with items
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            srl: 'asc'
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    console.log('Raw invoice data:', JSON.stringify(invoice, null, 2))

    return NextResponse.json({
      success: true,
      invoice: invoice,
      itemsCount: invoice.items?.length || 0,
      hasItems: !!(invoice.items && invoice.items.length > 0),
      customerName: invoice.customerName,
      quotationNo: invoice.quotationNo,
      totalAmount: invoice.totalAmount
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ 
      error: "Failed to fetch invoice",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInvoiceHTML } from "@/utils/InvoiceTemplate"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== TEST HTML GENERATION ===')
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

    // Format dates for display
    const formatDate = (date: Date) => {
      try {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (error) {
        return date.toISOString().split('T')[0];
      }
    }

    // Prepare data for HTML generation
    const htmlData = {
      quotationNo: invoice.quotationNo,
      customerName: invoice.customerName || 'Unknown Customer',
      customerAddress: invoice.customerAddress || 'No Address',
      customerTel: invoice.customerTel || 'No Phone',
      customerState: invoice.customerState || 'Unknown State',
      customerStateCode: invoice.customerStateCode || 'Unknown',
      customerGSTIN: invoice.customerGSTIN || '',
      refName: invoice.refName || '',
      bookingDate: formatDate(invoice.bookingDate),
      eventDate: formatDate(invoice.eventDate),
      startTime: invoice.startTime || '00:00',
      endTime: invoice.endTime || '00:00',
      manager: invoice.manager || '',
      advanceAmount: invoice.advanceAmount || 0,
      balanceAmount: invoice.balanceAmount || 0,
      remarks: invoice.remarks || '',
      totalAmount: invoice.totalAmount || 0,
      cgstAmount: invoice.cgstAmount || 0,
      sgstAmount: invoice.sgstAmount || 0,
      taxableAmount: invoice.taxableAmount || 0,
      sacCode: invoice.sacCode || '00440035',
      invoiceValueInWords: invoice.invoiceValueInWords || 'Zero Rupees Only',
      items: (invoice.items || []).map(item => ({
        srl: item.srl || 1,
        particular: item.particular || 'Unknown Item',
        quantity: item.quantity || 0,
        rent: item.rent || 0,
        amount: item.amount || 0
      }))
    }

    console.log('Generating HTML with data:', JSON.stringify(htmlData, null, 2));

    // Generate HTML using the same function as PDF generation
    const html = generateInvoiceHTML(htmlData);

    console.log('HTML generated successfully, length:', html.length);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (error) {
    console.error("Error generating test HTML:", error)
    return NextResponse.json({ 
      error: "Failed to generate test HTML",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

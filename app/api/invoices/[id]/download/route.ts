import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInvoicePDF } from "@/utils/InvoiceTemplate"

// Ensure this route runs on the Node.js runtime (not Edge)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Starting invoice PDF generation for ID:', params.id)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      console.log('Unauthorized access attempt')
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
      console.log('Invoice not found:', id)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    console.log('Invoice found, preparing data for PDF generation')

    // Format dates for PDF
    const formatDate = (date: Date) => {
      try {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (error) {
        console.error('Date formatting error:', error);
        return date.toISOString().split('T')[0]; // Fallback to YYYY-MM-DD
      }
    }

    // Prepare data for PDF generation
    const pdfData = {
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

    console.log('Generating PDF with data:', JSON.stringify(pdfData, null, 2))
    
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(pdfData)
    
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    
    if (pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty')
    }

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.quotationNo}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ 
      error: "Failed to generate PDF",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 
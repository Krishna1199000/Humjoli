import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
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

    // Format dates for PDF
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }

    // Prepare data for PDF generation
    const pdfData = {
      quotationNo: invoice.quotationNo,
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
      customerTel: invoice.customerTel,
      customerState: invoice.customerState,
      customerStateCode: invoice.customerStateCode,
      customerGSTIN: invoice.customerGSTIN || '',
      refName: invoice.refName || '',
      bookingDate: formatDate(invoice.bookingDate),
      eventDate: formatDate(invoice.eventDate),
      startTime: invoice.startTime,
      endTime: invoice.endTime,
      manager: invoice.manager || '',
      advanceAmount: invoice.advanceAmount,
      balanceAmount: invoice.balanceAmount,
      remarks: invoice.remarks || '',
      totalAmount: invoice.totalAmount,
      cgstAmount: invoice.cgstAmount,
      sgstAmount: invoice.sgstAmount,
      taxableAmount: invoice.taxableAmount,
      sacCode: invoice.sacCode,
      invoiceValueInWords: invoice.invoiceValueInWords,
      items: invoice.items.map(item => ({
        srl: item.srl,
        particular: item.particular,
        quantity: item.quantity,
        rent: item.rent,
        amount: item.amount
      }))
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(pdfData)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.quotationNo}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
} 
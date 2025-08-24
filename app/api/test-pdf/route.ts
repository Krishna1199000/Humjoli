import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('id')

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })
    }

    // Fetch invoice with items
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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

    console.log('Test HTML data:', JSON.stringify(htmlData, null, 2));

    // Generate simple HTML for testing
    const itemsHTML = htmlData.items.map(item => `
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">${item.srl}</td>
        <td style="border: 1px solid #000; padding: 4px;">${item.particular}</td>
        <td style="border: 1px solid #000; padding: 4px;">${item.quantity}</td>
        <td style="border: 1px solid #000; padding: 4px;">₹${item.rent}</td>
        <td style="border: 1px solid #000; padding: 4px;">₹${item.amount}</td>
      </tr>
    `).join('')

    const totalQty = htmlData.items.reduce((sum, item) => sum + item.quantity, 0)

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Invoice ${htmlData.quotationNo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .details { display: flex; gap: 20px; margin-bottom: 20px; }
          .section { border: 1px solid #000; padding: 10px; flex: 1; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Test Invoice - ${htmlData.quotationNo}</h1>
          <p>Customer: ${htmlData.customerName}</p>
        </div>

        <div class="details">
          <div class="section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${htmlData.customerName}</p>
            <p><strong>Address:</strong> ${htmlData.customerAddress}</p>
            <p><strong>Phone:</strong> ${htmlData.customerTel}</p>
            <p><strong>State:</strong> ${htmlData.customerState}</p>
            <p><strong>GSTIN:</strong> ${htmlData.customerGSTIN || 'N/A'}</p>
          </div>
          <div class="section">
            <h3>Event Details</h3>
            <p><strong>Booking Date:</strong> ${htmlData.bookingDate}</p>
            <p><strong>Event Date:</strong> ${htmlData.eventDate}</p>
            <p><strong>Time:</strong> ${htmlData.startTime} - ${htmlData.endTime}</p>
            <p><strong>Manager:</strong> ${htmlData.manager || 'N/A'}</p>
          </div>
        </div>

        <h3>Items (${htmlData.items.length} items)</h3>
        <table>
          <thead>
            <tr>
              <th>Srl</th>
              <th>Particular</th>
              <th>Qty</th>
              <th>Rent</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr class="total">
              <td colspan="2">TOTAL</td>
              <td>${totalQty}</td>
              <td></td>
              <td>₹${htmlData.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="section">
          <h3>Financial Details</h3>
          <p><strong>Total Amount:</strong> ₹${htmlData.totalAmount}</p>
          <p><strong>Advance:</strong> ₹${htmlData.advanceAmount}</p>
          <p><strong>Balance:</strong> ₹${htmlData.balanceAmount}</p>
          <p><strong>Amount in Words:</strong> ${htmlData.invoiceValueInWords}</p>
        </div>

        <div class="section">
          <h3>Raw Data (for debugging)</h3>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 300px;">
${JSON.stringify(htmlData, null, 2)}
          </pre>
        </div>
      </body>
      </html>
    `;

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

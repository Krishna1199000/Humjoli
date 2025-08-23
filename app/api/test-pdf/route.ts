import { NextResponse } from "next/server"
import { generateInvoicePDF } from "@/utils/InvoiceTemplate"

export async function GET() {
  try {
    console.log('Testing PDF generation...')
    
    // Sample test data
    const testData = {
      quotationNo: "TEST-001",
      customerName: "John Doe",
      customerAddress: "123 Test Street, Test City",
      customerTel: "1234567890",
      customerState: "Maharashtra",
      customerStateCode: "27",
      customerGSTIN: "27TEST123456789",
      refName: "Test Reference",
      bookingDate: "01 Jan 2024",
      eventDate: "15 Jan 2024",
      startTime: "10:00 AM",
      endTime: "6:00 PM",
      manager: "Test Manager",
      advanceAmount: 5000,
      balanceAmount: 5000,
      remarks: "Test invoice for debugging",
      totalAmount: 10000,
      cgstAmount: 0,
      sgstAmount: 0,
      taxableAmount: 10000,
      sacCode: "998314",
      invoiceValueInWords: "Ten Thousand Rupees Only",
      items: [
        {
          srl: 1,
          particular: "Test Item 1",
          quantity: 2,
          rent: 3000,
          amount: 6000
        },
        {
          srl: 2,
          particular: "Test Item 2",
          quantity: 1,
          rent: 4000,
          amount: 4000
        }
      ]
    }
    
    console.log('Test data:', JSON.stringify(testData, null, 2))
    
    const pdfBuffer = await generateInvoicePDF(testData)
    
    console.log('Test PDF generated, size:', pdfBuffer.length, 'bytes')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-invoice.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Test PDF generation failed:', error)
    return NextResponse.json({ 
      error: "Test PDF generation failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

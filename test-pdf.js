const { generateInvoicePDF } = require('./utils/InvoiceTemplate.ts');

// Test data
const testData = {
  quotationNo: "TEST001",
  customerName: "Test Customer",
  customerAddress: "123 Test Street, Test City",
  customerTel: "9876543210",
  customerState: "Maharashtra",
  customerStateCode: "27",
  customerGSTIN: "27TEST123456789",
  refName: "Test Reference",
  bookingDate: "15 Jan 2025",
  eventDate: "15 Feb 2025",
  startTime: "19:30",
  endTime: "23:00",
  manager: "Test Manager",
  advanceAmount: 5000,
  balanceAmount: 5000,
  remarks: "Test invoice",
  totalAmount: 10000,
  cgstAmount: 0,
  sgstAmount: 0,
  taxableAmount: 10000,
  sacCode: "00440035",
  invoiceValueInWords: "Rupees Ten Thousand Only",
  items: [
    {
      srl: 1,
      particular: "DOLI 20",
      quantity: 1,
      rent: 10000,
      amount: 10000
    }
  ]
};

async function testPDF() {
  try {
    console.log('Testing PDF generation...');
    const pdfBuffer = await generateInvoicePDF(testData);
    console.log('PDF generated successfully!');
    console.log('PDF size:', pdfBuffer.length, 'bytes');
    
    // Save to file for inspection
    const fs = require('fs');
    fs.writeFileSync('test-invoice.pdf', pdfBuffer);
    console.log('PDF saved as test-invoice.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

testPDF();

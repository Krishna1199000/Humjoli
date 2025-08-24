import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'

interface InvoiceItem {
  srl: number
  particular: string
  quantity: number
  rent: number
  amount: number
}

interface InvoiceData {
  quotationNo: string
  customerName: string
  customerAddress: string
  customerTel: string
  customerState: string
  customerStateCode: string
  customerGSTIN: string
  refName: string
  bookingDate: string
  eventDate: string
  startTime: string
  endTime: string
  manager: string
  advanceAmount: number
  balanceAmount: number
  remarks: string
  totalAmount: number
  cgstAmount: number
  sgstAmount: number
  taxableAmount: number
  sacCode: string
  invoiceValueInWords: string
  items: InvoiceItem[]
}

function generateInvoiceHTML(data: InvoiceData): string {
  console.log('Generating HTML with data:', JSON.stringify(data, null, 2));
  
  // Validate data
  if (!data.items || data.items.length === 0) {
    console.warn('No items found in invoice data');
    data.items = [{ srl: 1, particular: 'No items', quantity: 0, rent: 0, amount: 0 }];
  }
  
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${item.srl || ''}</td>
      <td style="text-align: left; border: 1px solid #000; padding: 4px; font-size: 9px;">${item.particular || ''}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${item.quantity || 0}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${(item.rent || 0).toFixed(2)}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${(item.amount || 0).toFixed(2)}</td>
    </tr>
  `).join('')

  const totalQty = data.items.reduce((sum, item) => sum + item.quantity, 0)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.quotationNo}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 10px;
          font-size: 10px;
          line-height: 1.2;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
        }
        .header-line1 {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .header-line2 {
          font-size: 12px;
          font-weight: bold;
        }
        .details-container {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        .customer-details, .booking-details {
          border: 1px solid #000;
          padding: 8px;
          width: 45%;
          min-height: 120px;
        }
        .section-title {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 8px;
          text-align: center;
        }
        .detail-row {
          margin: 4px 0;
          display: flex;
        }
        .label {
          font-weight: bold;
          min-width: 70px;
          display: inline-block;
          font-size: 9px;
        }
        .value {
          flex: 1;
          font-size: 9px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        .items-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
          border: 1px solid #000;
          padding: 6px 4px;
          font-size: 10px;
        }
        .items-table td {
          border: 1px solid #000;
          padding: 4px;
          font-size: 9px;
        }
        .tax-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        .tax-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
          border: 1px solid #000;
          padding: 4px;
          font-size: 9px;
        }
        .tax-table td {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
          font-size: 9px;
        }
        .advance-balance {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 10px;
        }
        .advance-section {
          display: flex;
          gap: 15px;
        }
        .balance-section {
          display: flex;
          gap: 15px;
        }
        .additional-info {
          margin: 10px 0;
          font-size: 10px;
        }
        .info-row {
          margin: 4px 0;
          display: flex;
        }
        .info-label {
          font-weight: bold;
          min-width: 100px;
          font-size: 9px;
        }
        .invoice-value {
          margin: 10px 0;
          font-size: 10px;
          font-weight: bold;
        }
        .terms {
          margin: 15px 0;
        }
        .terms h3 {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .terms ol {
          margin: 0;
          padding-left: 15px;
        }
        .terms li {
          margin: 4px 0;
          font-size: 9px;
        }
        .signatures {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        .signature-box {
          border: 1px solid #000;
          padding: 8px;
          width: 45%;
          text-align: center;
          min-height: 50px;
        }
        .signature-title {
          font-weight: bold;
          font-size: 10px;
          margin-bottom: 5px;
        }
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 25px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-line1">State : Maharashtra    State Code : 27</div>
        <div class="header-line2">GSTIN: 27ADOPA7853Q1ZR</div>
      </div>

      <div class="details-container">
        <div class="customer-details">
          <div class="section-title">Customer Details</div>
          <div class="detail-row">
            <span class="label">Name:</span>
            <span class="value">${data.customerName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Address:</span>
            <span class="value">${data.customerAddress}</span>
          </div>
          <div class="detail-row">
            <span class="label">Tel:</span>
            <span class="value">${data.customerTel}</span>
          </div>
          <div class="detail-row">
            <span class="label">State:</span>
            <span class="value">${data.customerState}</span>
          </div>
          <div class="detail-row">
            <span class="label">State Code:</span>
            <span class="value">${data.customerStateCode}</span>
          </div>
          <div class="detail-row">
            <span class="label">GSTIN:</span>
            <span class="value">${data.customerGSTIN || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Ref Name:</span>
            <span class="value">${data.refName || '-'}</span>
          </div>
        </div>

        <div class="booking-details">
          <div class="section-title">Booking Details</div>
          <div class="detail-row">
            <span class="label">Quotation No:</span>
            <span class="value">${data.quotationNo}</span>
          </div>
          <div class="detail-row">
            <span class="label">Booking Date:</span>
            <span class="value">${data.bookingDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">Event Date:</span>
            <span class="value">${data.eventDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">Start Time:</span>
            <span class="value">${data.startTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">End Time:</span>
            <span class="value">${data.endTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">Manager:</span>
            <span class="value">${data.manager || '-'}</span>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Srl.</th>
            <th>Particular</th>
            <th>Qty.</th>
            <th>Rent</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr>
            <td style="text-align: center; border: 1px solid #000; padding: 4px; font-weight: bold; font-size: 9px;">TOTAL</td>
            <td style="text-align: left; border: 1px solid #000; padding: 4px;"></td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px; font-weight: bold; font-size: 9px;">${totalQty}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px;"></td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px; font-weight: bold; font-size: 9px;">₹ ${data.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <table class="tax-table">
        <thead>
          <tr>
            <th>SAC Code</th>
            <th>Taxable Amt</th>
            <th>CGST %</th>
            <th>CGST Amt</th>
            <th>SGST %</th>
            <th>SGST Amt</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${data.sacCode}</td>
            <td>${data.taxableAmount.toFixed(2)}</td>
            <td>0.00 %</td>
            <td>0.00</td>
            <td>0.00 %</td>
            <td>0.00</td>
            <td>${data.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="advance-balance">
        <div class="advance-section">
          <span><strong>Advance:</strong> ${data.advanceAmount.toFixed(2)}</span>
        </div>
        <div class="balance-section">
          <span><strong>Balance:</strong> ${data.balanceAmount.toFixed(2)}</span>
        </div>
      </div>

      <div class="additional-info">
        <div class="info-row">
          <span class="info-label">Reporting Address:</span>
          <span>-</span>
        </div>
        <div class="info-row">
          <span class="info-label">Venue Address:</span>
          <span>--</span>
        </div>
        <div class="info-row">
          <span class="info-label">Remarks:</span>
          <span>${data.remarks || '-'}</span>
        </div>
      </div>

      <div class="invoice-value">
        <strong>Invoice Value :</strong> ${data.invoiceValueInWords}
      </div>

      <div class="terms">
        <h3>Terms & Conditions:-</h3>
        <ol>
          <li>Once Order taken will not be cancelled</li>
          <li>All Item will chargeable for Two Hours * except SAFA (Pagdi)</li>
          <li>In case of delay extra hours will be chargeable.</li>
          <li>Missing of Safa will be chargeable (i e responsibility should be taken by the customer.)</li>
          <li>BOOKING ADVABCE 50% & BALANCE AMOUNT SHOULD BE PAID ON VENUE</li>
        </ol>
      </div>

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-title">Customer's Sign</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div class="signature-title">For HUMJOLI EVENTS</div>
          <div class="signature-title">Authorised Signatory</div>
          <div class="signature-line"></div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  console.log('Starting invoice PDF generation...');
  
  // Define approaches to try in order
  const approaches = [
    {
      name: 'Production Chromium',
      fn: () => generateInvoicePDFWithChromium(data),
      condition: () => process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
    },
    {
      name: 'Development Puppeteer',
      fn: () => generateInvoicePDFWithPuppeteer(data),
      condition: () => true // Always available as fallback
    },
    {
      name: 'Simple Puppeteer',
      fn: () => generateInvoicePDFSimple(data),
      condition: () => true // Always available as final fallback
    }
  ];

  // Try each approach that meets the condition
  for (let i = 0; i < approaches.length; i++) {
    const approach = approaches[i];
    
    if (!approach.condition()) {
      console.log(`Skipping ${approach.name} - condition not met`);
      continue;
    }
    
    try {
      console.log(`Trying ${approach.name}...`);
      const result = await approach.fn();
      console.log(`${approach.name} succeeded! PDF size:`, result.length, 'bytes');
      return result;
    } catch (error) {
      console.error(`${approach.name} failed:`, error);
      
      // If this is the last approach, throw the error
      if (i === approaches.length - 1) {
        throw new Error(`All PDF generation approaches failed. Last error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Otherwise, continue to the next approach
      console.log(`Continuing to next approach...`);
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('No PDF generation approaches available');
}

async function generateInvoicePDFWithChromium(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('Using @sparticuz/chromium for production...');
    
    // Configure Chromium for production (Vercel)
    await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
    
    // Launch browser with proper production configuration
    browser = await puppeteerCore.launch({
      args: [
        ...chromium.args,
        '--hide-scrollbars',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      defaultViewport: { width: 1200, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    page = await browser.newPage();
    page.setDefaultTimeout(30000);
    
    const html = generateInvoiceHTML(data);
    
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait a bit for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });
    
    console.log('Production PDF generated successfully, size:', pdf.length, 'bytes');
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Production Chromium approach failed:', error);
    throw error;
  } finally {
    if (page) {
      try { await page.close(); } catch (e) {}
    }
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
  }
}

async function generateInvoicePDFWithPuppeteer(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('Using regular Puppeteer for development...');
    
    const puppeteer = (await import('puppeteer')).default;
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    page = await browser.newPage();
    
    const html = generateInvoiceHTML(data);
    
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true
    });
    
    console.log('Development PDF generated successfully, size:', pdf.length, 'bytes');
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Development Puppeteer approach failed:', error);
    throw error;
  } finally {
    if (page) {
      try { await page.close(); } catch (e) {}
    }
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
  }
}

async function generateInvoicePDFSimple(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('Using simple Puppeteer as final fallback...');
    
    const puppeteer = (await import('puppeteer')).default;
    
    // Minimal configuration for maximum compatibility
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    
    const html = generateInvoiceHTML(data);
    
    // Simple content setting without complex wait conditions
    await page.setContent(html);
    
    // Basic PDF generation
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    
    console.log('Simple PDF generated successfully, size:', pdf.length, 'bytes');
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Simple Puppeteer approach failed:', error);
    throw error;
  } finally {
    if (page) {
      try { await page.close(); } catch (e) {}
    }
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
  }
} 

 
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

export function generateInvoiceHTML(data: InvoiceData): string {
  console.log('=== HTML GENERATION DEBUG START ===')
  console.log('Generating HTML with data:', JSON.stringify(data, null, 2));
  
  // Validate data
  if (!data.items || data.items.length === 0) {
    console.warn('❌ No items found in invoice data');
    data.items = [{ srl: 1, particular: 'No items', quantity: 0, rent: 0, amount: 0 }];
  }
  
  // Validate required fields
  if (!data.customerName) {
    console.warn('❌ Customer name is missing');
    data.customerName = 'Unknown Customer';
  }
  
  if (!data.quotationNo) {
    console.warn('❌ Quotation number is missing');
    data.quotationNo = 'N/A';
  }
  
  console.log('✅ Validated data:', {
    customerName: data.customerName,
    quotationNo: data.quotationNo,
    itemsCount: data.items.length,
    totalAmount: data.totalAmount
  });
  
  // Ensure all data is properly escaped for HTML
  const escapeHtml = (text: string | number | null | undefined): string => {
    if (text === null || text === undefined) return '';
    const str = String(text);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  console.log('Processing items...')
  const itemsHTML = data.items.map((item, index) => {
    console.log(`Item ${index + 1}:`, item);
    return `
    <tr>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${escapeHtml(item.srl || '')}</td>
      <td style="text-align: left; border: 1px solid #000; padding: 4px; font-size: 9px;">${escapeHtml(item.particular || '')}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${escapeHtml(item.quantity || 0)}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${escapeHtml((item.rent || 0).toFixed(2))}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 9px;">${escapeHtml((item.amount || 0).toFixed(2))}</td>
    </tr>
  `}).join('')

  const totalQty = data.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  
  console.log('✅ Generated items HTML length:', itemsHTML.length);
  console.log('✅ Total quantity:', totalQty);
  console.log('✅ Sample items HTML:', itemsHTML.substring(0, 200) + '...');

  console.log('Building full HTML...')
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${escapeHtml(data.quotationNo)}</title>
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
            <span class="value">${escapeHtml(data.customerName)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Address:</span>
            <span class="value">${escapeHtml(data.customerAddress)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Tel:</span>
            <span class="value">${escapeHtml(data.customerTel)}</span>
          </div>
          <div class="detail-row">
            <span class="label">State:</span>
            <span class="value">${escapeHtml(data.customerState)}</span>
          </div>
          <div class="detail-row">
            <span class="label">State Code:</span>
            <span class="value">${escapeHtml(data.customerStateCode)}</span>
          </div>
          <div class="detail-row">
            <span class="label">GSTIN:</span>
            <span class="value">${escapeHtml(data.customerGSTIN || '-')}</span>
          </div>
          <div class="detail-row">
            <span class="label">Ref Name:</span>
            <span class="value">${escapeHtml(data.refName || '-')}</span>
          </div>
        </div>

        <div class="booking-details">
          <div class="section-title">Booking Details</div>
          <div class="detail-row">
            <span class="label">Quotation No:</span>
            <span class="value">${escapeHtml(data.quotationNo)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Booking Date:</span>
            <span class="value">${escapeHtml(data.bookingDate)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Event Date:</span>
            <span class="value">${escapeHtml(data.eventDate)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Start Time:</span>
            <span class="value">${escapeHtml(data.startTime)}</span>
          </div>
          <div class="detail-row">
            <span class="label">End Time:</span>
            <span class="value">${escapeHtml(data.endTime)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Manager:</span>
            <span class="value">${escapeHtml(data.manager || '-')}</span>
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
            <td style="text-align: center; border: 1px solid #000; padding: 4px; font-weight: bold; font-size: 9px;">${escapeHtml(totalQty)}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px;"></td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px; font-weight: bold; font-size: 9px;">₹ ${escapeHtml((data.totalAmount || 0).toFixed(2))}</td>
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
            <td>${escapeHtml(data.sacCode)}</td>
            <td>${escapeHtml((data.taxableAmount || 0).toFixed(2))}</td>
            <td>0.00 %</td>
            <td>0.00</td>
            <td>0.00 %</td>
            <td>0.00</td>
            <td>${escapeHtml((data.totalAmount || 0).toFixed(2))}</td>
          </tr>
        </tbody>
      </table>

      <div class="advance-balance">
        <div class="advance-section">
          <span><strong>Advance:</strong> ${escapeHtml((data.advanceAmount || 0).toFixed(2))}</span>
        </div>
        <div class="balance-section">
          <span><strong>Balance:</strong> ${escapeHtml((data.balanceAmount || 0).toFixed(2))}</span>
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
          <span>${escapeHtml(data.remarks || '-')}</span>
        </div>
      </div>

      <div class="invoice-value">
        <strong>Invoice Value :</strong> ${escapeHtml(data.invoiceValueInWords)}
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
  `;
  
  console.log('✅ Generated HTML length:', html.length);
  console.log('✅ HTML preview (first 500 chars):', html.substring(0, 500));
  console.log('=== HTML GENERATION DEBUG COMPLETE ===')
  
  return html;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  console.log('=== PDF GENERATION START ===')
  console.log('Starting invoice PDF generation...');
  
  // Define approaches to try in order
  const approaches = [
    {
      name: 'Simple Text PDF',
      fn: () => generateSimpleTextPDF(data),
      condition: () => true // Always try this first for reliability
    },
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
    
    // Skip font loading to avoid delays and potential issues
    console.log('Skipping font loading for faster rendering...');
    
    // Launch browser with minimal configuration for better compatibility
    browser = await puppeteerCore.launch({
      args: [
        ...chromium.args,
        '--hide-scrollbars',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Disable images for faster rendering
        '--run-all-compositor-stages-before-draw',
        '--disable-background-networking'
      ],
      defaultViewport: { width: 1200, height: 1600 }, // Increased height for better rendering
      executablePath: await chromium.executablePath(),
      headless: true,
      timeout: 60000, // Increased timeout
    });

    page = await browser.newPage();
    page.setDefaultTimeout(60000); // Increased timeout
    
    const html = generateInvoiceHTML(data);
    
    console.log('Setting HTML content...');
    // Set content with basic wait
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle0 to domcontentloaded for faster loading
      timeout: 30000 
    });
    
    // Force wait for content to render
    console.log('Waiting for content to render...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time
    
    // Verify content is present using page evaluation
    const contentCheck = await page.evaluate(() => {
      const customerName = document.querySelector('body')?.textContent?.includes('Customer Details');
      const itemsTable = document.querySelector('.items-table');
      const hasData = document.body.textContent && document.body.textContent.length > 100;
      
      console.log('Content check:', { customerName, hasItemsTable: !!itemsTable, hasData });
      return { customerName, hasItemsTable: !!itemsTable, hasData };
    });
    
    console.log('Content verification:', contentCheck);
    
    if (!contentCheck.hasData) {
      console.warn('⚠️ Page content appears to be empty, generating anyway...');
    }
    
    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      timeout: 30000 // Add timeout for PDF generation
    });
    
    console.log('Production PDF generated successfully, size:', pdf.length, 'bytes');
    
    if (pdf.length < 1000) {
      console.warn('⚠️ Generated PDF seems very small, might be empty');
    }
    
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
        '--disable-renderer-backgrounding',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    page = await browser.newPage();
    page.setDefaultTimeout(30000);
    
    const html = generateInvoiceHTML(data);
    
    console.log('Setting HTML content...');
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for fonts and images to load
    console.log('Waiting for assets to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Ensure the page is fully rendered
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true));
        }
      });
    });
    
    console.log('Generating PDF...');
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
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    page = await browser.newPage();
    page.setDefaultTimeout(30000);
    
    const html = generateInvoiceHTML(data);
    
    console.log('Setting HTML content...');
    // Simple content setting without complex wait conditions
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Generating PDF...');
    // Basic PDF generation
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true
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

// Simple text-based PDF generation using minimal HTML
async function generateSimpleTextPDF(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('Using simple text PDF generation...');
    
    // Try to use puppeteer directly first
    let puppeteer;
    try {
      puppeteer = (await import('puppeteer')).default;
    } catch {
      // Fallback to puppeteer-core for production
      puppeteer = puppeteerCore;
    }
    
    // Minimal browser configuration
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ],
      timeout: 30000
    };
    
    // Add executable path for production
    if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
      launchOptions.executablePath = await chromium.executablePath();
      launchOptions.args = [...chromium.args, ...launchOptions.args];
    }
    
    browser = await puppeteer.launch(launchOptions);
    page = await browser.newPage();
    
    // Generate compact single-page HTML
    const simpleHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 10px; 
            line-height: 1.2; 
            color: #000; 
            padding: 10px;
            max-height: 297mm;
            overflow: hidden;
          }
          .header { 
            text-align: center; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #000; 
            padding-bottom: 5px; 
          }
          .header h1 { font-size: 14px; margin-bottom: 3px; }
          .header h2 { font-size: 12px; margin-bottom: 3px; }
          .header p { font-size: 9px; }
          
          .main-container { display: flex; gap: 10px; margin-bottom: 10px; }
          .left-column, .right-column { flex: 1; }
          
          .section { 
            margin: 5px 0; 
            padding: 5px; 
            border: 1px solid #000; 
            font-size: 9px;
          }
          .section h3 { font-size: 10px; margin-bottom: 3px; }
          .row { margin: 2px 0; }
          .label { font-weight: bold; display: inline-block; width: 80px; }
          
          .items { margin: 5px 0; }
          .item { 
            border-bottom: 1px solid #ccc; 
            padding: 2px 0; 
            font-size: 8px;
          }
          .total { 
            font-weight: bold; 
            border-top: 1px solid #000; 
            padding-top: 3px; 
            margin-top: 5px; 
          }
          
          .bottom-section { margin-top: 10px; }
          .terms { 
            margin: 5px 0; 
            font-size: 7px; 
            line-height: 1.1;
          }
          .terms p { margin: 1px 0; }
          
          .signatures { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 10px;
          }
          .signature-box { 
            text-align: center; 
            border: 1px solid #000; 
            padding: 8px; 
            width: 45%; 
            font-size: 8px;
          }
          .signature-line { 
            border-top: 1px solid #000; 
            margin-top: 15px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HUMJOLI EVENTS</h1>
          <p>State: Maharashtra | State Code: 27 | GSTIN: 27ADOPA7853Q1ZR</p>
          <h2>INVOICE - ${data.quotationNo}</h2>
        </div>
        
        <div class="main-container">
          <div class="left-column">
            <div class="section">
              <h3>CUSTOMER DETAILS</h3>
              <div class="row"><span class="label">Name:</span> ${data.customerName}</div>
              <div class="row"><span class="label">Address:</span> ${data.customerAddress}</div>
              <div class="row"><span class="label">Phone:</span> ${data.customerTel}</div>
              <div class="row"><span class="label">State:</span> ${data.customerState}</div>
              <div class="row"><span class="label">State Code:</span> ${data.customerStateCode}</div>
              <div class="row"><span class="label">GSTIN:</span> ${data.customerGSTIN || 'N/A'}</div>
              <div class="row"><span class="label">Reference:</span> ${data.refName || 'N/A'}</div>
            </div>
            
            <div class="section">
              <h3>EVENT DETAILS</h3>
              <div class="row"><span class="label">Quotation No:</span> ${data.quotationNo}</div>
              <div class="row"><span class="label">Booking Date:</span> ${data.bookingDate}</div>
              <div class="row"><span class="label">Event Date:</span> ${data.eventDate}</div>
              <div class="row"><span class="label">Time:</span> ${data.startTime} to ${data.endTime}</div>
              <div class="row"><span class="label">Manager:</span> ${data.manager || 'N/A'}</div>
            </div>
          </div>
          
          <div class="right-column">
            <div class="section">
              <h3>ITEMS & SERVICES</h3>
              <div class="items">
                ${data.items.map((item, index) => `
                  <div class="item">
                    <strong>${index + 1}. ${item.particular}</strong><br>
                    Qty: ${item.quantity} | Rate: ₹${item.rent} | Amount: ₹${item.amount}
                  </div>
                `).join('')}
              </div>
              <div class="total">
                <div class="row"><span class="label">Total Qty:</span> ${data.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                <div class="row"><span class="label">Total Amount:</span> ₹${data.totalAmount}</div>
              </div>
            </div>
            
            <div class="section">
              <h3>TAXATION & PAYMENT</h3>
              <div class="row"><span class="label">SAC Code:</span> ${data.sacCode}</div>
              <div class="row"><span class="label">Taxable Amt:</span> ₹${data.taxableAmount}</div>
              <div class="row"><span class="label">CGST:</span> ₹${data.cgstAmount}</div>
              <div class="row"><span class="label">SGST:</span> ₹${data.sgstAmount}</div>
              <div class="row"><strong>TOTAL: ₹${data.totalAmount}</strong></div>
              <div class="row"><span class="label">Advance:</span> ₹${data.advanceAmount}</div>
              <div class="row"><span class="label">Balance:</span> ₹${data.balanceAmount}</div>
              <div class="row"><span class="label">In Words:</span> ${data.invoiceValueInWords}</div>
            </div>
          </div>
        </div>
        
        <div class="bottom-section">
          <div class="section">
            <h3>TERMS & CONDITIONS</h3>
            <div class="terms">
              <p>1. Once Order taken will not be cancelled</p>
              <p>2. All Item will chargeable for Two Hours (except SAFA/Pagdi)</p>
              <p>3. In case of delay extra hours will be chargeable.</p>
              <p>4. Missing of Safa will be chargeable (responsibility of customer)</p>
              <p>5. BOOKING ADVANCE 50% & BALANCE AMOUNT SHOULD BE PAID ON VENUE</p>
            </div>
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <p>Customer's Signature</p>
              <div class="signature-line"></div>
            </div>
            <div class="signature-box">
              <p>For HUMJOLI EVENTS</p>
              <p>Authorised Signatory</p>
              <div class="signature-line"></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log('Setting simple HTML content...');
    await page.setContent(simpleHTML, { waitUntil: 'domcontentloaded' });
    
    // Short wait for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Generating simple PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      printBackground: true
    });
    
    console.log('Simple text PDF generated successfully, size:', pdf.length, 'bytes');
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Simple text PDF approach failed:', error);
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

 
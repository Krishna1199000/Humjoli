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
    
    // Generate modern corporate invoice HTML
    const simpleHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 9px; 
            line-height: 1.2; 
            color: #1f2937; 
            background: #ffffff;
            padding: 10px;
            max-height: 297mm;
            overflow: hidden;
          }
          
          .container {
            max-width: 100%;
            margin: 0 auto;
          }
          
          /* Header Section */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .company-info {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .logo {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          }
          
          .company-details h1 {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 2px;
          }
          
          .company-details p {
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 1px;
          }
          
          .invoice-meta {
            text-align: right;
          }
          
          .invoice-number {
            font-size: 14px;
            font-weight: 600;
            color: #3b82f6;
            margin-bottom: 4px;
          }
          
          .invoice-date {
            font-size: 9px;
            color: #6b7280;
          }
          
          /* Main Content Grid */
          .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          
          /* Cards */
          .card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          }
          
          .card h3 {
            font-size: 11px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .card h3::before {
            content: '';
            width: 2px;
            height: 12px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 1px;
          }
          
          /* Customer Details */
          .customer-details .detail-row {
            display: flex;
            margin-bottom: 4px;
            align-items: center;
          }
          
          .detail-label {
            font-weight: 500;
            color: #374151;
            min-width: 60px;
            font-size: 9px;
          }
          
          .detail-value {
            color: #1f2937;
            font-size: 9px;
          }
          
          /* Event Details Table */
          .event-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }
          
          .event-table tr {
            border-bottom: 1px solid #f3f4f6;
          }
          
          .event-table tr:last-child {
            border-bottom: none;
          }
          
          .event-table td {
            padding: 4px 0;
            font-size: 9px;
          }
          
          .event-table td:first-child {
            font-weight: 500;
            color: #374151;
            width: 40%;
          }
          
          .event-table td:last-child {
            color: #1f2937;
          }
          
          /* Items Table */
          .items-section {
            grid-column: 1 / -1;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          }
          
          .items-table th {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 6px 4px;
            text-align: left;
            font-weight: 600;
            font-size: 9px;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .items-table td {
            padding: 4px 4px;
            font-size: 9px;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .items-table tr:nth-child(even) {
            background: #fafafa;
          }
          
          .items-table tr:last-child td {
            border-bottom: none;
          }
          
          .item-name {
            font-weight: 500;
            color: #1f2937;
          }
          
          .item-qty, .item-rate, .item-amount {
            text-align: center;
            color: #374151;
          }
          
          /* Summary Section */
          .summary-section {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 10px;
            align-items: start;
          }
          
          .payment-details {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 8px;
          }
          
          .payment-details h3 {
            color: #1f2937;
            margin-bottom: 8px;
            font-size: 11px;
          }
          
          .payment-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            padding: 2px 0;
          }
          
          .payment-row.total {
            border-top: 2px solid #e5e7eb;
            margin-top: 6px;
            padding-top: 6px;
            font-weight: 600;
            font-size: 10px;
            color: #1f2937;
          }
          
          .amount-in-words {
            margin-top: 8px;
            padding: 6px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-style: italic;
            color: #374151;
            font-size: 8px;
          }
          
          /* Terms Section */
          .terms-section {
            grid-column: 1 / -1;
            margin-top: 6px;
          }
          
          .terms-content {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 4px;
            font-size: 8px;
            line-height: 1.2;
            color: #6b7280;
          }
          
          .terms-content ol {
            margin-left: 10px;
          }
          
          .terms-content li {
            margin-bottom: 2px;
          }
          
          /* Footer */
          .footer {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 2px solid #e5e7eb;
          }
          
          .signature-box {
            text-align: center;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background: #ffffff;
          }
          
          .signature-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
            font-size: 10px;
          }
          
          .signature-line {
            border-top: 2px dotted #d1d5db;
            margin-top: 25px;
            padding-top: 10px;
          }
          
          .thank-you {
            grid-column: 1 / -1;
            text-align: center;
            margin-top: 6px;
            padding: 4px;
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border-radius: 4px;
            color: #0369a1;
            font-weight: 500;
            font-size: 9px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="company-info">
              <div class="logo">H</div>
              <div class="company-details">
                <h1>HUMJOLI EVENTS</h1>
                <p>State: Maharashtra | State Code: 27</p>
                <p>GSTIN: 27ADOPA7853Q1ZR</p>
                <p>Professional Event Management Services</p>
              </div>
            </div>
            <div class="invoice-meta">
              <div class="invoice-number">INVOICE #${data.quotationNo}</div>
              <div class="invoice-date">Date: ${data.bookingDate}</div>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="content-grid">
            <!-- Customer Details -->
            <div class="card">
              <h3>Customer Details</h3>
              <div class="customer-details">
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${data.customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${data.customerAddress}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${data.customerTel}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">State:</span>
                  <span class="detail-value">${data.customerState} (${data.customerStateCode})</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">GSTIN:</span>
                  <span class="detail-value">${data.customerGSTIN || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reference:</span>
                  <span class="detail-value">${data.refName || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Event Details -->
            <div class="card">
              <h3>Event Details</h3>
              <table class="event-table">
                <tr>
                  <td>Quotation No:</td>
                  <td>${data.quotationNo}</td>
                </tr>
                <tr>
                  <td>Booking Date:</td>
                  <td>${data.bookingDate}</td>
                </tr>
                <tr>
                  <td>Event Date:</td>
                  <td>${data.eventDate}</td>
                </tr>
                <tr>
                  <td>Time:</td>
                  <td>${data.startTime} - ${data.endTime}</td>
                </tr>
                <tr>
                  <td>Manager:</td>
                  <td>${data.manager || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Items Table -->
            <div class="items-section">
              <div class="card">
                <h3>Items & Services</h3>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Item/Service</th>
                      <th>Qty</th>
                      <th>Rate (₹)</th>
                      <th>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.items.map((item, index) => `
                      <tr>
                        <td class="item-name">${index + 1}. ${item.particular}</td>
                        <td class="item-qty">${item.quantity}</td>
                        <td class="item-rate">${item.rent.toFixed(2)}</td>
                        <td class="item-amount">${item.amount.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Summary Section -->
            <div class="summary-section">
              <div class="card">
                <h3>Payment Summary</h3>
                <div class="payment-row">
                  <span>Advance Amount:</span>
                  <span>₹${data.advanceAmount.toFixed(2)}</span>
                </div>
                <div class="payment-row">
                  <span>Balance Amount:</span>
                  <span>₹${data.balanceAmount.toFixed(2)}</span>
                </div>
                <div class="payment-row">
                  <span>Remarks:</span>
                  <span>${data.remarks || 'N/A'}</span>
                </div>
              </div>
              
              <div class="payment-details">
                <h3>Tax Summary</h3>
                <div class="payment-row">
                  <span>Taxable Amount:</span>
                  <span>₹${data.taxableAmount.toFixed(2)}</span>
                </div>
                <div class="payment-row">
                  <span>CGST (0%):</span>
                  <span>₹${data.cgstAmount.toFixed(2)}</span>
                </div>
                <div class="payment-row">
                  <span>SGST (0%):</span>
                  <span>₹${data.sgstAmount.toFixed(2)}</span>
                </div>
                <div class="payment-row total">
                  <span>Total Amount:</span>
                  <span>₹${data.totalAmount.toFixed(2)}</span>
                </div>
                <div class="amount-in-words">
                  <strong>Amount in Words:</strong> ${data.invoiceValueInWords}
                </div>
              </div>
            </div>
            
            <!-- Terms Section -->
            <div class="terms-section">
              <div class="card">
                <h3>Terms & Conditions</h3>
                <div class="terms-content">
                  <ol>
                    <li>Once Order taken will not be cancelled</li>
                    <li>All Item will chargeable for Two Hours (except SAFA/Pagdi)</li>
                    <li>In case of delay extra hours will be chargeable</li>
                    <li>Missing of Safa will be chargeable (responsibility of customer)</li>
                    <li>BOOKING ADVANCE 50% & BALANCE AMOUNT SHOULD BE PAID ON VENUE</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="signature-box">
                <div class="signature-title">Customer's Signature</div>
                <div class="signature-line"></div>
              </div>
              <div class="signature-box">
                <div class="signature-title">For HUMJOLI EVENTS</div>
                <div class="signature-title" style="font-size: 10px; margin-top: 5px;">Authorised Signatory</div>
                <div class="signature-line"></div>
              </div>
            </div>
            
            <div class="thank-you">
              Thank you for choosing HUMJOLI EVENTS for your special day! 🎉
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

 
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
  // Try multiple approaches for better reliability
  const approaches = [
    () => generateInvoicePDFWithPuppeteer(data),
    () => generateInvoicePDFWithChromium(data),
    () => generateInvoicePDFSimple(data),
    () => generateInvoicePDFMinimal(data)
  ];

  for (let i = 0; i < approaches.length; i++) {
    try {
      console.log(`Trying PDF generation approach ${i + 1}...`);
      const result = await approaches[i]();
      console.log(`Approach ${i + 1} succeeded!`);
      return result;
    } catch (error) {
      console.error(`Approach ${i + 1} failed:`, error);
      if (i === approaches.length - 1) {
        // All approaches failed, provide helpful error message
        const errorMessage = `All PDF generation approaches failed. Please ensure Chrome/Chromium is installed and accessible. Error details: ${error instanceof Error ? error.message : String(error)}`;
        throw new Error(errorMessage);
      }
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('All PDF generation approaches failed');
}

async function generateInvoicePDFWithPuppeteer(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Platform:', process.platform);
    
    // Check if we're in Vercel environment
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    
    if (isVercel) {
      console.log('Using Vercel Chromium configuration');
      
      // Configure Chromium for Vercel
      await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
      
      // Launch browser with proper Vercel configuration
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
    } else {
      console.log('Using local Puppeteer configuration');
      
      // For local development, try to use puppeteer with explicit Chrome path
      try {
        const puppeteer = (await import('puppeteer')).default;
        
        // Try to launch with default configuration first
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        });
      } catch (error) {
        console.log('Regular puppeteer failed, trying with explicit Chrome path');
        
        // If that fails, try with explicit Chrome path
        const puppeteer = (await import('puppeteer')).default;
        const { execSync } = require('child_process');
        const { existsSync } = require('fs');
        const { join } = require('path');
        
        let chromePath = null;
        
        // Try to find Chrome
        try {
          chromePath = execSync('where chrome', { encoding: 'utf8' }).trim().split('\n')[0];
          if (!existsSync(chromePath)) chromePath = null;
        } catch (e) {
          // Chrome not in PATH, try common locations
          const commonPaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
            join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
            join(process.env['PROGRAMFILES(X86)'] || '', 'Google\\Chrome\\Application\\chrome.exe')
          ];
          
          for (const path of commonPaths) {
            if (existsSync(path)) {
              chromePath = path;
              break;
            }
          }
        }
        
        if (chromePath) {
          console.log('Found Chrome at:', chromePath);
          browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-gpu',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding'
            ]
          });
        } else {
          throw new Error('Chrome not found on system. Please install Google Chrome or run: npx puppeteer browsers install chrome');
        }
      }
    }

    // Create page with proper error handling
    page = await browser.newPage();
    
    // Set a reasonable timeout for page operations
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    const html = generateInvoiceHTML(data);
    
    console.log('Setting HTML content...');
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait a bit for fonts and images to load
    console.log('Waiting for assets to load...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple wait for any images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Generating PDF...');
    
    // Generate PDF with more conservative settings
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });
    
    console.log('PDF generated successfully, size:', pdf.length, 'bytes');
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Provide more specific error messages
    let errorMessage = `Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`;
    
    if (error instanceof Error) {
      if (error.message.includes('Target closed') || error.message.includes('Protocol error')) {
        errorMessage = 'PDF generation failed: Browser connection lost. This may be due to server resource limits or Chrome compatibility issues.';
      } else if (error.message.includes('Navigation timeout')) {
        errorMessage = 'PDF generation failed: Timeout waiting for page to load. Check if all assets are accessible.';
      } else if (error.message.includes('Logo file not found')) {
        errorMessage = 'PDF generation failed: Logo file not found. Please ensure the logo file exists.';
      }
    }
    
    throw new Error(errorMessage);
  } finally {
    // Clean up resources properly
    if (page) {
      try {
        await page.close();
        console.log('Page closed successfully');
      } catch (closeError) {
        console.error('Error closing page:', closeError);
      }
    }
    
    if (browser) {
      console.log('Closing browser...');
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

async function generateInvoicePDFWithChromium(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('Using Chromium approach...');
    
    // Configure Chromium for Vercel
    await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
    
    // Launch browser with proper Vercel configuration
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });
    
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Chromium approach failed:', error);
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
    console.log('Using simple approach...');
    
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
    
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Simple approach failed:', error);
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

async function generateInvoicePDFMinimal(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('Using minimal approach...');
    
    const puppeteer = (await import('puppeteer')).default;
    
    // Minimal browser launch with basic args only
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
    
    return Buffer.from(pdf);
  } catch (error) {
    console.error('Minimal approach failed:', error);
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

 
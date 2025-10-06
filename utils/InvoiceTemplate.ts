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
  customerSignature?: string
  items: InvoiceItem[]
}

export function generateInvoiceHTML(data: InvoiceData): string {
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

  const itemsHTML = data.items.map((item) => `
    <tr>
      <td style="text-align: center;">${escapeHtml(item.srl)}</td>
      <td style="text-align: left; padding-left: 8px;">${escapeHtml(item.particular)}</td>
      <td style="text-align: center;">${escapeHtml(item.quantity)}</td>
      <td style="text-align: right; padding-right: 8px;">${escapeHtml(item.rent.toFixed(2))}</td>
      <td style="text-align: right; padding-right: 8px;">${escapeHtml(item.amount.toFixed(2))}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          margin: 15mm;
          size: A4;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          font-size: 14px;
          line-height: 1.4;
          color: #000;
        }
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 45px;
          height: 45px;
          background: #4A90E2;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          border-radius: 5px;
        }
        .company-info {
          padding-top: 3px;
        }
        .company-name {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 4px 0;
        }
        .company-details {
          font-size: 12px;
          margin: 2px 0;
          color: #333;
        }
        .invoice-info {
          text-align: right;
          font-size: 13px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .details-section {
          border: 1px solid #000;
          padding: 12px;
        }
        .section-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
        }
        .detail-row {
          margin-bottom: 6px;
          font-size: 13px;
        }
        .detail-label {
          font-weight: bold;
          display: inline-block;
          width: 100px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          font-size: 13px;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          text-align: center;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 15px 0;
        }
        .summary-section {
          border: 1px solid #000;
          padding: 12px;
        }
        .summary-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 13px;
        }
        .terms {
          margin: 20px 0;
        }
        .terms-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .terms-list {
          margin: 0;
          padding-left: 25px;
          font-size: 13px;
        }
        .terms-list li {
          margin-bottom: 4px;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 30px;
        }
        .signature-box {
          text-align: center;
        }
        .signature-title {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 40px;
        }
        .signature-line {
          border-top: 1px solid #000;
        }
        .thank-you {
          text-align: center;
          color: #4A90E2;
          font-style: italic;
          margin-top: 15px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <div class="logo">H</div>
          <div class="company-info">
            <div class="company-name">HUMJOLI EVENTS</div>
            <div class="company-details">State: Maharashtra | State Code: 27</div>
            <div class="company-details">GSTIN: 27ADOPA7853Q1ZR</div>
            <div class="company-details">Professional Event Management Services</div>
          </div>
        </div>
        <div class="invoice-info">
          <div>INVOICE #${escapeHtml(data.quotationNo)}</div>
          <div>Date: ${escapeHtml(data.bookingDate)}</div>
        </div>
      </div>

      <div class="details-grid">
        <div class="details-section">
          <div class="section-title">Customer Details</div>
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span>${escapeHtml(data.customerName)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Address:</span>
            <span>${escapeHtml(data.customerAddress)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span>${escapeHtml(data.customerTel)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">State:</span>
            <span>${escapeHtml(data.customerState)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">State Code:</span>
            <span>${escapeHtml(data.customerStateCode)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">GSTIN:</span>
            <span>${escapeHtml(data.customerGSTIN || 'N/A')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Reference:</span>
            <span>${escapeHtml(data.refName || 'N/A')}</span>
          </div>
        </div>

        <div class="details-section">
          <div class="section-title">Event Details</div>
          <div class="detail-row">
            <span class="detail-label">Quotation No:</span>
            <span>${escapeHtml(data.quotationNo)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking Date:</span>
            <span>${escapeHtml(data.bookingDate)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Event Date:</span>
            <span>${escapeHtml(data.eventDate)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span>${escapeHtml(data.startTime)} - ${escapeHtml(data.endTime)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Manager:</span>
            <span>${escapeHtml(data.manager || 'N/A')}</span>
          </div>
        </div>
      </div>

      <div class="section-title">Items & Services</div>
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Item/Srl</th>
            <th style="width: 40%;">Particular</th>
            <th style="width: 15%;">Qty</th>
            <th style="width: 15%;">Rate (₹)</th>
            <th style="width: 20%;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="summary-grid">
        <div class="summary-section">
          <div class="summary-title">Payment Summary</div>
          <div class="summary-row">
            <span>Advance Amount:</span>
            <span>₹${escapeHtml(data.advanceAmount.toFixed(2))}</span>
          </div>
          <div class="summary-row">
            <span>Balance Amount:</span>
            <span>₹${escapeHtml(data.balanceAmount.toFixed(2))}</span>
          </div>
          <div class="summary-row">
            <span>Remarks:</span>
            <span>${escapeHtml(data.remarks || '-')}</span>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-title">Tax Summary</div>
          <div class="summary-row">
            <span>SAC Code:</span>
            <span>${escapeHtml(data.sacCode)}</span>
          </div>
          <div class="summary-row">
            <span>Taxable Amount:</span>
            <span>₹${escapeHtml(data.taxableAmount.toFixed(2))}</span>
          </div>
          <div class="summary-row">
            <span>Total Amount:</span>
            <span>₹${escapeHtml(data.totalAmount.toFixed(2))}</span>
          </div>
          <div style="margin-top: 8px; font-style: italic; font-size: 12px;">
            Amount in Words: ${escapeHtml(data.invoiceValueInWords)}
          </div>
        </div>
      </div>

      <div class="terms">
        <div class="terms-title">Terms & Conditions</div>
        <ol class="terms-list">
          <li>Once Order taken will not be cancelled</li>
          <li>All Item will chargeable for Two Hours * except SAFA (Pagdi)</li>
          <li>In case of delay extra hours will be chargeable.</li>
          <li>Missing of Safa will be chargeable (i e responsibility should be taken by the customer.)</li>
          <li>BOOKING ADVANCE 50% & BALANCE AMOUNT SHOULD BE PAID ON VENUE</li>
        </ol>
      </div>

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-title">Customer's Sign</div>
          ${data.customerSignature ? 
            `<div class="signature-image">
              <img src="${data.customerSignature}" alt="Customer Signature" style="max-width: 200px; max-height: 80px; border: 1px solid #ccc; background: white;" />
            </div>` : 
            '<div class="signature-line"></div>'
          }
        </div>
        <div class="signature-box">
          <div class="signature-title">For HUMJOLI EVENTS</div>
          <div class="signature-title">Authorised Signatory</div>
          <div class="signature-line"></div>
        </div>
      </div>

      <div class="thank-you">
        Thank you for choosing HUMJOLI EVENTS for your special day!
      </div>
    </body>
    </html>
  `

  return html
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

    if (isProd) {
      // Production: use @sparticuz/chromium with puppeteer-core
      browser = await puppeteerCore.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 800, height: 1130 }, // A4 size
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    } else {
      // Development (Windows/local): use full Puppeteer
      const puppeteer = (await import('puppeteer')).default
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 800, height: 1130 }, // A4 size
      })
    }

    page = await browser.newPage()
    
    const html = generateInvoiceHTML(data)
    await page.setContent(html, { waitUntil: 'domcontentloaded' })
    
    // Generate PDF with exact margins to match the layout
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      printBackground: true,
    })
    
    return Buffer.from(pdf)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  } finally {
    if (page) try { await page.close() } catch {}
    if (browser) try { await browser.close() } catch {}
  }
}
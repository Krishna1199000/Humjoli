import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import chromium from "@sparticuz/chromium"
import puppeteerCore from "puppeteer-core"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function startOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1, 0, 0, 0)
}
function endOfMonth(year: number, month: number) {
  return new Date(year, month, 0, 23, 59, 59, 999)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const monthParam = url.searchParams.get('month')
    const yearParam = url.searchParams.get('year')
    const startParam = url.searchParams.get('startDate')
    const endParam = url.searchParams.get('endDate')

    const now = new Date()
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear()

    let start: Date | undefined
    let end: Date | undefined
    if (startParam || endParam) {
      if (startParam) start = new Date(startParam)
      if (endParam) {
        const d = new Date(endParam)
        d.setHours(23, 59, 59, 999)
        end = d
      }
    } else {
      start = startOfMonth(year, month)
      end = endOfMonth(year, month)
    }

    const where: any = {}
    if (start || end) {
      where.createdAt = {}
      if (start) where.createdAt.gte = start
      if (end) where.createdAt.lte = end
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    })

    const totalSales = invoices.reduce((s, inv) => s + Number(inv.totalAmount || 0), 0)

    const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

    const rows = invoices.map((inv) => `
      <tr>
        <td>${inv.quotationNo}</td>
        <td>${inv.customerName}</td>
        <td>${inv.customerAddress || ''}, ${inv.customerState || ''}</td>
        <td>${formatDate(inv.createdAt)}</td>
        <td>${inv.startTime || ''}</td>
        <td>₹${Number(inv.totalAmount || 0).toFixed(2)}</td>
        <td>${(inv as any).status || (Number(inv.balanceAmount || 0) > 0 ? 'PENDING' : 'PAID')}</td>
      </tr>
    `).join('')

    const periodText = start && end ? `${formatDate(start)} - ${formatDate(end)}` : `${formatDate(start || new Date())}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; }
          h1 { margin: 0 0 4px 0; font-size: 22px; }
          .muted { color: #666; margin-bottom: 16px; }
          .summary { display: flex; gap: 16px; margin: 12px 0 16px 0; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h1>Sales Report</h1>
        <div class="muted">Period: ${periodText}</div>
        <div class="summary">
          <div class="card"><strong>Total Sales</strong><div>₹${totalSales.toLocaleString('en-IN')}</div></div>
          <div class="card"><strong>Invoices</strong><div>${invoices.length}</div></div>
          <div class="card"><strong>Average Invoice</strong><div>₹${(invoices.length? totalSales/invoices.length:0).toFixed(2)}</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `

    let browser;
    
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
            '--disable-features=VizDisplayCompositor'
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
              '--disable-renderer-backgrounding'
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

      const page = await browser.newPage();
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait a bit for fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pdf = await page.pdf({ 
        format: 'A4', 
        margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }, 
        printBackground: true,
        preferCSSPageSize: true
      });
      
      return new NextResponse(Buffer.from(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="SalesReport-${year}-${String(month).padStart(2,'0')}.pdf"`
        }
      });
    } catch (error) {
      console.error('Error generating sales report PDF:', error);
      throw new Error(`Failed to generate sales report PDF: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (e) {
    console.error('Sales report pdf error:', e)
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 })
  }
}


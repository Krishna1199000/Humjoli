import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ExcelJS from 'exceljs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Download sales report as Excel
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
      ? new Date(searchParams.get('start_date')!)
      : new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
    const endDate = searchParams.get('end_date')
      ? new Date(searchParams.get('end_date')!)
      : new Date()

    // Get data
    const [sales, purchases] = await Promise.all([
      prisma.enhancedInvoice.findMany({
        where: {
          issueDate: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          items: true,
          customer: {
            select: {
              displayName: true
            }
          }
        },
        orderBy: {
          issueDate: 'asc'
        }
      }),
      prisma.purchase.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          vendor: {
            select: {
              businessName: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      })
    ])

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = session.user.name || 'Admin'
    workbook.created = new Date()

    // Sales Sheet
    const salesSheet = workbook.addWorksheet('Sales')
    salesSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Invoice No', key: 'invoiceNo', width: 15 },
      { header: 'Customer', key: 'customer', width: 30 },
      { header: 'Items', key: 'items', width: 40 },
      { header: 'Total', key: 'total', width: 15 },
    ]

    sales.forEach(sale => {
      salesSheet.addRow({
        date: sale.issueDate.toLocaleDateString(),
        invoiceNo: sale.invoiceNo,
        customer: sale.customer.displayName,
        items: sale.items.map(item => `${item.name} (${item.quantity})`).join(', '),
        total: (sale.total / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      })
    })

    // Purchases Sheet
    const purchasesSheet = workbook.addWorksheet('Purchases')
    purchasesSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Vendor', key: 'vendor', width: 30 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Amount', key: 'amount', width: 15 },
    ]

    purchases.forEach(purchase => {
      purchasesSheet.addRow({
        date: purchase.date.toLocaleDateString(),
        vendor: purchase.vendor.businessName,
        description: purchase.description || '-',
        amount: (purchase.amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      })
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return response
    return new NextResponse(buffer, {
        headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.xlsx`
      }
    })
  } catch (error) {
    console.error("Error downloading sales report:", error)
    return NextResponse.json({ error: "Failed to download sales report" }, { status: 500 })
  }
}
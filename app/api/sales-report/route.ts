import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Generate sales report
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to access report
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

    // Get all sales from Billing (legacy Invoice model)
    const sales = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: true,
      }
    })

    // Do not include purchases in this sales-only report
    const purchases: any[] = []

    // Calculate totals
    // Old invoice stores amounts in rupees; convert to paise for consistency
    const totalSales = sales.reduce((sum, sale) => sum + Math.round(sale.totalAmount * 100), 0)
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)
    const netIncome = totalSales - totalPurchases

    // Get top customers
    const customerSales = sales.reduce((acc, sale) => {
      const key = sale.customerName
      if (!acc[key]) {
        acc[key] = {
          id: key,
          displayName: key,
          totalAmount: 0,
          invoiceCount: 0
        }
      }
      acc[key].totalAmount += Math.round(sale.totalAmount * 100)
      acc[key].invoiceCount++
      return acc
    }, {} as Record<string, any>)

    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5)

    const topVendors: any[] = []

    // Get monthly trends
    const months = []
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      months.push(currentDate.toISOString().slice(0, 7)) // YYYY-MM
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    const monthlySales = months.map(month => {
      const monthSales = sales.filter(sale => 
        sale.createdAt.toISOString().startsWith(month)
      ).reduce((sum, sale) => sum + Math.round(sale.totalAmount * 100), 0)

      const monthPurchases = 0

      return {
        month,
        sales: monthSales,
        purchases: monthPurchases
      }
    })

    // Get product performance
    const productPerformance = sales.flatMap(sale => sale.items)
      .reduce((acc, item) => {
        const key = (item as any).name ?? item.particular
        const label = (item as any).name ?? item.particular
        if (!acc[key]) {
          acc[key] = {
            name: label,
            quantity: 0,
            revenue: 0
          }
        }
        acc[key].quantity += item.quantity
        // old invoice item amount is rupees
        acc[key].revenue += Math.round(item.amount * 100)
        return acc
      }, {} as Record<string, any>)

    const topProducts = Object.values(productPerformance)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    return NextResponse.json({
      totalSales,
      totalPurchases: 0,
      netIncome: totalSales,
      topCustomers,
      topVendors,
      monthlySales,
      productPerformance: topProducts
    })
  } catch (error) {
    console.error("Error generating sales report:", error)
    return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 })
  }
}
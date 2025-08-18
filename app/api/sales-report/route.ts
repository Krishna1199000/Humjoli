import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

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

    let start: Date | undefined
    let end: Date | undefined

    const now = new Date()
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear()

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

    const summary = {
      totalSales: 0,
      invoiceCount: invoices.length,
      avgInvoice: 0,
    }

    // Build groupings
    const trendMap = new Map<string, number>()
    const byCustomerMap = new Map<string, number>()
    const byItemMap = new Map<string, number>()

    for (const inv of invoices) {
      summary.totalSales += Number(inv.totalAmount || 0)
      const d = new Date(inv.createdAt)
      const key = d.toISOString().slice(0, 10)
      trendMap.set(key, (trendMap.get(key) || 0) + Number(inv.totalAmount || 0))

      const customerKey = inv.customerName || 'Unknown'
      byCustomerMap.set(customerKey, (byCustomerMap.get(customerKey) || 0) + Number(inv.totalAmount || 0))

      for (const item of inv.items) {
        const itemKey = item.particular || 'Item'
        byItemMap.set(itemKey, (byItemMap.get(itemKey) || 0) + Number(item.amount || 0))
      }
    }

    summary.avgInvoice = summary.invoiceCount > 0 ? summary.totalSales / summary.invoiceCount : 0

    const trend = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }))
    const byCustomer = Array.from(byCustomerMap.entries()).map(([name, value]) => ({ name, value }))
    const byItem = Array.from(byItemMap.entries()).map(([name, value]) => ({ name, value }))

    const table = invoices.map((inv) => ({
      id: inv.id,
      quotationNo: inv.quotationNo,
      customerName: inv.customerName,
      customerAddress: inv.customerAddress,
      customerState: inv.customerState,
      date: inv.createdAt,
      time: inv.startTime ? inv.startTime : '',
      amount: Number(inv.totalAmount || 0),
      status: (inv as any).status || (Number(inv.balanceAmount || 0) > 0 ? 'PENDING' : 'PAID'),
    }))

    return NextResponse.json({ summary, trend, byCustomer, byItem, invoices: table })
  } catch (e) {
    console.error('Sales report error:', e)
    return NextResponse.json({ error: 'Failed to compute sales report' }, { status: 500 })
  }
}


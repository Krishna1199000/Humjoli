import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "EMPLOYEE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "start_date and end_date are required" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const entries = await prisma.deliveryEntry.findMany({
      where: { eventDate: { gte: start, lte: end } },
      include: { invoice: { include: { items: true } } },
      orderBy: [{ eventDate: 'asc' }, { createdAt: 'asc' }]
    })

    // Group by eventDate (YYYY-MM-DD)
    const byDate: Record<string, any[]> = {}
    for (const entry of entries) {
      const inv = entry.invoice
      const dateKey = entry.eventDate.toISOString().slice(0,10)
      if (!byDate[dateKey]) byDate[dateKey] = []
      const items = inv.items && inv.items.length ? inv.items : []
      if (items.length === 0) {
        byDate[dateKey].push({
          quotationNo: inv.quotationNo,
          customer: inv.customerName,
          itemName: '-',
          qty: 0,
          eventTime: entry.eventTime || inv.startTime,
          area: entry.area || inv.customerAddress,
          vendor: entry.vendor || inv.manager || null,
          remark: entry.remark || inv.remarks || null,
        })
      } else {
        for (const it of items) {
          byDate[dateKey].push({
            quotationNo: inv.quotationNo,
            customer: inv.customerName,
            itemName: it.particular,
            qty: it.quantity,
            eventTime: entry.eventTime || inv.startTime,
            area: entry.area || inv.customerAddress,
            vendor: entry.vendor || inv.manager || null,
            remark: entry.remark || inv.remarks || null,
          })
        }
      }
    }

    const result = Object.entries(byDate).map(([date, rows]) => ({ date, rows }))

    return NextResponse.json({ result })
  } catch (e) {
    console.error('Delivery report error', e)
    return NextResponse.json({ error: 'Failed to generate delivery report' }, { status: 500 })
  }
}



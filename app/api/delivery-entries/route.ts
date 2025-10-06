import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - list entries with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN","EMPLOYEE"].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start_date')
    const end = searchParams.get('end_date')
    const vendor = searchParams.get('vendor')
    const area = searchParams.get('area')
    const search = searchParams.get('search')

    const where: any = {}
    if (start || end) {
      where.eventDate = {}
      if (start) where.eventDate.gte = new Date(start)
      if (end) where.eventDate.lte = new Date(end)
    }
    if (vendor) where.vendor = { contains: vendor, mode: 'insensitive' }
    if (area) where.area = { contains: area, mode: 'insensitive' }

    const entries = await prisma.deliveryEntry.findMany({
      where,
      orderBy: [{ eventDate: 'asc' }, { createdAt: 'asc' }],
      include: { invoice: true }
    })

    return NextResponse.json(entries)
  } catch (e) {
    console.error('List delivery entries error', e)
    return NextResponse.json({ error: 'Failed to list delivery entries' }, { status: 500 })
  }
}

// POST - create entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN","EMPLOYEE"].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { invoiceId, eventDate, eventTime, area, vendor, remark } = body
    if (!invoiceId || !eventDate) {
      return NextResponse.json({ error: 'invoiceId and eventDate are required' }, { status: 400 })
    }
    // Ensure invoice exists
    const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const entry = await prisma.deliveryEntry.create({
      data: {
        invoiceId,
        eventDate: new Date(eventDate),
        eventTime: eventTime || null,
        area: area || null,
        vendor: vendor || null,
        remark: remark || null,
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (e) {
    console.error('Create delivery entry error', e)
    return NextResponse.json({ error: 'Failed to create delivery entry' }, { status: 500 })
  }
}













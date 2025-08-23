import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single invoice with items
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { srl: 'asc' } } },
    })

    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

// PUT update invoice and items (replace items)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerAddress,
      customerTel,
      customerState,
      customerStateCode,
      customerGSTIN,
      refName,
      bookingDate,
      eventDate,
      startTime,
      endTime,
      manager,
      advanceAmount,
      balanceAmount,
      remarks,
      totalAmount,
      cgstAmount,
      sgstAmount,
      taxableAmount,
      sacCode,
      invoiceValueInWords,
      items,
      status,
    } = body

    // Update main record
    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id: params.id },
        data: {
          customerName,
          customerAddress,
          customerTel,
          customerState,
          customerStateCode,
          customerGSTIN: customerGSTIN || null,
          refName: refName || null,
          bookingDate: new Date(bookingDate),
          eventDate: new Date(eventDate),
          startTime,
          endTime,
          manager: manager || null,
          advanceAmount: parseFloat(advanceAmount) || 0,
          balanceAmount: parseFloat(balanceAmount) || 0,
          remarks: remarks || null,
          totalAmount: parseFloat(totalAmount) || 0,
          cgstAmount: parseFloat(cgstAmount) || 0,
          sgstAmount: parseFloat(sgstAmount) || 0,
          taxableAmount: parseFloat(taxableAmount) || 0,
          sacCode: sacCode || "00440035",
          invoiceValueInWords,
          status: status === 'PAID' ? 'PAID' : status === 'PENDING' ? 'PENDING' : undefined,
        },
      })

      // Replace items
      await tx.invoiceItem.deleteMany({ where: { invoiceId: params.id } })
      if (Array.isArray(items) && items.length) {
        await tx.invoiceItem.createMany({
          data: items.map((it: any) => ({
            invoiceId: params.id,
            srl: it.srl,
            particular: it.particular,
            quantity: it.quantity,
            rent: parseFloat(it.rent),
            amount: parseFloat(it.amount),
          })),
        })
      }

      return inv
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// DELETE invoice
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } }),
      prisma.invoice.delete({ where: { id: params.id } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}


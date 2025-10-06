import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: List categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to list categories', error)
    return NextResponse.json({ error: 'Failed to list categories' }, { status: 500 })
  }
}

// POST: Create category (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const name = String(body?.name || '').trim()
    const description = body?.description ? String(body.description).trim() : null

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const created = await prisma.category.create({ data: { name, description } })
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
    }
    console.error('Failed to create category', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}








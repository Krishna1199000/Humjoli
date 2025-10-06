import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch employee attendance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM
    const year = searchParams.get('year') // Format: YYYY
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '31')
    const skip = (page - 1) * limit

    // Verify employee exists
    const employee = await prisma.enhancedEmployee.findUnique({
      where: { id: params.id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Build where clause for date filtering
    const where: any = { employeeId: params.id }

    if (month) {
      const [yearStr, monthStr] = month.split('-')
      const startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
      const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0)
      where.date = {
        gte: startDate,
        lte: endDate
      }
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1)
      const endDate = new Date(parseInt(year), 11, 31)
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const attendance = await prisma.employeeAttendance.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit
    })

    const totalCount = await prisma.employeeAttendance.count({ where })

    // Calculate attendance statistics for the period
    const stats = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'PRESENT').length,
      absentDays: attendance.filter(a => a.status === 'ABSENT').length,
      leaveDays: attendance.filter(a => a.status === 'LEAVE').length,
      halfDays: attendance.filter(a => a.status === 'HALF_DAY').length,
      attendanceRate: attendance.length > 0 
        ? Math.round((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100)
        : 0
    }

    return NextResponse.json({
      attendance,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

// POST - Add attendance entry
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { date, status, checkIn, checkOut, notes } = body

    // Validate required fields
    if (!date) {
      return NextResponse.json({ 
        error: "Date is required" 
      }, { status: 400 })
    }

    if (!status || !['PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY'].includes(status)) {
      return NextResponse.json({ 
        error: "Valid status is required (PRESENT, ABSENT, LEAVE, HALF_DAY)" 
      }, { status: 400 })
    }

    // Verify employee exists
    const employee = await prisma.enhancedEmployee.findUnique({
      where: { id: params.id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Check if attendance already exists for this date
    const existingAttendance = await prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: params.id,
          date: new Date(date)
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json({ 
        error: "Attendance for this date already exists" 
      }, { status: 400 })
    }

    // Validate check-in/check-out times for present status
    if (status === 'PRESENT' && (!checkIn || !checkOut)) {
      return NextResponse.json({ 
        error: "Check-in and check-out times are required for present status" 
      }, { status: 400 })
    }

    const attendance = await prisma.employeeAttendance.create({
      data: {
        employeeId: params.id,
        date: new Date(date),
        status,
        checkIn: checkIn ? new Date(`${date}T${checkIn}`) : null,
        checkOut: checkOut ? new Date(`${date}T${checkOut}`) : null,
        notes: notes || null
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error("Error adding attendance:", error)
    return NextResponse.json({ error: "Failed to add attendance" }, { status: 500 })
  }
}



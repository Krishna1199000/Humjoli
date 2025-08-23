import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch specific attendance record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            code: true,
            mobile: true,
            email: true
          }
        }
      }
    })

    if (!attendance) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

// PUT - Update attendance record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, checkInTime, checkOutTime, remarks } = body

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: params.id }
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    // Calculate total hours if check-in and check-out times are provided
    let totalHours: number | undefined
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(checkInTime)
      const checkOut = new Date(checkOutTime)
      totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) // Convert to hours
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: params.id },
      data: {
        status: status ?? existingAttendance.status,
        checkInTime: checkInTime ? new Date(checkInTime) : existingAttendance.checkInTime,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : existingAttendance.checkOutTime,
        totalHours,
        remarks: remarks ?? existingAttendance.remarks
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(updatedAttendance)
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}

// DELETE - Delete attendance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: params.id }
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    await prisma.attendance.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Attendance record deleted successfully" })
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 })
  }
} 
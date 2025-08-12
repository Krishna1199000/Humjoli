import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { getTodayDate } from "@/utils/employee"

const prisma = new PrismaClient()

// POST - Clock in/out for an employee
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, action } = body // action: 'clock-in' or 'clock-out'

    // Validate required fields
    if (!employeeId || !action) {
      return NextResponse.json({ 
        error: "Employee ID and action are required" 
      }, { status: 400 })
    }

    if (!['clock-in', 'clock-out'].includes(action)) {
      return NextResponse.json({ 
        error: "Action must be 'clock-in' or 'clock-out'" 
      }, { status: 400 })
    }

    // Check if employee exists and is active
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (!employee.isActive) {
      return NextResponse.json({ error: "Employee is not active" }, { status: 400 })
    }

    const today = getTodayDate()
    const now = new Date()

    // Check if attendance record exists for today
    let attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: new Date(today),
          lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (!attendance) {
      // Create new attendance record for today
      attendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(today),
          status: 'PRESENT'
        }
      })
    }

    // Perform clock in/out action
    if (action === 'clock-in') {
      if (attendance.checkInTime) {
        return NextResponse.json({ 
          error: "Employee has already clocked in today" 
        }, { status: 400 })
      }

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkInTime: now,
          status: 'PRESENT'
        },
        include: {
          employee: {
            select: {
              id: true,
              code: true,
              name: true,
              mobile: true
            }
          }
        }
      })
    } else if (action === 'clock-out') {
      if (!attendance.checkInTime) {
        return NextResponse.json({ 
          error: "Employee must clock in before clocking out" 
        }, { status: 400 })
      }

      if (attendance.checkOutTime) {
        return NextResponse.json({ 
          error: "Employee has already clocked out today" 
        }, { status: 400 })
      }

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOutTime: now
        },
        include: {
          employee: {
            select: {
              id: true,
              code: true,
              name: true,
              mobile: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      message: `Employee ${action === 'clock-in' ? 'clocked in' : 'clocked out'} successfully`,
      attendance
    })
  } catch (error) {
    console.error("Error in clock in/out:", error)
    
    // Type guard for Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ 
        error: "Attendance record already exists for this date" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to process clock in/out" }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single employee with attendance and salary history
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

    const employee = await prisma.enhancedEmployee.findUnique({
      where: { id: params.id },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 30 // Last 30 days
        },
        salaryPayments: {
          orderBy: { month: 'desc' },
          take: 12 // Last 12 months
        },
        _count: {
          select: {
            attendances: true,
            salaryPayments: true
          }
        }
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Convert salary amounts to rupees
    // Compute 31-day cycle salary status from account ledger
    const monthlySalaryRupees = employee.monthlySalary / 100
    const join = new Date(employee.joiningDate)
    const now = new Date()
    let cycleStart = new Date(join)
    let cycleEnd = new Date(cycleStart)
    cycleEnd.setDate(cycleEnd.getDate() + 31)
    while (cycleEnd <= now) {
      cycleStart = new Date(cycleEnd)
      cycleEnd = new Date(cycleStart)
      cycleEnd.setDate(cycleEnd.getDate() + 31)
    }

    const payments = await prisma.accountEntry.findMany({
      where: {
        type: 'DEBIT',
        counterParty: employee.name,
        date: { gte: cycleStart, lt: cycleEnd }
      },
      orderBy: { date: 'desc' },
      select: { id: true, date: true, amount: true }
    })
    const totalPaidPaise = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalPaid = totalPaidPaise / 100
    const dueAmount = Math.max(0, monthlySalaryRupees - totalPaid)

    const employeeWithSalary = {
      ...employee,
      monthlySalary: monthlySalaryRupees,
      salaryPayments: employee.salaryPayments.map(payment => ({
        ...payment,
        amount: payment.amount / 100
      })),
      salaryStatus: dueAmount <= 0 ? 'PAID' : (totalPaid > 0 ? 'PARTIAL' : 'DUE'),
      currentCycleStart: cycleStart,
      nextDueDate: cycleEnd,
      lastSalaryPaidDate: payments[0]?.date || null,
      cyclePaidAmount: totalPaid,
      cycleDueAmount: dueAmount,
    }

    return NextResponse.json(employeeWithSalary)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}

// PUT - Update employee
export async function PUT(
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
    const {
      name,
      email,
      phone,
      role,
      designation,
      joiningDate,
      monthlySalary,
      bankDetails,
      notes,
      avatar,
      isActive
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Employee name is required" 
      }, { status: 400 })
    }

    if (!joiningDate) {
      return NextResponse.json({ 
        error: "Joining date is required" 
      }, { status: 400 })
    }

    if (!monthlySalary || monthlySalary <= 0) {
      return NextResponse.json({ 
        error: "Valid monthly salary is required" 
      }, { status: 400 })
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format" 
      }, { status: 400 })
    }

    // Check if employee exists
    const existingEmployee = await prisma.enhancedEmployee.findUnique({
      where: { id: params.id }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Check for duplicate email (excluding current employee)
    if (email) {
      const duplicateEmployee = await prisma.enhancedEmployee.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          isActive: true,
          id: { not: params.id }
        }
      })

      if (duplicateEmployee) {
        return NextResponse.json({ 
          error: "Another employee with this email already exists" 
        }, { status: 400 })
      }
    }

    // Convert salary to paise (multiply by 100)
    const salaryInPaise = Math.round(monthlySalary * 100)

    // Update employee
    const employee = await prisma.enhancedEmployee.update({
      where: { id: params.id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        role: role || null,
        designation: designation || null,
        joiningDate: new Date(joiningDate),
        monthlySalary: salaryInPaise,
        bankDetails: bankDetails || null,
        notes: notes || null,
        avatar: avatar || null,
        isActive: isActive !== undefined ? isActive : existingEmployee.isActive
      }
    })

    return NextResponse.json({
      ...employee,
      monthlySalary: employee.monthlySalary / 100 // Convert back to rupees for response
    })
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

// DELETE - Soft delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only ADMIN can delete employees
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions. Only admins can delete employees." }, { status: 403 })
    }

    // Check if employee exists
    const existingEmployee = await prisma.enhancedEmployee.findUnique({
      where: { id: params.id }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.enhancedEmployee.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}



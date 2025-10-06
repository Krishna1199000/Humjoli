import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all employees with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to access employee data
    if (!["EMPLOYEE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } }
      ]
    }

    const employees = await prisma.enhancedEmployee.findMany({
      where,
      include: {
        _count: {
          select: {
            attendances: true,
            salaryPayments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: limit
    })

    // Convert salaries to rupees and compute salary status for current 31-day cycle
    const now = new Date()
    const employeesWithSalary = [] as any[]
    for (const employee of employees) {
      const monthlySalaryRupees = employee.monthlySalary / 100

      // Determine current 31-day cycle window from joiningDate
      const join = new Date(employee.joiningDate)
      let cycleStart = new Date(join)
      let cycleEnd = new Date(cycleStart)
      cycleEnd.setDate(cycleEnd.getDate() + 31)
      while (cycleEnd <= now) {
        cycleStart = new Date(cycleEnd)
        cycleEnd = new Date(cycleStart)
        cycleEnd.setDate(cycleEnd.getDate() + 31)
      }

      // Sum all debit payments in this cycle matching employee name
      const payments = await prisma.accountEntry.findMany({
        where: {
          type: 'DEBIT',
          counterParty: employee.name,
          date: { gte: cycleStart, lt: cycleEnd }
        },
        select: { amount: true }
      })
      const totalPaidPaise = payments.reduce((sum, p) => sum + p.amount, 0)
      const totalPaid = totalPaidPaise / 100
      const dueAmount = Math.max(0, monthlySalaryRupees - totalPaid)

      employeesWithSalary.push({
        ...employee,
        monthlySalary: monthlySalaryRupees,
        salaryStatus: dueAmount <= 0 ? 'PAID' : (totalPaid > 0 ? 'PARTIAL' : 'DUE'),
        nextDueDate: cycleEnd,
        currentCycleStart: cycleStart,
        cyclePaidAmount: totalPaid,
        cycleDueAmount: dueAmount,
      })
    }

    // Get total count for pagination
    const totalCount = await prisma.enhancedEmployee.count({ where })

    return NextResponse.json({
      employees: employeesWithSalary,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Allow EMPLOYEE and ADMIN to create employees
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
      avatar
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

    // Check for duplicate email if provided
    if (email) {
      const existingEmployee = await prisma.enhancedEmployee.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          isActive: true
        }
      })

      if (existingEmployee) {
        return NextResponse.json({ 
          error: "Employee with this email already exists" 
        }, { status: 400 })
      }
    }

    // Convert salary to paise (multiply by 100)
    const salaryInPaise = Math.round(monthlySalary * 100)

    // Create employee
    const employee = await prisma.enhancedEmployee.create({
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
      }
    })

    return NextResponse.json({
      ...employee,
      monthlySalary: employee.monthlySalary / 100 // Convert back to rupees for response
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}



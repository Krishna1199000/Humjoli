import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch all salaries with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    const where: any = {}

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (search) {
      where.OR = [
        {
          employee: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          employee: {
            code: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    const salaries = await prisma.salary.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    })

    return NextResponse.json(salaries)
  } catch (error) {
    console.error("Error fetching salaries:", error)
    return NextResponse.json({ error: "Failed to fetch salaries" }, { status: 500 })
  }
}

// POST - Create new salary record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, basicSalary, allowances = 0, deductions = 0, paymentDate } = body

    if (!employeeId || !basicSalary || !paymentDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate net salary
    const netSalary = basicSalary + allowances - deductions

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const salary = await prisma.salary.create({
      data: {
        employeeId,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        paymentDate: new Date(paymentDate)
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

    return NextResponse.json(salary, { status: 201 })
  } catch (error) {
    console.error("Error creating salary:", error)
    return NextResponse.json({ error: "Failed to create salary" }, { status: 500 })
  }
} 
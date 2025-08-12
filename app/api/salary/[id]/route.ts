import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Fetch specific salary record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const salary = await prisma.salary.findUnique({
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

    if (!salary) {
      return NextResponse.json({ error: "Salary record not found" }, { status: 404 })
    }

    return NextResponse.json(salary)
  } catch (error) {
    console.error("Error fetching salary:", error)
    return NextResponse.json({ error: "Failed to fetch salary" }, { status: 500 })
  }
}

// PUT - Update salary record
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
    const { basicSalary, allowances, deductions, paymentDate } = body

    // Check if salary exists
    const existingSalary = await prisma.salary.findUnique({
      where: { id: params.id }
    })

    if (!existingSalary) {
      return NextResponse.json({ error: "Salary record not found" }, { status: 404 })
    }

    // Calculate new net salary
    const newBasicSalary = basicSalary ?? existingSalary.basicSalary
    const newAllowances = allowances ?? existingSalary.allowances
    const newDeductions = deductions ?? existingSalary.deductions
    const netSalary = newBasicSalary + newAllowances - newDeductions

    const updatedSalary = await prisma.salary.update({
      where: { id: params.id },
      data: {
        basicSalary: newBasicSalary,
        allowances: newAllowances,
        deductions: newDeductions,
        netSalary,
        paymentDate: paymentDate ? new Date(paymentDate) : existingSalary.paymentDate
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

    return NextResponse.json(updatedSalary)
  } catch (error) {
    console.error("Error updating salary:", error)
    return NextResponse.json({ error: "Failed to update salary" }, { status: 500 })
  }
}

// DELETE - Delete salary record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if salary exists
    const existingSalary = await prisma.salary.findUnique({
      where: { id: params.id }
    })

    if (!existingSalary) {
      return NextResponse.json({ error: "Salary record not found" }, { status: 404 })
    }

    await prisma.salary.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Salary record deleted successfully" })
  } catch (error) {
    console.error("Error deleting salary:", error)
    return NextResponse.json({ error: "Failed to delete salary" }, { status: 500 })
  }
} 
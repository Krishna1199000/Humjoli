import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { validateEmployeeData } from "@/utils/employee"
import { prisma } from "@/lib/prisma"

// GET - Fetch single employee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: params.id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
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
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, mobile, address1, address2, city, pin, tel, email, contact, panAadhar, baseSalary, isActive } = body

    // Validate input
    const validation = validateEmployeeData(body)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 })
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        name,
        mobile,
        address1: address1 || null,
        address2: address2 || null,
        city: city || null,
        pin: pin || null,
        tel: tel || null,
        email: email || null,
        contact: contact || null,
        panAadhar: panAadhar || null,
        salary: parseFloat(baseSalary) || 0,
        isActive: isActive !== undefined ? isActive : true,
      }
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Error updating employee:", error)
    
    // Type guard for Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ 
        error: "Employee with this email or mobile already exists" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Delete employee
    await prisma.employee.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
} 
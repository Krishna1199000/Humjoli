import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { validateEmployeeData, generateEmployeeCode } from "@/utils/employee"
import { prisma } from "@/lib/prisma"

// GET - Fetch all employees with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const city = searchParams.get('city')

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            attendances: true,
            salaries: true
          }
        }
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
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

    // Generate employee code
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: {
        code: 'desc'
      }
    })

    const nextCode = generateEmployeeCode(lastEmployee?.code || null)

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        code: nextCode,
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

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    
    // Type guard for Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ 
        error: "Employee with this email or mobile already exists" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
} 
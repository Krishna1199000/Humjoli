import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// GET - Get next employee code
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the last employee to determine next code
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: {
        code: 'desc'
      }
    })

    let nextCode = "H00001"
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.code.substring(1))
      const nextNumber = lastNumber + 1
      nextCode = `H${nextNumber.toString().padStart(5, '0')}`
    }

    return NextResponse.json({ nextCode })
  } catch (error) {
    console.error("Error getting next code:", error)
    return NextResponse.json({ error: "Failed to get next code" }, { status: 500 })
  }
} 
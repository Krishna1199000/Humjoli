"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AdminNavbar from "@/components/AdminNavbar"
import EmployeeForm from "@/components/EmployeeForm"
import { RefreshCw } from "lucide-react"

interface Props { params: { id: string } }

export default function EditEmployeePage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/enhanced-employees/${params.id}`)
        if (!res.ok) throw new Error("Failed to fetch employee")
        const data = await res.json()
        setEmployee(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (session?.user?.id) fetchEmployee()
  }, [session, params.id])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Employee" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Employee" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Employee not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Edit Employee" />
      <main className="container mx-auto px-4 py-8">
        <EmployeeForm mode="edit" employeeId={params.id} initialData={employee} />
      </main>
    </div>
  )
}














"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AdminNavbar from "@/components/AdminNavbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RefreshCw, ArrowLeft, UserCheck, Mail, Phone, Calendar, Briefcase, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react"

interface Props {
  params: { id: string }
}

export default function EmployeeDetailsPage({ params }: Props) {
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
        <AdminNavbar title="Employee Details" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Employee Details" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Employee not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Employee Details" />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href="/admin/employees">
              <Button variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{employee.name}</h1>
          </div>
          <Link href={`/admin/employees/${employee.id}/edit`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Edit</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <UserCheck className="h-4 w-4" />
                <span>{employee.designation || "—"}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Briefcase className="h-4 w-4" />
                <span>{employee.role || "—"}</span>
              </div>
              {employee.email && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>{employee.email}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <span>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <DollarSign className="h-4 w-4" />
                <span>Monthly Salary: ₹{employee.monthlySalary.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                {employee.salaryStatus === 'PAID' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : employee.salaryStatus === 'PARTIAL' ? (
                  <Clock className="h-4 w-4 text-amber-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Current Cycle: {employee.salaryStatus || '—'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span>Paid: ₹{(employee.cyclePaidAmount || 0).toLocaleString()}</span>
                <span className="mx-1">|</span>
                <span>Due: ₹{(employee.cycleDueAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Clock className="h-4 w-4" />
                <span>Next Due: {employee.nextDueDate ? new Date(employee.nextDueDate).toLocaleDateString() : '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-line">{employee.notes || "—"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}








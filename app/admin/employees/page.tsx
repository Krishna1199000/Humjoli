"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  RefreshCw,
  Edit,
  Trash2,
  AlertCircle,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"

interface Employee {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  designation: string | null
  joiningDate: string
  monthlySalary: number
  isActive: boolean
  _count: {
    attendances: number
    salaryPayments: number
  }
  salaryStatus?: 'PAID' | 'DUE' | 'PARTIAL'
  nextDueDate?: string
  cyclePaidAmount?: number
  cycleDueAmount?: number
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)

  // Redirect if not admin/employee
  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch employees
  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
        ...(activeFilter !== null && { isActive: activeFilter.toString() })
      })

      const response = await fetch(`/api/enhanced-employees?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch employees')
      
      const data = await response.json()
      setEmployees(data.employees)
      setTotalPages(data.pagination.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchEmployees()
    }
  }, [session, searchTerm, activeFilter])

  // Handle employee deletion
  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      setIsDeleting(employeeId)
      const response = await fetch(`/api/enhanced-employees/${employeeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete employee')
      }

      toast.success('Employee deleted successfully')
      fetchEmployees(currentPage)
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete employee')
    } finally {
      setIsDeleting(null)
    }
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Employee Management" />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
                Employee Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage employees, attendance, and payroll
              </p>
            </div>
            <Link href="/admin/employees/new">
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="mr-2 h-5 w-5" />
                Add New Employee
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search employees by name, email, or designation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                    />
                  </div>
                </div>

                <select
                  value={activeFilter === null ? 'all' : activeFilter.toString()}
                  onChange={(e) => setActiveFilter(e.target.value === 'all' ? null : e.target.value === 'true')}
                  className="h-10 rounded-lg border border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                >
                  <option value="all">All Employees</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>

                <Button
                  onClick={() => fetchEmployees(1)}
                  className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Employees Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No employees found</p>
              <p className="text-gray-500">Add a new employee to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card className={`bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 ${
                    !employee.isActive && 'opacity-75'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <UserCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {employee.name}
                            </h3>
                            {employee.designation && (
                              <p className="text-gray-600 text-sm">
                                {employee.designation}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={employee.isActive 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                        }>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {employee.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="text-sm">{employee.phone}</span>
                          </div>
                        )}
                        {employee.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{employee.email}</span>
                          </div>
                        )}
                        {employee.role && (
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="h-4 w-4 mr-2" />
                            <span className="text-sm">{employee.role}</span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            Joined: {new Date(employee.joiningDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-600 font-medium">Salary</p>
                          <p className="text-lg font-bold text-purple-700">
                            ₹{employee.monthlySalary.toLocaleString()}
                          </p>
                          <p className="text-xs text-purple-500">Monthly</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Salary Status</p>
                          <p className={`text-lg font-bold ${employee.salaryStatus === 'PAID' ? 'text-green-700' : employee.salaryStatus === 'PARTIAL' ? 'text-amber-700' : 'text-red-700'}`}>
                            {employee.salaryStatus || '—'}
                          </p>
                          <p className="text-xs text-blue-500">Paid: ₹{(employee.cyclePaidAmount ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-blue-500">Due: ₹{(employee.cycleDueAmount ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-blue-500">Next due: {employee.nextDueDate ? new Date(employee.nextDueDate).toLocaleDateString('en-IN') : '—'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/employees/${employee.id}`} className="flex-1">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/employees/${employee.id}/edit`}>
                          <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            disabled={isDeleting === employee.id}
                          >
                            {isDeleting === employee.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => fetchEmployees(page)}
                  variant={page === currentPage ? "default" : "outline"}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-200
                    ${page === currentPage 
                      ? "bg-purple-600 text-white" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                    }
                  `}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}











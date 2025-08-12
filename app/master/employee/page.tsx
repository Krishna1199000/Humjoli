"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Clock,
  ArrowLeft,
  LogOut,
  User,
  Plus,
  MoreHorizontal,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Employee, EmployeeFilters } from "@/types/employee"
import { formatCurrency, formatDate, getAttendanceStatusColor } from "@/utils/employee"

export default function EmployeeManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<EmployeeFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch employees
  useEffect(() => {
    fetchEmployees()
  }, [filters])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters.city) params.append('city', filters.city)

      const response = await fetch(`/api/employees?${params}`)
      if (!response.ok) throw new Error('Failed to fetch employees')
      
      const data = await response.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleFilterChange = (key: keyof EmployeeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete employee')

      toast.success('Employee deleted successfully')
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Failed to delete employee')
    }
  }

  const filteredEmployees = employees.filter(employee => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        employee.name.toLowerCase().includes(searchLower) ||
        employee.code.toLowerCase().includes(searchLower) ||
        employee.mobile.includes(searchTerm) ||
        (employee.email && employee.email.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-serif font-bold text-purple-600"
              >
                Employee Management
              </motion.div>
              <Badge className="bg-red-100 text-red-600">Administrator</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 bg-transparent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
                Employee Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your employees, track attendance, and process salaries
              </p>
            </div>
            <Link href="/master/employee/add">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="mr-2 h-5 w-5" />
                Add Employee
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{employees.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Employees</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {employees.filter(e => e.isActive).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-50">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Attendance Today</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">-</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Salary</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {formatCurrency(employees.reduce((sum, e) => sum + e.baseSalary, 0))}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-50">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search employees by name, code, mobile, or email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
                
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="border border-purple-300 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md transition-colors duration-200"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-purple-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filters.isActive?.toString() || ""}
                        onChange={(e) => handleFilterChange('isActive', e.target.value === "" ? undefined : e.target.value === "true")}
                        className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring-purple-400"
                      >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        placeholder="Filter by city..."
                        value={filters.city || ""}
                        onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Employee List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Employees ({filteredEmployees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-purple-600 text-lg">Loading employees...</div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No employees found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Base Salary</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee, index) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 * index }}
                          className="border-b border-purple-100 hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-semibold text-gray-800">{employee.name}</div>
                              <div className="text-sm text-gray-600">{employee.code}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-gray-800">{employee.mobile}</div>
                              {employee.email && (
                                <div className="text-sm text-gray-600">{employee.email}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-800">
                              {formatCurrency(employee.baseSalary)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={`${
                                employee.isActive
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Link href={`/master/employee/${employee.id}`}>
                                <Button
                                  className="border border-purple-300 text-purple-600 hover:bg-purple-50 px-2 py-1 rounded-md transition-colors duration-200"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              <Link href={`/master/employee/${employee.id}/edit`}>
                                <Button
                                  className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors duration-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              <Link href={`/master/employee/${employee.id}/attendance`}>
                                <Button
                                  className="border border-green-300 text-green-600 hover:bg-green-50 px-2 py-1 rounded-md transition-colors duration-200"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              <Button
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="border border-red-300 text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/master">
            <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Master
            </Button>
          </Link>
          
          <Link href="/master/employee/attendance">
            <Button className="bg-white border-2 border-green-300 text-green-600 hover:bg-green-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
              <Clock className="mr-2 h-5 w-5" />
              Attendance Management
            </Button>
          </Link>
          
          <Link href="/master/employee/salary">
            <Button className="bg-white border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
              <DollarSign className="mr-2 h-5 w-5" />
              Salary Management
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ArrowLeft,
  LogOut,
  User,
  Filter,
  Download,
  TrendingUp,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Salary, SalaryFilters } from "@/types/salary"
import { Employee } from "@/types/employee"

export default function SalaryManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<SalaryFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [formData, setFormData] = useState({
    basicSalary: "",
    allowances: "",
    deductions: "",
    paymentDate: ""
  })

  // Redirect if not admin
  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch salaries and employees
  useEffect(() => {
    fetchSalaries()
    fetchEmployees()
  }, [filters])

  const fetchSalaries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.employeeId) params.append('employeeId', filters.employeeId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/salary?${params}`)
      if (!response.ok) throw new Error('Failed to fetch salaries')
      
      const data = await response.json()
      setSalaries(data)
    } catch (error) {
      console.error('Error fetching salaries:', error)
      toast.error('Failed to fetch salaries')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (!response.ok) throw new Error('Failed to fetch employees')
      
      const data = await response.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleFilterChange = (key: keyof SalaryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEmployee || !formData.basicSalary || !formData.paymentDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          basicSalary: parseFloat(formData.basicSalary),
          allowances: parseFloat(formData.allowances) || 0,
          deductions: parseFloat(formData.deductions) || 0,
          paymentDate: formData.paymentDate
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create salary')
      }

      toast.success('Salary record created successfully')
      setShowAddModal(false)
      setFormData({
        basicSalary: "",
        allowances: "",
        deductions: "",
        paymentDate: ""
      })
      setSelectedEmployee("")
      fetchSalaries()
    } catch (error) {
      console.error('Error creating salary:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create salary')
    }
  }

  const handleDeleteSalary = async (salaryId: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return

    try {
      const response = await fetch(`/api/salary/${salaryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete salary')

      toast.success('Salary record deleted successfully')
      fetchSalaries()
    } catch (error) {
      console.error('Error deleting salary:', error)
      toast.error('Failed to delete salary')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN')
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    return employee ? `${employee.name} (${employee.code})` : 'Unknown Employee'
  }

  const totalSalaryPaid = salaries.reduce((sum, salary) => sum + salary.netSalary, 0)
  const averageSalary = salaries.length > 0 ? totalSalaryPaid / salaries.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/master/employee">
                <Button className="text-purple-600 hover:bg-purple-50 bg-transparent p-2 rounded-lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Employees
                </Button>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-serif font-bold text-purple-600"
              >
                Salary Management
              </motion.div>
              <Badge className="bg-green-100 text-green-600">
                <DollarSign className="mr-1 h-3 w-3" />
                Payroll
              </Badge>
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
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
              Employee Salary Management
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and track employee salaries, allowances, and deductions
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Salary Paid</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSalaryPaid)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Salary</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(averageSalary)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{salaries.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
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
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Search */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by employee name or code..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className="border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white px-4 py-2 rounded-lg"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Salary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="lg:col-span-2">
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee">Employee</Label>
                      <select
                        id="employee"
                        value={filters.employeeId || ""}
                        onChange={(e) => handleFilterChange('employeeId', e.target.value || undefined)}
                        className="w-full p-2 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                      >
                        <option value="">All Employees</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} ({employee.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        type="date"
                        id="startDate"
                        value={filters.startDate || ""}
                        onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        type="date"
                        id="endDate"
                        value={filters.endDate || ""}
                        onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => setFilters({})}
                        className="w-full border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white px-4 py-2 rounded-lg"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Salary Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="text-purple-600 text-lg">Loading salary records...</div>
            </div>
          ) : salaries.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No salary records found</p>
              <p className="text-gray-500">Add a new salary record to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {salaries.map((salary, index) => (
                <motion.div
                  key={salary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {getEmployeeName(salary.employeeId)}
                            </h3>
                            <Badge className="bg-green-100 text-green-600">
                              {formatDate(salary.paymentDate)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Basic Salary</p>
                              <p className="font-semibold text-gray-800">{formatCurrency(salary.basicSalary)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Allowances</p>
                              <p className="font-semibold text-green-600">+{formatCurrency(salary.allowances)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Deductions</p>
                              <p className="font-semibold text-red-600">-{formatCurrency(salary.deductions)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Net Salary</p>
                              <p className="font-bold text-lg text-purple-600">{formatCurrency(salary.netSalary)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleDeleteSalary(salary.id)}
                            className="text-red-600 hover:bg-red-50 bg-transparent p-2 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Salary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Salary Record</h2>
            <form onSubmit={handleAddSalary} className="space-y-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select
                  id="employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full p-2 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="basicSalary">Basic Salary *</Label>
                <Input
                  type="number"
                  id="basicSalary"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, basicSalary: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="allowances">Allowances</Label>
                <Input
                  type="number"
                  id="allowances"
                  value={formData.allowances}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowances: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="deductions">Deductions</Label>
                <Input
                  type="number"
                  id="deductions"
                  value={formData.deductions}
                  onChange={(e) => setFormData(prev => ({ ...prev, deductions: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  type="date"
                  id="paymentDate"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                >
                  Add Salary
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
} 
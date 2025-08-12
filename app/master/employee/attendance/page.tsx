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
  Clock,
  Search,
  Plus,
  Trash2,
  Calendar,
  ArrowLeft,
  LogOut,
  User,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Attendance, AttendanceFilters, AttendanceStatus } from "@/types/attendance"
import { Employee } from "@/types/employee"

export default function AttendanceTrackingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<AttendanceFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [formData, setFormData] = useState({
    date: "",
    status: "PRESENT" as AttendanceStatus,
    checkInTime: "",
    checkOutTime: "",
    remarks: ""
  })

  // Redirect if not admin
  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch attendances and employees
  useEffect(() => {
    fetchAttendances()
    fetchEmployees()
  }, [filters])

  const fetchAttendances = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.employeeId) params.append('employeeId', filters.employeeId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/attendance?${params}`)
      if (!response.ok) throw new Error('Failed to fetch attendance')
      
      const data = await response.json()
      setAttendances(data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Failed to fetch attendance')
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

  const handleFilterChange = (key: keyof AttendanceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEmployee || !formData.date || !formData.status) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          date: formData.date,
          status: formData.status,
          checkInTime: formData.checkInTime || undefined,
          checkOutTime: formData.checkOutTime || undefined,
          remarks: formData.remarks || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create attendance')
      }

      toast.success('Attendance record created successfully')
      setShowAddModal(false)
      setFormData({
        date: "",
        status: "PRESENT",
        checkInTime: "",
        checkOutTime: "",
        remarks: ""
      })
      setSelectedEmployee("")
      fetchAttendances()
    } catch (error) {
      console.error('Error creating attendance:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create attendance')
    }
  }

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return

    try {
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete attendance')

      toast.success('Attendance record deleted successfully')
      fetchAttendances()
    } catch (error) {
      console.error('Error deleting attendance:', error)
      toast.error('Failed to delete attendance')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN')
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    return employee ? `${employee.name} (${employee.code})` : 'Unknown Employee'
  }

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-600'
      case 'ABSENT':
        return 'bg-red-100 text-red-600'
      case 'LEAVE':
        return 'bg-yellow-100 text-yellow-600'
      case 'HALF_DAY':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4" />
      case 'ABSENT':
        return <XCircle className="h-4 w-4" />
      case 'LEAVE':
        return <AlertCircle className="h-4 w-4" />
      case 'HALF_DAY':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalRecords = attendances.length
  const presentCount = attendances.filter(a => a.status === 'PRESENT').length
  const absentCount = attendances.filter(a => a.status === 'ABSENT').length
  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0

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
                Attendance Tracking
              </motion.div>
              <Badge className="bg-blue-100 text-blue-600">
                <Clock className="mr-1 h-3 w-3" />
                Time Tracking
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
              Employee Attendance Tracking
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor and manage daily employee attendance records
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
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{totalRecords}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{attendanceRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Add Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
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
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="text-purple-600 text-lg">Loading attendance records...</div>
            </div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No attendance records found</p>
              <p className="text-gray-500">Add a new attendance record to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {attendances.map((attendance, index) => (
                <motion.div
                  key={attendance.id}
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
                              {getEmployeeName(attendance.employeeId)}
                            </h3>
                            <Badge className={getStatusColor(attendance.status)}>
                              {getStatusIcon(attendance.status)}
                              <span className="ml-1">{attendance.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-600">
                              {formatDate(attendance.date)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Check In</p>
                              <p className="font-semibold text-gray-800">
                                {attendance.checkInTime ? formatTime(attendance.checkInTime) : 'Not recorded'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Check Out</p>
                              <p className="font-semibold text-gray-800">
                                {attendance.checkOutTime ? formatTime(attendance.checkOutTime) : 'Not recorded'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total Hours</p>
                              <p className="font-semibold text-gray-800">
                                {attendance.totalHours ? `${attendance.totalHours.toFixed(2)} hrs` : 'Not calculated'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleDeleteAttendance(attendance.id)}
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

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Attendance Record</h2>
            <form onSubmit={handleAddAttendance} className="space-y-4">
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
                <Label htmlFor="date">Date *</Label>
                <Input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AttendanceStatus }))}
                  className="w-full p-2 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
                  required
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>
              <div>
                <Label htmlFor="checkInTime">Check In Time</Label>
                <Input
                  type="datetime-local"
                  id="checkInTime"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="checkOutTime">Check Out Time</Label>
                <Input
                  type="datetime-local"
                  id="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  type="text"
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Optional remarks..."
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
                  Add Attendance
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
} 
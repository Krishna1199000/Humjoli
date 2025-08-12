"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Users,
  CreditCard,
  Package,
  User,
  Settings,
  BarChart3,
  Calendar,
  Bell,
  Building,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalInventory: 0,
    totalCustomers: 0,
    totalSalaries: 0,
    totalAttendance: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [
        usersResponse,
        employeesResponse,
        inventoryResponse,
        customersResponse,
        salariesResponse,
        attendanceResponse
      ] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/employees'),
        fetch('/api/inventory'),
        fetch('/api/customers'),
        fetch('/api/salary'),
        fetch('/api/attendance')
      ])

      const users = usersResponse.ok ? await usersResponse.json() : []
      const employees = employeesResponse.ok ? await employeesResponse.json() : []
      const inventory = inventoryResponse.ok ? await inventoryResponse.json() : []
      const customers = customersResponse.ok ? await customersResponse.json() : []
      const salaries = salariesResponse.ok ? await salariesResponse.json() : []
      const attendance = attendanceResponse.ok ? await attendanceResponse.json() : []

      // Get recent users (last 5)
      const recentUsersData = users.slice(0, 5).map((user: any) => ({
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email,
        role: user.role,
        status: user.role === 'ADMIN' ? 'Admin' : 'Active',
        joined: new Date(user.createdAt).toLocaleDateString('en-IN')
      }))

      setStats({
        totalUsers: users.length,
        totalEmployees: employees.length,
        totalInventory: inventory.length,
        totalCustomers: customers.customers?.length || 0,
        totalSalaries: salaries.length,
        totalAttendance: attendance.length
      })
      setRecentUsers(recentUsersData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard data - moved before conditional return
  useEffect(() => {
    if (session?.user?.id && session?.user?.role === "ADMIN") {
      fetchDashboardData()
    }
  }, [session])

  // Redirect if not admin - moved after all hooks
  if (!mounted || session?.user?.role !== "ADMIN") {
    if (mounted && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
    return null
  }

  const dashboardStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/users"
    },
    {
      title: "Employees",
      value: stats.totalEmployees.toString(),
      icon: User,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/master/employee"
    },
    {
      title: "Inventory Items",
      value: stats.totalInventory.toString(),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/admin/inventory"
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      icon: Building,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/master/customer"
    },
    {
      title: "Salary Records",
      value: stats.totalSalaries.toString(),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/master/employee/salary"
    },
    {
      title: "Attendance Records",
      value: stats.totalAttendance.toString(),
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      href: "/master/employee/attendance"
    },
  ]

  const navItems = [
    {
      title: "Manage Users",
      icon: Users,
      href: "/admin/users",
      description: "View and manage user accounts",
    },
    {
      title: "Employee Management",
      icon: User,
      href: "/master/employee",
      description: "Manage employee information and records",
    },
    {
      title: "Inventory Management",
      icon: Package,
      href: "/admin/inventory",
      description: "Manage wedding supplies and equipment",
    },
    {
      title: "Customer Management",
      icon: Building,
      href: "/master/customer",
      description: "Manage customer information",
    },
    {
      title: "Salary Management",
      icon: DollarSign,
      href: "/master/employee/salary",
      description: "Manage employee salaries and payroll",
    },
    {
      title: "Attendance Tracking",
      icon: Clock,
      href: "/master/employee/attendance",
      description: "Track employee attendance and time",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <AdminNavbar title="Humjoli Admin" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's an overview of your Humjoli management system.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? "..." : stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    <Link href={item.href}>
                      <Card className="bg-white/50 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                              <item.icon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-purple-600 text-lg">Loading recent users...</div>
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user: any, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={user.status === 'Admin' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}>
                          {user.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{user.joined}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
              ← Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
} 
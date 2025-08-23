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
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  ShoppingCart,
  UserCheck,
  UserX,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"

interface DashboardStats {
  totalUsers: number
  totalEmployees: number
  totalInventory: number
  totalCustomers: number
  totalSalaries: number
  totalAttendance: number
  totalInvoices: number
  recentGrowth: number
}

interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  joined: string
}

interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  color: string
  bgColor: string
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEmployees: 0,
    totalInventory: 0,
    totalCustomers: 0,
    totalSalaries: 0,
    totalAttendance: 0,
    totalInvoices: 0,
    recentGrowth: 0,
  })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [mounted, setMounted] = useState(false)
  const errorToastIdRef = useRef<string | null>(null)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  const quickActions: QuickAction[] = [
    {
      title: "Generate Invoice",
      description: "Create new invoice for events",
      icon: FileText,
      href: "/admin/billing#generate",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      href: "/admin/users",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Inventory",
      description: "Manage event supplies and items",
      icon: Package,
      href: "/admin/inventory",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "View Invoices",
      description: "Browse all generated invoices",
      icon: ShoppingCart,
      href: "/admin/billing#invoices",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit, timeoutMs = 8000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(input, { ...init, signal: controller.signal })
      return res
    } finally {
      clearTimeout(timer)
    }
  }

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
        attendanceResponse,
        invoicesResponse
      ] = await Promise.all([
        fetchWithTimeout('/api/auth/users'),
        fetchWithTimeout('/api/employees'),
        fetchWithTimeout('/api/inventory'),
        fetchWithTimeout('/api/customers'),
        fetchWithTimeout('/api/salary'),
        fetchWithTimeout('/api/attendance'),
        fetchWithTimeout('/api/invoices')
      ])

      const users = usersResponse.ok ? await usersResponse.json() : []
      const employees = employeesResponse.ok ? await employeesResponse.json() : []
      const inventory = inventoryResponse.ok ? await inventoryResponse.json() : []
      const customers = customersResponse.ok ? await customersResponse.json() : []
      const salaries = salariesResponse.ok ? await salariesResponse.json() : []
      const attendance = attendanceResponse.ok ? await attendanceResponse.json() : []
      const invoices = invoicesResponse.ok ? await invoicesResponse.json() : []

      // Get recent users (last 5)
      const recentUsersData = users.slice(0, 5).map((user: any) => ({
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email,
        role: user.role,
        status: user.role === 'ADMIN' ? 'Admin' : 'Active',
        joined: new Date(user.createdAt).toLocaleDateString('en-IN')
      }))

      // Calculate growth (mock data for now)
      const recentGrowth = Math.floor(Math.random() * 20) + 5

      setStats({
        totalUsers: users.length,
        totalEmployees: employees.length,
        totalInventory: inventory.length,
        totalCustomers: customers.customers?.length || 0,
        totalSalaries: salaries.length,
        totalAttendance: attendance.length,
        totalInvoices: invoices.length || 0,
        recentGrowth,
      })
      setRecentUsers(recentUsersData)
    } catch (error) {
      // Avoid sticky toasts; auto-dismiss after 5s
      if (!errorToastIdRef.current) {
        const id = toast.error('Failed to load dashboard data', { duration: 4000 })
        errorToastIdRef.current = id as unknown as string
        setTimeout(() => {
          if (errorToastIdRef.current) {
            toast.dismiss(errorToastIdRef.current)
            errorToastIdRef.current = null
          }
        }, 5000)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchDashboardData()
    }
    return () => {
      if (errorToastIdRef.current) {
        toast.dismiss(errorToastIdRef.current)
        errorToastIdRef.current = null
      }
    }
  }, [mounted])

  // Check if user is admin
  if (mounted && session?.user?.role !== "ADMIN") {
    router.push("/")
    return null
  }

  if (!mounted) {
    return null
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Employees",
      value: stats.totalEmployees,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Inventory Items",
      value: stats.totalInventory,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      trend: "+23%",
      trendUp: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <AdminNavbar title="Admin Dashboard" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                <Activity className="h-3 w-3 mr-1" />
                System Online
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="card-modern hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {loading ? (
                          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        ) : (
                          stat.value.toLocaleString()
                        )}
                      </p>
                      <div className="flex items-center mt-2">
                        {stat.trendUp ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.trendUp ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.trend}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">from last month</span>
                      </div>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="card-modern h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <Link href={action.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-4 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className={`h-10 w-10 rounded-lg ${action.bgColor} flex items-center justify-center mr-3`}>
                            <action.icon className={`h-5 w-5 ${action.color}`} />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {action.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>Recent Users</span>
                  </div>
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          }>
                            {user.role}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {user.joined}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      stats.totalCustomers.toLocaleString()
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                  <Building className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Salaries
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      stats.totalSalaries.toLocaleString()
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Attendance Records
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      stats.totalAttendance.toLocaleString()
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 
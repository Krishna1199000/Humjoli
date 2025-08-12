"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserPlus,
  Building,
  ArrowLeft,
  LogOut,
  User,
  Settings,
  Calendar,
  DollarSign,
  Clock,
  Package,
  CreditCard,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function MasterPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not admin
  if (!mounted || session?.user?.role !== "ADMIN") {
    if (mounted && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
    return null
  }

  const masterSections = [
    {
      title: "Employee Master",
      description: "Manage employee information, attendance, and salary",
      icon: Users,
      href: "/master/employee",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      features: ["Employee Registration", "Attendance Management", "Salary Processing"]
    },
    {
      title: "Customer Master",
      description: "Manage customer information and relationships",
      icon: UserPlus,
      href: "/master/customer",
      color: "text-green-600",
      bgColor: "bg-green-50",
      features: ["Customer Registration", "Contact Management", "Service History"]
    },
    {
      title: "Salary Management",
      description: "Manage employee salaries and payroll processing",
      icon: DollarSign,
      href: "/master/employee/salary",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      features: ["Salary Records", "Allowances & Deductions", "Payment Tracking"]
    },
    {
      title: "Attendance Tracking",
      description: "Track employee attendance and working hours",
      icon: Clock,
      href: "/master/employee/attendance",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      features: ["Daily Attendance", "Time Tracking", "Attendance Reports"]
    },
    {
      title: "Inventory Management",
      description: "Manage wedding supplies and equipment inventory",
      icon: Package,
      href: "/admin/inventory",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      features: ["Item Management", "Stock Tracking", "Category Management"]
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Simple Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-xl font-serif font-bold text-purple-600"
              >
                Humjoli Master
              </motion.div>
              <Badge className="bg-red-100 text-red-600">Administrator</Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/admin/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300">
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/admin/inventory">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300">
                  <Package className="mr-2 h-4 w-4" />
                  Inventory
                </Button>
              </Link>
              
              <Link href="/admin/billing">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Button>
              </Link>
              
              <Link href="/admin/users">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
            Master Management System
          </h1>
          <p className="text-gray-600 text-lg">
            Manage employees, customers, and business operations from one central location.
          </p>
        </motion.div>

        {/* Master Sections Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {masterSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Link href={section.href}>
                <Card className="h-full bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 ${section.bgColor} rounded-full mb-4 group-hover:shadow-lg transition-shadow`}>
                        <section.icon className={`h-8 w-8 ${section.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {section.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {section.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-purple-100">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Access {section.title}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Employee Management</h4>
                  <p className="text-sm text-gray-600">Complete employee lifecycle management</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Customer Management</h4>
                  <p className="text-sm text-gray-600">Customer relationship and data management</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Salary Processing</h4>
                  <p className="text-sm text-gray-600">Automated salary calculation and tracking</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Attendance Tracking</h4>
                  <p className="text-sm text-gray-600">Real-time attendance and time tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 text-center"
        >
          <Link href="/admin/dashboard">
            <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
              ← Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
} 
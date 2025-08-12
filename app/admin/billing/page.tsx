"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Plus,
  Calendar,
  Receipt,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import AdminNavbar from "@/components/AdminNavbar"
import Link from "next/link"

export default function BillingPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <AdminNavbar title="Billing Management" />

      {/* Main Content */}
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
                Billing Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage invoices, payments, and billing operations
              </p>
            </div>
            <Button
              className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Invoice
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">₹0</p>
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
                  <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Receipt className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-800">₹0</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Billing Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/50 rounded-lg border border-purple-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                    <Receipt className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Invoice Management</h3>
                  <p className="text-sm text-gray-600">Create and manage customer invoices</p>
                </div>
                
                <div className="text-center p-6 bg-white/50 rounded-lg border border-purple-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Payment Tracking</h3>
                  <p className="text-sm text-gray-600">Track payments and payment status</p>
                </div>
                
                <div className="text-center p-6 bg-white/50 rounded-lg border border-purple-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Revenue Reports</h3>
                  <p className="text-sm text-gray-600">Generate revenue and financial reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
                Billing System Coming Soon!
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                We're working on a comprehensive billing and invoicing system. 
                This will include invoice creation, payment tracking, and financial reporting.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/admin/dashboard">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/master">
                  <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    Go to Master
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 
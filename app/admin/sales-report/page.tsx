"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

interface SalesData {
  totalSales: number
  totalPurchases: number
  netIncome: number
  topCustomers: Array<{
    id: string
    displayName: string
    totalAmount: number
    invoiceCount: number
  }>
  topVendors: Array<{
    id: string
    businessName: string
    totalAmount: number
    purchaseCount: number
  }>
  monthlySales: Array<{
    month: string
    sales: number
    purchases: number
  }>
  productPerformance: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

export default function SalesReportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SalesData | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // Redirect if not admin/employee
  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch report data
  const fetchReport = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      })

      const response = await fetch(`/api/sales-report?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch report')
      
      const reportData = await response.json()
      setData(reportData)
    } catch (error) {
      console.error('Error fetching report:', error)
      toast.error('Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchReport()
    }
  }, [session])

  // Handle report download
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/sales-report/download?start_date=${dateRange.start}&end_date=${dateRange.end}`)
      if (!response.ok) throw new Error('Failed to download report')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-report-${dateRange.start}-to-${dateRange.end}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Sales Report" />

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
                Sales Report
              </h1>
              <p className="text-gray-600 text-lg">
                Analyze sales performance and trends
              </p>
            </div>
            <Button
              onClick={handleDownload}
              className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Report
            </Button>
          </div>
        </motion.div>

        {/* Date Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                />

                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                />

                <Button
                  onClick={fetchReport}
                  className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Update Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Generating report...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No data available</p>
            <p className="text-gray-500">Try adjusting the date range</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-green-600 font-medium">Total Sales</h3>
                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{(data.totalSales / 100).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              {/* Purchases card removed for sales-only report */}

              <Card className={data.netIncome >= 0 ? "bg-blue-50" : "bg-amber-50"}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={data.netIncome >= 0 ? "text-blue-600" : "text-amber-600"}>
                      Net Income
                    </h3>
                    <DollarSign className={`h-5 w-5 ${
                      data.netIncome >= 0 ? "text-blue-500" : "text-amber-500"
                    }`} />
                  </div>
                  <p className={`text-2xl font-bold ${
                    data.netIncome >= 0 ? "text-blue-700" : "text-amber-700"
                  }`}>
                    ₹{(Math.abs(data.netIncome) / 100).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Monthly Trends</h3>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                    <Legend />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          name="Sales"
                          stroke="#22c55e"
                          strokeWidth={2}
                        />
                    {/* Purchases line removed */}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Product Performance</h3>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.productPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#22c55e" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6366f1" />
                        <Tooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="quantity"
                          name="Quantity Sold"
                          fill="#22c55e"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="revenue"
                          name="Revenue"
                          fill="#6366f1"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Customers */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              {/* Top Customers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
                    </div>
                    <div className="space-y-4">
                      {data.topCustomers.map((customer, index) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{customer.displayName}</p>
                            <p className="text-sm text-gray-500">{customer.invoiceCount} invoices</p>
                          </div>
                          <p className="text-lg font-semibold text-green-600">
                            ₹{(customer.totalAmount / 100).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
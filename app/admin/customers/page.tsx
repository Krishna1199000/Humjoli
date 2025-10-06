"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  User,
  Search,
  Plus,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  RefreshCw,
  Edit,
  Trash2,
  Receipt,
  DollarSign,
  MapPin,
  Tags,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"

interface Customer {
  id: string
  displayName: string
  fullLegalName: string | null
  email: string | null
  phone: string
  billingAddress: string | null
  shippingAddress: string | null
  gstin: string | null
  defaultPaymentTerms: string | null
  preferredContact: string | null
  notes: string | null
  tags: string | null
  isActive: boolean
  totalInvoices: number
  totalAmount: number
  _count: {
    invoices: number
  }
}

export default function CustomersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
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

  // Fetch customers
  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
        ...(activeFilter !== null && { isActive: activeFilter.toString() })
      })

      const response = await fetch(`/api/enhanced-customers?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch customers')
      
      const data = await response.json()
      setCustomers(data.customers)
      setTotalPages(data.pagination.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchCustomers()
    }
  }, [session, searchTerm, activeFilter])

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      setIsDeleting(customerId)
      const response = await fetch(`/api/enhanced-customers/${customerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete customer')
      }

      toast.success('Customer deleted successfully')
      fetchCustomers(currentPage)
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete customer')
    } finally {
      setIsDeleting(null)
    }
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Customer Management" />

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
                Customer Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage customers, invoices, and sales
              </p>
            </div>
            <Link href="/admin/customers/new">
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="mr-2 h-5 w-5" />
                Add New Customer
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
                      placeholder="Search customers by name, email, or phone..."
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
                  <option value="all">All Customers</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>

                <Button
                  onClick={() => fetchCustomers(1)}
                  className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No customers found</p>
              <p className="text-gray-500">Add a new customer to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card className={`bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 ${
                    !customer.isActive && 'opacity-75'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {customer.displayName}
                            </h3>
                            {customer.fullLegalName && (
                              <p className="text-gray-600 text-sm">
                                {customer.fullLegalName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={customer.isActive 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                        }>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {customer.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                        )}
                        {customer.gstin && (
                          <div className="flex items-center text-gray-600">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="text-sm">GSTIN: {customer.gstin}</span>
                          </div>
                        )}
                        {customer.billingAddress && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{customer.billingAddress}</span>
                          </div>
                        )}
                        {customer.tags && (
                          <div className="flex items-center text-gray-600">
                            <Tags className="h-4 w-4 mr-2" />
                            <div className="flex flex-wrap gap-1">
                              {customer.tags.split(',').map((tag, i) => (
                                <Badge key={i} className="bg-purple-100 text-purple-600 text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-purple-600 font-medium">Invoices</p>
                            <Receipt className="h-4 w-4 text-purple-500" />
                          </div>
                          <p className="text-lg font-bold text-purple-700">
                            {customer._count.invoices}
                          </p>
                          <p className="text-xs text-purple-500">Total Records</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-blue-600 font-medium">Sales</p>
                            <DollarSign className="h-4 w-4 text-blue-500" />
                          </div>
                          <p className="text-lg font-bold text-blue-700">
                            ₹{(customer.totalAmount / 100).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-500">Total Value</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/customers/${customer.id}`} className="flex-1">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/customers/${customer.id}/edit`}>
                          <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            disabled={isDeleting === customer.id}
                          >
                            {isDeleting === customer.id ? (
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
                  onClick={() => fetchCustomers(page)}
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
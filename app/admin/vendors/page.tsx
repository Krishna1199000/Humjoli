"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Building,
  Search,
  Plus,
  Phone,
  Mail,
  FileText,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"

interface Vendor {
  id: string
  businessName: string
  contactName: string | null
  phone: string | null
  email: string | null
  gstin: string | null
  balance: number
  totalPurchases: number
  totalPayments: number
  _count: {
    purchases: number
    payments: number
  }
}

export default function VendorsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Redirect if not admin/employee
  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch vendors
  const fetchVendors = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/vendors?page=${page}&search=${encodeURIComponent(searchTerm)}`
      )
      if (!response.ok) throw new Error('Failed to fetch vendors')
      
      const data = await response.json()
      setVendors(data.vendors)
      setTotalPages(data.pagination.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to fetch vendors')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchVendors()
    }
  }, [session, searchTerm])

  // Handle vendor deletion
  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return

    try {
      setIsDeleting(vendorId)
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete vendor')

      toast.success('Vendor deleted successfully')
      fetchVendors(currentPage)
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error('Failed to delete vendor')
    } finally {
      setIsDeleting(null)
    }
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Vendor Management" />

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
                Vendor Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your suppliers and track purchases & payments
              </p>
            </div>
            <Link href="/admin/vendors/new">
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="mr-2 h-5 w-5" />
                Add New Vendor
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
                      placeholder="Search vendors by name, contact, or GSTIN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => fetchVendors(1)}
                  className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vendors Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No vendors found</p>
              <p className="text-gray-500">Add a new vendor to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {vendor.businessName}
                            </h3>
                            {vendor.contactName && (
                              <p className="text-gray-600 text-sm">
                                Contact: {vendor.contactName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {vendor.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="text-sm">{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{vendor.email}</span>
                          </div>
                        )}
                        {vendor.gstin && (
                          <div className="flex items-center text-gray-600">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="text-sm">GSTIN: {vendor.gstin}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Purchases</p>
                          <p className="text-lg font-bold text-green-700">
                            ₹{(vendor.totalPurchases / 100).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-500">
                            {vendor._count.purchases} transactions
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Payments</p>
                          <p className="text-lg font-bold text-blue-700">
                            ₹{(vendor.totalPayments / 100).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-500">
                            {vendor._count.payments} transactions
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Balance</p>
                            <p className={`text-lg font-bold ${
                              vendor.balance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ₹{(Math.abs(vendor.balance) / 100).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={
                            vendor.balance > 0 
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }>
                            {vendor.balance > 0 ? 'Outstanding' : 'Cleared'}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/vendors/${vendor.id}`} className="flex-1">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/vendors/${vendor.id}/edit`}>
                            <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {session.user.role === "ADMIN" && (
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteVendor(vendor.id)}
                              disabled={isDeleting === vendor.id}
                            >
                              {isDeleting === vendor.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
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
                  onClick={() => fetchVendors(page)}
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



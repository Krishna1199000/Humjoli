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
  Users,
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
  Mail,
  Phone,
  MapPin,
  Building,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Customer, CustomerFilters } from "@/types/customer"

export default function CustomerMasterPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<CustomerFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: ""
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  })

  // Redirect if not admin
  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch customers
  useEffect(() => {
    fetchCustomers()
  }, [filters, pagination.page])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.email) params.append('email', filters.email)
      if (filters.phone) params.append('phone', filters.phone)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await fetch(`/api/customers?${params}`)
      if (!response.ok) throw new Error('Failed to fetch customers')
      
      const data = await response.json()
      setCustomers(data.customers)
      setPagination(prev => ({
        ...prev,
        totalCount: data.pagination.totalCount,
        totalPages: data.pagination.totalPages
      }))
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, search: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required')
      return
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create customer')
      }

      toast.success('Customer created successfully')
      setShowAddModal(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: ""
      })
      fetchCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create customer')
    }
  }

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomer || !formData.name || !formData.phone) {
      toast.error('Name and phone are required')
      return
    }

    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update customer')
      }

      toast.success('Customer updated successfully')
      setShowEditModal(false)
      setSelectedCustomer(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: ""
      })
      fetchCustomers()
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update customer')
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete customer')

      toast.success('Customer deleted successfully')
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || "",
      gstNumber: customer.gstNumber || ""
    })
    setShowEditModal(true)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN')
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/master">
                <Button className="text-purple-600 hover:bg-purple-50 bg-transparent p-2 rounded-lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Master
                </Button>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-serif font-bold text-purple-600"
              >
                Customer Master
              </motion.div>
              <Badge className="bg-blue-100 text-blue-600">
                <Users className="mr-1 h-3 w-3" />
                Customer Management
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
              Customer Management
            </h1>
            <p className="text-gray-600 text-lg">
              Manage customer information and contact details
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
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-800">{pagination.totalCount}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Email</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {customers.filter(c => c.email).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With GST</p>
                  <p className="text-2xl font-bold text-green-600">
                    {customers.filter(c => c.gstNumber).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Building className="h-6 w-6 text-green-600" />
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
                      placeholder="Search customers by name, email, phone, or GST..."
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
                  Add Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="text-purple-600 text-lg">Loading customers...</div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No customers found</p>
              <p className="text-gray-500">Add a new customer to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.id}
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
                              {customer.name}
                            </h3>
                            <Badge className="bg-blue-100 text-blue-600">
                              {formatDate(customer.createdAt)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold text-gray-800">{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-gray-800">{customer.email}</span>
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-gray-800">{customer.address}</span>
                              </div>
                            )}
                            {customer.gstNumber && (
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-gray-800">{customer.gstNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => openEditModal(customer)}
                            className="text-blue-600 hover:bg-blue-50 bg-transparent p-2 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCustomer(customer.id)}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white px-3 py-2 rounded-lg"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 py-2 text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white px-3 py-2 rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Customer address"
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  type="text"
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="GST number"
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
                  Add Customer
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Customer</h2>
            <form onSubmit={handleEditCustomer} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  type="email"
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  type="tel"
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  type="text"
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Customer address"
                />
              </div>
              <div>
                <Label htmlFor="edit-gstNumber">GST Number</Label>
                <Input
                  type="text"
                  id="edit-gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="GST number"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                >
                  Update Customer
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
} 
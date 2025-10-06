"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  Tags,
  Edit,
  Plus,
  ArrowLeft,
  RefreshCw,
  Receipt,
  DollarSign,
  Calendar,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import AdminNavbar from "@/components/AdminNavbar"

interface Props {
  params: {
    id: string
  }
}

interface Invoice {
  id: string
  invoiceNo: string
  status: string
  issueDate: string
  dueDate: string | null
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  notes: string | null
}

interface CustomerDetails {
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
  invoices: Invoice[]
  _count: {
    invoices: number
  }
}

export default function CustomerDetailsPage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/enhanced-customers/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch customer')
        const data = await response.json()
        setCustomer(data)
      } catch (error) {
        console.error('Error fetching customer:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchCustomer()
    }
  }, [session, params.id])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Customer Details" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Customer Details" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Customer not found</p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalAmount = customer.invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = customer.invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0)
  const totalSemiPaid = customer.invoices
    .filter(inv => inv.status === 'SEMI_PAID')
    .reduce((sum, inv) => sum + inv.total, 0)
  const totalPending = totalAmount - totalPaid - totalSemiPaid

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Customer Details" />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/customers">
              <Button variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {customer.displayName}
            </h1>
            <Badge className={customer.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link href={`/admin/customers/${customer.id}/edit`}>
              <Button variant="outline" className="text-purple-600 border-purple-200">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customer.fullLegalName && (
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Legal Name</p>
                      <p className="text-gray-700">{customer.fullLegalName}</p>
                    </div>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-700">{customer.phone}</p>
                    </div>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-700">{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer.gstin && (
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">GSTIN</p>
                      <p className="text-gray-700">{customer.gstin}</p>
                    </div>
                  </div>
                )}
                {customer.billingAddress && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Billing Address</p>
                      <p className="text-gray-700">{customer.billingAddress}</p>
                    </div>
                  </div>
                )}
                {customer.shippingAddress && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="text-gray-700">{customer.shippingAddress}</p>
                    </div>
                  </div>
                )}
                {customer.defaultPaymentTerms && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Terms</p>
                      <p className="text-gray-700">{customer.defaultPaymentTerms}</p>
                    </div>
                  </div>
                )}
                {customer.tags && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <Tags className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {customer.tags.split(',').map((tag, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-600">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {customer.notes && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-gray-700 whitespace-pre-line">{customer.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-600 font-medium">Total Sales</p>
                    <Receipt className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    ₹{(totalAmount / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-500">{customer._count.invoices} invoices</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{(totalPaid / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-500">
                    {customer.invoices.filter(inv => inv.status === 'PAID').length} paid invoices
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-yellow-600 font-medium">Semi Paid</p>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">
                    ₹{(totalSemiPaid / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-yellow-500">
                    {customer.invoices.filter(inv => inv.status === 'SEMI_PAID').length} semi paid invoices
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${
                  totalPending > 0 ? 'bg-amber-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${
                      totalPending > 0 ? 'text-amber-600' : 'text-blue-600'
                    }`}>Amount Due</p>
                    <FileSpreadsheet className={`h-4 w-4 ${
                      totalPending > 0 ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                  </div>
                  <p className={`text-2xl font-bold ${
                    totalPending > 0 ? 'text-amber-700' : 'text-blue-700'
                  }`}>
                    ₹{(totalPending / 100).toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    totalPending > 0 ? 'text-amber-500' : 'text-blue-500'
                  }`}>
                    {customer.invoices.filter(inv => inv.status !== 'PAID').length} pending invoices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Invoices</h2>
              <Link href={`/admin/customers/${customer.id}/invoices`}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            {customer.invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No invoices recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 text-gray-600">Invoice No</th>
                      <th className="pb-3 text-gray-600">Date</th>
                      <th className="pb-3 text-gray-600">Due Date</th>
                      <th className="pb-3 text-gray-600">Amount</th>
                      <th className="pb-3 text-gray-600">Status</th>
                      <th className="pb-3 text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100">
                        <td className="py-3">
                          <span className="font-medium text-gray-800">{invoice.invoiceNo}</span>
                        </td>
                        <td className="py-3 text-gray-600">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-gray-600">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3">
                          <span className="font-medium text-gray-800">
                            ₹{(invoice.total / 100).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3">
                          <Badge className={
                            invoice.status === 'PAID' ? 'bg-green-100 text-green-600' :
                            invoice.status === 'SEMI_PAID' ? 'bg-yellow-100 text-yellow-600' :
                            invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-600' :
                            invoice.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                            'bg-gray-100 text-gray-600'
                          }>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Link href={`/admin/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
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
} from "lucide-react"
import Link from "next/link"
import AdminNavbar from "@/components/AdminNavbar"

interface Props {
  params: {
    id: string
  }
}

interface Purchase {
  id: string
  amount: number
  date: string
  reference: string | null
  description: string | null
}

// Payment details are not displayed here anymore; payments are managed in Account Ledger

interface VendorDetails {
  id: string
  businessName: string
  contactName: string | null
  phone: string | null
  email: string | null
  gstin: string | null
  address: string | null
  notes: string | null
  tags: string | null
  isActive: boolean
  purchases: Purchase[]
  _count: {
    purchases: number
  }
}

export default function VendorDetailsPage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await fetch(`/api/vendors/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch vendor')
        const data = await response.json()
        setVendor(data)
      } catch (error) {
        console.error('Error fetching vendor:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchVendor()
    }
  }, [session, params.id])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Vendor Details" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Vendor Details" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Vendor not found</p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalPurchases = vendor.purchases.reduce((sum, p) => sum + p.amount, 0)
  // Totals derived from vendor endpoint computation; fall back to arrays if present
  const totalPayments = (vendor as any).totalPayments ?? (Array.isArray((vendor as any).payments) ? (vendor as any).payments.reduce((sum: number, p: any) => sum + p.amount, 0) : 0)
  const balance = (vendor as any).balance ?? (totalPurchases - totalPayments)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Vendor Details" />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/vendors">
              <Button variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vendors
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {vendor.businessName}
            </h1>
            <Badge className={vendor.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}>
              {vendor.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link href={`/admin/vendors/${vendor.id}/purchases/new`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Purchase
              </Button>
            </Link>
            <Link href={`/admin/vendors/${vendor.id}/edit`}>
              <Button variant="outline" className="text-purple-600 border-purple-200">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Vendor Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Vendor Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendor.contactName && (
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="text-gray-700">{vendor.contactName}</p>
                    </div>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-700">{vendor.phone}</p>
                    </div>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-700">{vendor.email}</p>
                    </div>
                  </div>
                )}
                {vendor.gstin && (
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">GSTIN</p>
                      <p className="text-gray-700">{vendor.gstin}</p>
                    </div>
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-700">{vendor.address}</p>
                    </div>
                  </div>
                )}
                {vendor.tags && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <Tags className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {vendor.tags.split(',').map((tag, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-600">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {vendor.notes && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-gray-700 whitespace-pre-line">{vendor.notes}</p>
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
                    <p className="text-sm text-purple-600 font-medium">Total Purchases</p>
                    <Receipt className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    ₹{(totalPurchases / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-500">{vendor.purchases?.length ?? 0} records</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-600 font-medium">Total Payments</p>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{(totalPayments / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-500">{Array.isArray((vendor as any).payments) ? (vendor as any).payments.length : 0} payments</p>
                </div>

                <div className={`p-4 rounded-lg ${
                  balance > 0 ? 'bg-amber-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${
                      balance > 0 ? 'text-amber-600' : 'text-blue-600'
                    }`}>Balance Due</p>
                    <FileSpreadsheet className={`h-4 w-4 ${
                      balance > 0 ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                  </div>
                  <p className={`text-2xl font-bold ${
                    balance > 0 ? 'text-amber-700' : 'text-blue-700'
                  }`}>
                    ₹{(balance / 100).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchases */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Purchases</h2>
                <Link href={`/admin/vendors/${vendor.id}/purchases`}>
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              {vendor.purchases.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No purchases recorded</p>
              ) : (
                <div className="space-y-4">
                  {vendor.purchases.slice(0, 5).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">
                          ₹{(purchase.amount / 100).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(purchase.date).toLocaleDateString()}</span>
                        </div>
                        {purchase.description && (
                          <p className="text-sm text-gray-600 mt-1">{purchase.description}</p>
                        )}
                      </div>
                      {purchase.reference && (
                        <Badge className="bg-purple-100 text-purple-600">
                          Ref: {purchase.reference}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payments section removed: payments are recorded via Account Ledger (DEBIT) */}
        </div>
      </main>
    </div>
  )
}
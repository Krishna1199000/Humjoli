"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AccountEntryForm from "@/components/AccountEntryForm"
import AdminNavbar from "@/components/AdminNavbar"
import { RefreshCw } from "lucide-react"

interface Invoice {
  id: string
  invoiceNo: string
  customerId: string
  total: number
  paidAmount: number
  customer: {
    displayName: string
  }
}

export default function NewAccountEntryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [vendors, setVendors] = useState<{ id: string; businessName: string }[]>([])

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices')
        if (!response.ok) throw new Error('Failed to fetch invoices')
        const data = await response.json()
        // Transform the old invoice format to match the expected format
        const transformedInvoices = data.map((invoice: any) => ({
          id: invoice.id,
          invoiceNo: invoice.quotationNo,
          customerId: 'temp', // We don't have customerId in old format
          total: Math.round(invoice.totalAmount * 100), // Convert to paise
          paidAmount: Math.round((invoice.totalAmount - invoice.balanceAmount) * 100), // Convert to paise
          customer: {
            displayName: invoice.customerName
          }
        }))
        setInvoices(transformedInvoices)
      } catch (error) {
        console.error('Error fetching invoices:', error)
      }
    }
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors')
        if (!response.ok) throw new Error('Failed to fetch vendors')
        const data = await response.json()
        setVendors(data.vendors || [])
      } catch (error) {
        console.error('Error fetching vendors:', error)
      }
    }

    if (session?.user?.id) {
      Promise.all([fetchInvoices(), fetchVendors()]).finally(() => setLoading(false))
    }
  }, [session])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Add Account Entry" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Add Account Entry" />
      <AccountEntryForm mode="create" invoices={invoices} vendors={vendors} />
    </div>
  )
}



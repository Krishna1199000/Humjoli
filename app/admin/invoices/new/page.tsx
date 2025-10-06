"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AdminNavbar from "@/components/AdminNavbar"
import { RefreshCw } from "lucide-react"
import InvoiceForm from "@/components/InvoiceForm"

interface Customer {
  id: string
  displayName: string
  fullLegalName?: string | null
  email?: string | null
  phone: string
  billingAddress?: string | null
  gstin?: string | null
}

export default function NewInvoicePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/enhanced-customers')
        if (!response.ok) throw new Error('Failed to fetch customers')
        const data = await response.json()
        setCustomers(data.customers || [])
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchCustomers()
    }
  }, [session])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="New Invoice" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="New Invoice" />
      <main className="container mx-auto px-4 py-8">
        <InvoiceForm 
          mode="create" 
          customers={customers}
        />
      </main>
    </div>
  )
}












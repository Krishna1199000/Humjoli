"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AdminNavbar from "@/components/AdminNavbar"
import { RefreshCw } from "lucide-react"
import InvoiceForm from "@/components/InvoiceForm"

interface Props {
  params: {
    id: string
  }
}

export default function NewInvoicePage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
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
        <AdminNavbar title="Create Invoice" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Create Invoice" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Customer not found</p>
        </div>
      </div>
    )
  }

  // Pre-fill customer details for create mode: pass via dedicated props, not initialData
  const prefill = {
    customerName: customer.displayName as string,
    customerAddress: (customer.billingAddress || "") as string,
    customerTel: (customer.phone || "") as string,
    customerGSTIN: (customer.gstin || "") as string,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Create Invoice" />
      <main className="container mx-auto px-4 py-8">
        <InvoiceForm 
          mode="create" 
          customerId={params.id}
          customers={[{ id: customer.id, displayName: customer.displayName, phone: customer.phone, billingAddress: customer.billingAddress, gstin: customer.gstin }]}
        />
      </main>
    </div>
  )
}
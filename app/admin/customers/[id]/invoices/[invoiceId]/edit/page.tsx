"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import InvoiceForm from "@/components/InvoiceForm"
import AdminNavbar from "@/components/AdminNavbar"
import { RefreshCw } from "lucide-react"

interface Props {
  params: {
    id: string
    invoiceId: string
  }
}

export default function EditInvoicePage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/enhanced-customers/${params.id}/invoices/${params.invoiceId}`)
        if (!response.ok) throw new Error('Failed to fetch invoice')
        const data = await response.json()
        setInvoice(data)
      } catch (error) {
        console.error('Error fetching invoice:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchInvoice()
    }
  }, [session, params.id, params.invoiceId])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Invoice" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Invoice" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Invoice not found</p>
        </div>
      </div>
    )
  }

  // Convert amounts from paise to rupees for the form
  const formattedInvoice = {
    ...invoice,
    items: invoice.items.map((item: any) => ({
      ...item,
      rate: item.rate / 100,
      amount: item.amount / 100,
      discount: item.discount / 100,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Edit Invoice" />
      <InvoiceForm 
        mode="edit" 
        customerId={params.id}
        initialData={formattedInvoice}
      />
    </div>
  )
}














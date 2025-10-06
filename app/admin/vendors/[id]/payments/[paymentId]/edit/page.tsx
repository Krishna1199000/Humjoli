"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import VendorPaymentForm from "@/components/VendorPaymentForm"
import AdminNavbar from "@/components/AdminNavbar"
import { RefreshCw } from "lucide-react"

interface Props {
  params: {
    id: string
    paymentId: string
  }
}

export default function EditPaymentPage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/vendors/${params.id}/payments/${params.paymentId}`)
        if (!response.ok) throw new Error('Failed to fetch payment')
        const data = await response.json()
        setPayment(data)
      } catch (error) {
        console.error('Error fetching payment:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchPayment()
    }
  }, [session, params.id, params.paymentId])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Payment" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Payment" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Payment not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Edit Payment" />
      <VendorPaymentForm 
        mode="edit" 
        vendorId={params.id}
        initialData={payment}
      />
    </div>
  )
}














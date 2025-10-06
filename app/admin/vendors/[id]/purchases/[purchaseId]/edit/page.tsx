"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import PurchaseForm from "@/components/PurchaseForm"
import AdminNavbar from "@/components/AdminNavbar"
import { RefreshCw } from "lucide-react"

interface Props {
  params: {
    id: string
    purchaseId: string
  }
}

export default function EditPurchasePage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [purchase, setPurchase] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const response = await fetch(`/api/vendors/${params.id}/purchases/${params.purchaseId}`)
        if (!response.ok) throw new Error('Failed to fetch purchase')
        const data = await response.json()
        setPurchase(data)
      } catch (error) {
        console.error('Error fetching purchase:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchPurchase()
    }
  }, [session, params.id, params.purchaseId])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Purchase" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Purchase" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Purchase not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Edit Purchase" />
      <PurchaseForm 
        mode="edit" 
        vendorId={params.id}
        initialData={purchase}
      />
    </div>
  )
}














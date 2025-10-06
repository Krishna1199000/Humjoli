"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import VendorForm from "@/components/VendorForm"
import AdminNavbar from "@/components/AdminNavbar"
import { RefreshCw } from "lucide-react"

interface Props {
  params: {
    id: string
  }
}

export default function EditVendorPage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
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
        <AdminNavbar title="Edit Vendor" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <AdminNavbar title="Edit Vendor" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Vendor not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Edit Vendor" />
      <VendorForm mode="edit" initialData={vendor} />
    </div>
  )
}














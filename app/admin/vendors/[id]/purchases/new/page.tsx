"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import PurchaseForm from "@/components/PurchaseForm"
import AdminNavbar from "@/components/AdminNavbar"

interface Props {
  params: {
    id: string
  }
}

export default function NewPurchasePage({ params }: Props) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Record Purchase" />
      <PurchaseForm vendorId={params.id} mode="create" />
    </div>
  )
}














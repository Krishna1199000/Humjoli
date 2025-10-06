"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { Save, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"

interface PaymentFormProps {
  vendorId: string
  initialData?: {
    id: string
    amount: number
    date: string
    paymentMethod?: string | null
    reference?: string | null
    notes?: string | null
  }
  mode: "create" | "edit"
}

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque",
  "Credit Card",
  "Debit Card",
  "Other"
]

export default function VendorPaymentForm({ vendorId, initialData, mode }: PaymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: initialData ? (initialData.amount / 100).toString() : "",
    date: initialData ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: initialData?.paymentMethod || "",
    reference: initialData?.reference || "",
    notes: initialData?.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const rupees = parseFloat(formData.amount)
      if (isNaN(rupees) || rupees <= 0) {
        throw new Error("Please enter a valid amount")
      }

      const url = mode === "create" 
        ? `/api/vendors/${vendorId}/payments` 
        : `/api/vendors/${vendorId}/payments/${initialData?.id}`

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: Math.round(rupees * 100),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save payment")
      }

      toast.success(
        mode === "create" 
          ? "Payment recorded successfully" 
          : "Payment updated successfully"
      )
      router.push(`/admin/vendors/${vendorId}`)
      router.refresh()
    } catch (error) {
      console.error("Error saving payment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save payment")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === "create" ? "Record Payment" : "Edit Payment"}
              </h2>
            </div>
            <Link href={`/admin/vendors/${vendorId}`}>
              <Button variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                >
                  <option value="">Select payment method</option>
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Enter reference number (optional)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter payment notes (optional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href={`/admin/vendors/${vendorId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}




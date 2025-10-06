"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { Save, ArrowLeft, User } from "lucide-react"
import Link from "next/link"

interface CustomerFormProps {
  initialData?: {
    id: string
    displayName: string
    fullLegalName?: string | null
    email?: string | null
    phone: string
    billingAddress?: string | null
    shippingAddress?: string | null
    gstin?: string | null
    defaultPaymentTerms?: string | null
    preferredContact?: string | null
    notes?: string | null
    tags?: string | null
  }
  mode: "create" | "edit"
}

const PREFERRED_CONTACT_METHODS = [
  "EMAIL",
  "PHONE",
  "SMS"
]

export default function CustomerForm({ initialData, mode }: CustomerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: initialData?.displayName || "",
    fullLegalName: initialData?.fullLegalName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    billingAddress: initialData?.billingAddress || "",
    shippingAddress: initialData?.shippingAddress || "",
    gstin: initialData?.gstin || "",
    defaultPaymentTerms: initialData?.defaultPaymentTerms || "",
    preferredContact: initialData?.preferredContact || "",
    notes: initialData?.notes || "",
    tags: initialData?.tags || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === "create" 
        ? "/api/enhanced-customers" 
        : `/api/enhanced-customers/${initialData?.id}`

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save customer")
      }

      toast.success(
        mode === "create" 
          ? "Customer created successfully" 
          : "Customer updated successfully"
      )
      router.push("/admin/customers")
      router.refresh()
    } catch (error) {
      console.error("Error saving customer:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save customer")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCopyAddress = () => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: prev.billingAddress
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === "create" ? "Add New Customer" : "Edit Customer"}
              </h2>
            </div>
            <Link href="/admin/customers">
              <Button variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Enter display name"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fullLegalName">Full Legal Name</Label>
                <Input
                  id="fullLegalName"
                  name="fullLegalName"
                  value={formData.fullLegalName}
                  onChange={handleChange}
                  placeholder="Enter full legal name"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="Enter GSTIN"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  placeholder="Enter billing address"
                  className="mt-1"
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Input
                    id="shippingAddress"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    placeholder="Enter shipping address"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyAddress}
                  className="mb-[2px]"
                >
                  Copy Billing
                </Button>
              </div>

              <div>
                <Label htmlFor="defaultPaymentTerms">Default Payment Terms</Label>
                <Input
                  id="defaultPaymentTerms"
                  name="defaultPaymentTerms"
                  value={formData.defaultPaymentTerms}
                  onChange={handleChange}
                  placeholder="Enter default payment terms"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <select
                  id="preferredContact"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                >
                  <option value="">Select preferred contact method</option>
                  {PREFERRED_CONTACT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any notes about this customer"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Enter tags (comma separated)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/customers">
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
                {loading ? "Saving..." : "Save Customer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}














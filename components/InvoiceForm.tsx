"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Save, ArrowLeft, Plus, Trash2, Calculator, PenTool, Check } from "lucide-react"
import Link from "next/link"
import SignatureCapture from "./SignatureCapture"

interface InvoiceItem {
  id?: string
  name: string
  description?: string
  quantity: number | string
  rate: number | string
  discount: number | string
  taxRate: number | string
  amount: number
  source?: 'MANUAL' | 'INVENTORY'
  inventoryId?: string
}

interface Customer {
  id: string
  displayName: string
  fullLegalName?: string | null
  email?: string | null
  phone: string
  billingAddress?: string | null
  gstin?: string | null
}

interface InvoiceFormProps {
  customerId?: string
  customers?: Customer[]
  invoiceId?: string
  initialData?: {
    id: string
    invoiceNo: string
    status: string
    issueDate: string
    dueDate?: string | null
    subtotal: number
    taxAmount: number
    discountAmount: number
    total: number
    notes?: string | null
    terms?: string | null
    customerName?: string
    customerAddress?: string
    customerTel?: string
    customerState?: string
    customerStateCode?: string
    customerGSTIN?: string
    customerSignature?: string | null
    items: InvoiceItem[]
  }
  mode: "create" | "edit"
  onSaved?: () => void
}

// Helper function to safely format dates
const formatDateForInput = (dateString: string | null | undefined, fallback?: string): string => {
  if (!dateString) return fallback || ""
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? (fallback || "") : date.toISOString().split('T')[0]
}

export default function InvoiceForm({ customerId, customers = [], initialData, mode, onSaved }: InvoiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || "")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [inventoryItems, setInventoryItems] = useState<Array<{ id: string; name: string; description?: string | null; price: number }>>([])
  const [showSignatureCapture, setShowSignatureCapture] = useState(false)
  const [customerSignature, setCustomerSignature] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    issueDate: formatDateForInput(initialData?.issueDate, new Date().toISOString().split('T')[0]),
    dueDate: formatDateForInput(initialData?.dueDate),
    customerName: initialData?.customerName || "",
    customerAddress: initialData?.customerAddress || "",
    customerTel: initialData?.customerTel || "",
    customerState: initialData?.customerState || "Maharashtra",
    customerStateCode: initialData?.customerStateCode || "27",
    customerGSTIN: initialData?.customerGSTIN || "",
    notes: initialData?.notes || "",
    terms: initialData?.terms || "",
    items: initialData?.items || [
      {
        name: "",
        description: "",
        quantity: "",
        rate: "",
        discount: "",
        taxRate: "",
        amount: 0,
        source: 'MANUAL',
        inventoryId: undefined
      }
    ]
  })

  // Initialize signature from initial data
  useEffect(() => {
    if (initialData?.customerSignature) {
      setCustomerSignature(initialData.customerSignature)
    }
  }, [initialData])

  // Fetch inventory options for autofill
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('/api/inventory')
        if (res.ok) {
          const data = await res.json()
          const mapped = (data || []).map((it: any) => ({ id: it.id, name: it.name, description: it.description, price: it.price }))
          setInventoryItems(mapped)
        }
      } catch (e) {
        console.error('Failed to load inventory', e)
      }
    }
    fetchInventory()
  }, [])

  const calculateItemAmount = (item: InvoiceItem) => {
    const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity
    const rate = typeof item.rate === 'string' ? parseFloat(item.rate) || 0 : item.rate
    const discount = typeof item.discount === 'string' ? parseFloat(item.discount) || 0 : item.discount
    const taxRate = typeof item.taxRate === 'string' ? parseFloat(item.taxRate) || 0 : item.taxRate
    
    const baseAmount = quantity * rate
    const discountAmount = (baseAmount * discount) / 100
    const afterDiscount = baseAmount - discountAmount
    const taxAmount = (afterDiscount * taxRate) / 100
    return Math.round(afterDiscount + taxAmount)
  }

  const calculateTotals = () => {
    let subtotal = 0
    let taxAmount = 0
    let discountAmount = 0

    formData.items.forEach(item => {
      const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity
      const rate = typeof item.rate === 'string' ? parseFloat(item.rate) || 0 : item.rate
      const discount = typeof item.discount === 'string' ? parseFloat(item.discount) || 0 : item.discount
      const taxRate = typeof item.taxRate === 'string' ? parseFloat(item.taxRate) || 0 : item.taxRate
      
      const baseAmount = quantity * rate
      const itemDiscount = (baseAmount * discount) / 100
      const afterDiscount = baseAmount - itemDiscount
      const itemTax = (afterDiscount * taxRate) / 100

      subtotal += baseAmount
      discountAmount += itemDiscount
      taxAmount += itemTax
    })

    const total = subtotal - discountAmount + taxAmount

    return {
      subtotal: Math.round(subtotal),
      taxAmount: Math.round(taxAmount),
      discountAmount: Math.round(discountAmount),
      total: Math.round(total)
    }
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: typeof value === 'string' && field !== 'name' && field !== 'description' 
        ? parseFloat(value) || 0 
        : value
    }
    newItems[index].amount = calculateItemAmount(newItems[index])
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          description: "",
          quantity: "",
          rate: "",
          discount: "",
          taxRate: "",
          amount: 0,
          source: 'MANUAL',
          inventoryId: undefined
        }
      ]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      toast.error("Invoice must have at least one item")
      return
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totals = calculateTotals()
      
      if (!selectedCustomerId) {
        throw new Error("Please select a customer")
      }

      const url = mode === "create" 
        ? `/api/enhanced-customers/${selectedCustomerId}/invoices` 
        : `/api/enhanced-customers/${selectedCustomerId}/invoices/${initialData?.id}`

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ...totals,
          customerSignature,
          items: formData.items.map(item => ({
            ...item,
            rate: Math.round((typeof item.rate === 'string' ? parseFloat(item.rate) || 0 : item.rate) * 100), // Convert to paise
            amount: Math.round(item.amount * 100), // Convert to paise
            discount: Math.round((typeof item.discount === 'string' ? parseFloat(item.discount) || 0 : item.discount) * 100), // Store as basis points
          }))
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save invoice")
      }

      toast.success(
        mode === "create" 
          ? "Invoice created successfully" 
          : "Invoice updated successfully"
      )
      
      if (onSaved) {
        onSaved()
      } else {
        router.push(`/admin/customers/${selectedCustomerId}`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save invoice")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const totals = calculateTotals()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Calculator className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === "create" ? "New Invoice" : "Edit Invoice"}
              </h2>
            </div>
            <Link href={`/admin/customers/${customerId}`}>
              <Button variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection and Basic Info */}
            <div className="space-y-6">
              {mode === "create" && (
                <div>
                  <Label htmlFor="customer">Select Customer *</Label>
                  <select
                    id="customer"
                    value={selectedCustomerId}
                    onChange={(e) => {
                      const customer = customers.find(c => c.id === e.target.value)
                      setSelectedCustomerId(e.target.value)
                      setSelectedCustomer(customer || null)
                      if (customer) {
                        setFormData(prev => ({
                          ...prev,
                          customerName: customer.displayName,
                          customerAddress: customer.billingAddress || "",
                          customerTel: customer.phone || "",
                          customerGSTIN: customer.gstin || ""
                        }))
                      }
                    }}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.displayName} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    readOnly={mode === "create"}
                  />
                </div>

                <div>
                  <Label htmlFor="customerTel">Phone Number *</Label>
                  <Input
                    id="customerTel"
                    name="customerTel"
                    value={formData.customerTel}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    readOnly={mode === "create"}
                  />
                </div>

                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    className="mt-1"
                    readOnly={mode === "create"}
                  />
                </div>

                <div>
                  <Label htmlFor="customerGSTIN">GSTIN</Label>
                  <Input
                    id="customerGSTIN"
                    name="customerGSTIN"
                    value={formData.customerGSTIN}
                    onChange={handleChange}
                    className="mt-1"
                    readOnly={mode === "create"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Invoice Items</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  className="text-purple-600 border-purple-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`items.${index}.source`}>Item Source</Label>
                          <select
                            id={`items.${index}.source`}
                            value={item.source || 'MANUAL'}
                            onChange={(e) => {
                              const value = e.target.value as 'MANUAL' | 'INVENTORY'
                              const newItems = [...formData.items]
                              newItems[index] = { ...newItems[index], source: value }
                              if (value === 'MANUAL') {
                                newItems[index].inventoryId = undefined
                              }
                              setFormData(prev => ({ ...prev, items: newItems }))
                            }}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                          >
                            <option value="MANUAL">Enter Manually</option>
                            <option value="INVENTORY">Select from Inventory</option>
                          </select>
                        </div>
                        { (item.source || 'MANUAL') === 'INVENTORY' && (
                          <div>
                            <Label htmlFor={`items.${index}.inventoryId`}>Inventory Item</Label>
                            <select
                              id={`items.${index}.inventoryId`}
                              value={item.inventoryId || ''}
                              onChange={(e) => {
                                const invId = e.target.value
                                const inv = inventoryItems.find(i => i.id === invId)
                                const newItems = [...formData.items]
                                newItems[index] = {
                                  ...newItems[index],
                                  inventoryId: invId || undefined,
                                  name: inv?.name || newItems[index].name,
                                  description: inv?.description || newItems[index].description,
                                  rate: typeof inv?.price === 'number' ? String(inv.price) : newItems[index].rate,
                                }
                                newItems[index].amount = calculateItemAmount(newItems[index])
                                setFormData(prev => ({ ...prev, items: newItems }))
                              }}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                            >
                              <option value="">Select item</option>
                              {inventoryItems.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <Label htmlFor={`items.${index}.name`}>Item Name *</Label>
                          <Input
                            id={`items.${index}.name`}
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="Enter item name"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`items.${index}.description`}>Description</Label>
                          <Input
                            id={`items.${index}.description`}
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Enter description"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                          <Input
                            id={`items.${index}.quantity`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`items.${index}.rate`}>Rate (₹) *</Label>
                          <Input
                            id={`items.${index}.rate`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`items.${index}.discount`}>Discount (%)</Label>
                          <Input
                            id={`items.${index}.discount`}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`items.${index}.taxRate`}>Tax Rate (%)</Label>
                          <Input
                            id={`items.${index}.taxRate`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.taxRate}
                            onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-lg font-semibold text-gray-800">
                            ₹{item.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Totals */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span>₹{totals.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{totals.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-800">
                    <span>Total</span>
                    <span>₹{totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any notes for this invoice"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Input
                  id="terms"
                  name="terms"
                  value={formData.terms}
                  onChange={handleChange}
                  placeholder="Add terms and conditions"
                  className="mt-1"
                />
              </div>

              {/* Customer Signature Section */}
              <div className="space-y-3">
                <Label>Customer Signature</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    onClick={() => setShowSignatureCapture(true)}
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    {customerSignature ? 'Update Signature' : 'Add Signature'}
                  </Button>
                  {customerSignature && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-8 border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                        <img 
                          src={customerSignature} 
                          alt="Customer signature" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => setCustomerSignature(null)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                {customerSignature && (
                  <p className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Customer signature captured
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href={`/admin/customers/${customerId}`}>
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
                {loading ? "Saving..." : "Save Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Signature Capture Modal */}
      {showSignatureCapture && (
        <SignatureCapture
          onSignature={(signature) => {
            setCustomerSignature(signature)
            setShowSignatureCapture(false)
          }}
          onClose={() => setShowSignatureCapture(false)}
          title="Customer Signature"
          initialSignature={customerSignature}
        />
      )}
    </div>
  )
}
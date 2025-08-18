"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Download,
  FileText,
  User,
  Calendar,
  Package,
  DollarSign,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import toast from "react-hot-toast"

interface InvoiceItem {
  srl: number
  particular: string
  quantity: number
  rent: number
  amount: number
}

interface FormData {
  customerName: string
  customerAddress: string
  customerTel: string
  customerState: string
  customerStateCode: string
  customerGSTIN: string
  refName: string
  bookingDate: string
  eventDate: string
  startTime: string
  endTime: string
  manager: string
  advanceAmount: number
  balanceAmount: number
  remarks: string
  items: InvoiceItem[]
}

interface InvoiceFormProps {
  mode?: "create" | "edit"
  invoiceId?: string
  initialData?: FormData
  onSaved?: (invoiceId: string) => void
}

export default function InvoiceForm({ mode = "create", invoiceId, initialData, onSaved }: InvoiceFormProps) {
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerAddress: "",
    customerTel: "",
    customerState: "",
    customerStateCode: "",
    customerGSTIN: "",
    refName: "",
    bookingDate: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    manager: "",
    advanceAmount: 0,
    balanceAmount: 0,
    remarks: "",
    items: [{ srl: 1, particular: "", quantity: 1, rent: 0, amount: 0 }],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null)

  // Prefill for edit mode
  if (initialData && typeof window !== 'undefined') {
    // hydrate once on first render of edit payload
  }

  // Update local state when initialData changes (edit mode)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [didHydrate, setDidHydrate] = useState(false)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (!didHydrate && initialData) {
    setFormData(initialData)
    setDidHydrate(true)
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      srl: formData.items.length + 1,
      particular: "",
      quantity: 1,
      rent: 0,
      amount: 0,
    }
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    })
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, srl: i + 1 }))
      setFormData({
        ...formData,
        items: updatedItems,
      })
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Calculate amount for this item
    if (field === "quantity" || field === "rent") {
      const quantity = field === "quantity" ? value : updatedItems[index].quantity
      const rent = field === "rent" ? value : updatedItems[index].rent
      updatedItems[index].amount = quantity * rent
    }
    
    setFormData({
      ...formData,
      items: updatedItems,
    })
  }

  const calculateTotals = () => {
    const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0)
    const totalQty = formData.items.reduce((sum, item) => sum + item.quantity, 0)
    return { totalAmount, totalQty }
  }

  const numberToWords = (num: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]

    if (num === 0) return "Zero"
    if (num < 10) return ones[num]
    if (num < 20) return teens[num - 10]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + numberToWords(num % 100) : "")
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "")
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "")
    return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { totalAmount } = calculateTotals()
      const invoiceValueInWords = numberToWords(Math.floor(totalAmount)) + " Rupees Only"

      const invoiceData = {
        ...formData,
        totalAmount,
        cgstAmount: 0,
        sgstAmount: 0,
        taxableAmount: totalAmount,
        sacCode: "998314",
        invoiceValueInWords,
      }

      const isEdit = mode === "edit" && invoiceId
      const response = await fetch(isEdit ? `/api/invoices/${invoiceId}` : "/api/invoices", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        throw new Error(isEdit ? "Failed to update invoice" : "Failed to create invoice")
      }

      const result = await response.json()
      if (!isEdit) setGeneratedInvoiceId(result.id)
      toast.success(isEdit ? "Invoice updated successfully!" : "Invoice created successfully!")
      if (onSaved) onSaved(isEdit ? (invoiceId as string) : result.id)
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast.error("Failed to save invoice. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadPDF = async () => {
    if (!generatedInvoiceId) return

    setIsDownloading(true)
    try {
      const response = await fetch(`/api/invoices/${generatedInvoiceId}/download`)
      if (!response.ok) throw new Error("Failed to download PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${generatedInvoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("PDF downloaded successfully!")
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error("Failed to download PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const { totalAmount, totalQty } = calculateTotals()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Invoice' : 'Generate Invoice'}
            </h1>
          </div>
          {mode === 'create' && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create professional invoices for your wedding events with our comprehensive form
            </p>
          )}
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span>Customer Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <Label htmlFor="customerName" className="form-label">Customer Name *</Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="input-modern"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="customerTel" className="form-label">Telephone *</Label>
                    <Input
                      id="customerTel"
                      type="tel"
                      value={formData.customerTel}
                      onChange={(e) => setFormData({ ...formData, customerTel: e.target.value })}
                      className="input-modern"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="form-group md:col-span-2">
                    <Label htmlFor="customerAddress" className="form-label">Address *</Label>
                    <Input
                      id="customerAddress"
                      type="text"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="input-modern"
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="customerState" className="form-label">State *</Label>
                    <Input
                      id="customerState"
                      type="text"
                      value={formData.customerState}
                      onChange={(e) => setFormData({ ...formData, customerState: e.target.value })}
                      className="input-modern"
                      placeholder="Enter state"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="customerStateCode" className="form-label">State Code *</Label>
                    <Input
                      id="customerStateCode"
                      type="text"
                      value={formData.customerStateCode}
                      onChange={(e) => setFormData({ ...formData, customerStateCode: e.target.value })}
                      className="input-modern"
                      placeholder="Enter state code"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="customerGSTIN" className="form-label">GSTIN</Label>
                    <Input
                      id="customerGSTIN"
                      type="text"
                      value={formData.customerGSTIN}
                      onChange={(e) => setFormData({ ...formData, customerGSTIN: e.target.value })}
                      className="input-modern"
                      placeholder="Enter GSTIN (optional)"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="refName" className="form-label">Reference Name</Label>
                    <Input
                      id="refName"
                      type="text"
                      value={formData.refName}
                      onChange={(e) => setFormData({ ...formData, refName: e.target.value })}
                      className="input-modern"
                      placeholder="Enter reference name (optional)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>Event Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <Label htmlFor="bookingDate" className="form-label">Booking Date *</Label>
                    <Input
                      id="bookingDate"
                      type="date"
                      value={formData.bookingDate}
                      onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                      className="input-modern"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="eventDate" className="form-label">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="input-modern"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="startTime" className="form-label">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="input-modern"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="endTime" className="form-label">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="input-modern"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="manager" className="form-label">Manager</Label>
                    <Input
                      id="manager"
                      type="text"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      className="input-modern"
                      placeholder="Enter manager name (optional)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span>Items & Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="col-span-1">
                        <Label className="form-label">Srl.</Label>
                        <div className="flex items-center justify-center h-10 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium">
                          {item.srl}
                        </div>
                      </div>
                      <div className="col-span-4">
                        <Label className="form-label">Particular *</Label>
                        <Input
                          type="text"
                          value={item.particular}
                          onChange={(e) => updateItem(index, "particular", e.target.value)}
                          className="input-modern"
                          placeholder="Enter item description"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="form-label">Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                          className="input-modern"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="form-label">Rent (₹) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rent}
                          onChange={(e) => updateItem(index, "rent", parseFloat(e.target.value) || 0)}
                          className="input-modern"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="form-label">Amount (₹)</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 flex items-center justify-center h-10 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg font-medium">
                            ₹{item.amount.toFixed(2)}
                          </div>
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span>Financial Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <Label htmlFor="advanceAmount" className="form-label">Advance Amount (₹) *</Label>
                    <Input
                      id="advanceAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.advanceAmount}
                      onChange={(e) => setFormData({ ...formData, advanceAmount: parseFloat(e.target.value) || 0 })}
                      className="input-modern"
                      placeholder="Enter advance amount"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="balanceAmount" className="form-label">Balance Amount (₹) *</Label>
                    <Input
                      id="balanceAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.balanceAmount}
                      onChange={(e) => setFormData({ ...formData, balanceAmount: parseFloat(e.target.value) || 0 })}
                      className="input-modern"
                      placeholder="Enter balance amount"
                      required
                    />
                  </div>
                  <div className="form-group md:col-span-2">
                    <Label htmlFor="remarks" className="form-label">Remarks</Label>
                    <Input
                      id="remarks"
                      type="text"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="input-modern"
                      placeholder="Enter any additional remarks (optional)"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount in Words</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {numberToWords(Math.floor(totalAmount))} Rupees Only
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{mode === 'edit' ? 'Saving Changes...' : 'Creating Invoice...'}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{mode === 'edit' ? 'Save Changes' : 'Generate Invoice'}</span>
                </>
              )}
            </Button>

            <AnimatePresence>
              {generatedInvoiceId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    type="button"
                    onClick={downloadPDF}
                    disabled={isDownloading}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {generatedInvoiceId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-400 font-medium">
                  Invoice created successfully! You can now download the PDF.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
} 
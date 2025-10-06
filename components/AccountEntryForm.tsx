"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { Save, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

interface Invoice {
  id: string
  invoiceNo: string
  customerId: string
  total: number
  paidAmount: number
  customer: {
    displayName: string
  }
}

interface AccountEntryFormProps {
  initialData?: {
    id: string
    type: "CREDIT" | "DEBIT"
    amount: number
    currency: string
    reason: string
    counterParty?: string | null
    date: string
  }
  invoices?: Invoice[]
  vendors?: { id: string; businessName: string }[]
  mode: "create" | "edit"
}

export default function AccountEntryForm({ initialData, invoices = [], vendors = [], mode }: AccountEntryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedVendorId, setSelectedVendorId] = useState<string>("")
  const [payeeType, setPayeeType] = useState<'VENDOR' | 'EMPLOYEE'>('VENDOR')
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; monthlySalary: number }>>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [formData, setFormData] = useState({
    type: initialData?.type || "CREDIT",
    amount: initialData ? (initialData.amount / 100).toString() : "",
    currency: initialData?.currency || "INR",
    reason: initialData?.reason || "",
    counterParty: initialData?.counterParty || "",
    date: initialData ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Normalize amount string (handle commas like 28,000)
      const normalizedAmountStr = String(formData.amount).replace(/,/g, '').trim()
      // Convert amount to paise
      const amountInPaise = Math.round(parseFloat(normalizedAmountStr) * 100)
      
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (formData.type === "DEBIT") {
        if (payeeType === 'VENDOR' && !selectedVendorId) {
          throw new Error("Please select a vendor for debit entry")
        }
        if (payeeType === 'EMPLOYEE' && !selectedEmployeeId) {
          throw new Error("Please select an employee for debit entry")
        }
      }

      // Validate credit amount against invoice remaining balance
      if (formData.type === "CREDIT" && selectedInvoice) {
        const remainingBalance = selectedInvoice.total - selectedInvoice.paidAmount
        if (amountInPaise > remainingBalance) {
          throw new Error(`Credit amount cannot exceed remaining balance of ₹${(remainingBalance / 100).toLocaleString()}`)
        }
      }

      const url = mode === "create" 
        ? "/api/account-entries" 
        : `/api/account-entries/${initialData?.id}`

      // If DEBIT with vendor selected, validate against vendor balance and create vendor payment first
      if (formData.type === "DEBIT" && payeeType === 'VENDOR' && selectedVendorId) {
        // try to use vendors prop if it includes balance, else fetch single vendor to compute balance
        let vendorBalance: number | undefined = undefined
        const vendorLite = vendors.find(v => v.id === selectedVendorId) as any
        if (vendorLite && typeof vendorLite.balance === 'number') {
          vendorBalance = vendorLite.balance
        } else {
          const vendorRes = await fetch(`/api/vendors/${selectedVendorId}`)
          if (vendorRes.ok) {
            const vendorJson = await vendorRes.json()
            vendorBalance = vendorJson.balance
          }
        }
        if (typeof vendorBalance === 'number' && amountInPaise > vendorBalance) {
          throw new Error(`Debit amount cannot exceed vendor due of ₹${(vendorBalance / 100).toLocaleString()}`)
        }
        const vendorPaymentRes = await fetch(`/api/vendors/${selectedVendorId}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountInPaise, date: formData.date })
        })
        if (!vendorPaymentRes.ok) {
          const error = await vendorPaymentRes.json()
          throw new Error(error.error || "Failed to record vendor payment")
        }
      }

      // If DEBIT with employee selected, prevent overpayment beyond current cycle due
      if (formData.type === 'DEBIT' && payeeType === 'EMPLOYEE' && selectedEmployeeId) {
        try {
          const res = await fetch(`/api/enhanced-employees/${selectedEmployeeId}`)
          if (!res.ok) throw new Error('Failed to fetch employee')
          const emp = await res.json()
          const due = Number(emp.cycleDueAmount ?? 0)
          const payingRupees = amountInPaise / 100
          if (payingRupees > due) {
            throw new Error(`You can pay at most ₹${due.toLocaleString()} this cycle`)
          }
        } catch (err) {
          throw err instanceof Error ? err : new Error('Salary validation failed')
        }
      }

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          currency: "INR",
          // API expects rupees and converts to paise internally
          amount: parseFloat(normalizedAmountStr),
          invoiceId: selectedInvoice?.id,
          counterParty: formData.type === "DEBIT"
            ? (payeeType === 'VENDOR'
                ? (vendors.find(v => v.id === selectedVendorId)?.businessName || formData.counterParty)
                : (employees.find(e => e.id === selectedEmployeeId)?.name || formData.counterParty))
            : formData.counterParty,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save account entry")
      }

      toast.success(
        mode === "create" 
          ? "Account entry created successfully" 
          : "Account entry updated successfully"
      )
      router.push("/admin/accounts")
      router.refresh()
    } catch (error) {
      console.error("Error saving account entry:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save account entry")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (formData.type === 'DEBIT' && payeeType === 'EMPLOYEE') {
      const load = async () => {
        try {
          const res = await fetch('/api/enhanced-employees?limit=1000')
          if (res.ok) {
            const data = await res.json()
            setEmployees((data.employees || []).map((e: any) => ({ id: e.id, name: e.name, monthlySalary: e.monthlySalary })))
          }
        } catch {}
      }
      load()
    }
  }, [formData.type, payeeType])

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
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === "create" ? "Add Account Entry" : "Edit Account Entry"}
              </h2>
            </div>
            <Link href="/admin/accounts">
              <Button variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Entry Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={(e) => {
                    handleChange(e)
                    if (e.target.value === "DEBIT") {
                      setSelectedInvoice(null)
                    }
                  }}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                >
                  <option value="CREDIT">Credit</option>
                  <option value="DEBIT">Debit</option>
                </select>
              </div>

              {formData.type === "CREDIT" && (
                <div>
                  <Label htmlFor="invoice">Select Invoice</Label>
                  <select
                    id="invoice"
                    value={selectedInvoice?.id || ""}
                    onChange={(e) => {
                      const invoice = invoices.find(inv => inv.id === e.target.value)
                      setSelectedInvoice(invoice || null)
                      if (invoice) {
                        setFormData(prev => ({
                          ...prev,
                          reason: `Payment for invoice ${invoice.invoiceNo}`,
                          counterParty: invoice.customer.displayName
                        }))
                      }
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  >
                    <option value="">Select an invoice</option>
                    {invoices.map((invoice) => {
                      const remainingBalance = invoice.total - invoice.paidAmount
                      if (remainingBalance > 0) {
                        return (
                          <option key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNo} - {invoice.customer.displayName} (Remaining: ₹{(remainingBalance / 100).toLocaleString()})
                          </option>
                        )
                      }
                      return null
                    })}
                  </select>
                </div>
              )}

              {formData.type === "DEBIT" && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="payeeType">Payee Type</Label>
                    <select
                      id="payeeType"
                      value={payeeType}
                      onChange={(e) => {
                        const val = e.target.value as 'VENDOR' | 'EMPLOYEE'
                        setPayeeType(val)
                        setSelectedVendorId("")
                        setSelectedEmployeeId("")
                        setEmployees([])
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    >
                      <option value="VENDOR">Vendor</option>
                      <option value="EMPLOYEE">Employee</option>
                    </select>
                  </div>

                  {payeeType === 'VENDOR' && (
                    <div>
                      <Label htmlFor="vendor">Select Vendor</Label>
                      <select
                        id="vendor"
                        value={selectedVendorId}
                        onChange={(e) => {
                          const vendorId = e.target.value
                          setSelectedVendorId(vendorId)
                          const vendor = vendors.find(v => v.id === vendorId)
                          if (vendor) {
                            setFormData(prev => ({
                              ...prev,
                              reason: `Payment to vendor ${vendor.businessName}`,
                              counterParty: vendor.businessName
                            }))
                          }
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                        required
                      >
                        <option value="">Select a vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.businessName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {payeeType === 'EMPLOYEE' && (
                    <div>
                      <Label htmlFor="employee">Select Employee</Label>
                      <select
                        id="employee"
                        value={selectedEmployeeId}
                        onChange={(e) => {
                          const employeeId = e.target.value
                          setSelectedEmployeeId(employeeId)
                          const employee = employees.find(emp => emp.id === employeeId)
                          if (employee) {
                            setFormData(prev => ({
                              ...prev,
                              reason: `Salary payment to ${employee.name}`,
                              counterParty: employee.name,
                              amount: String(employee.monthlySalary)
                            }))
                          }
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                        required
                      >
                        <option value="">Select an employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} — ₹{emp.monthlySalary.toLocaleString()} per month
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

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

              {/* Currency is fixed to INR application-wide */}

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for the transaction"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="counterParty">Counter Party</Label>
                <Input
                  id="counterParty"
                  name="counterParty"
                  value={formData.counterParty}
                  onChange={handleChange}
                  placeholder="Enter counter party name (optional)"
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
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/accounts">
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
                {loading ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
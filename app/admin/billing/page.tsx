"use client"

import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DollarSign,
  Plus,
  Calendar,
  Receipt,
  Search,
  Download,
  Eye,
  User,
  SortAsc,
  SortDesc,
  Trash2,
  Pencil,
  X,
  ChevronDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import AdminNavbar from "@/components/AdminNavbar"
import InvoiceForm from "@/components/InvoiceForm"
import toast from "react-hot-toast"

interface InvoiceItem { srl: number; particular: string; quantity: number; rent: number; amount: number }
interface Invoice {
  id: string
  quotationNo: string
  customerName: string
  customerAddress: string
  customerTel: string
  customerState: string
  customerStateCode: string
  customerGSTIN: string | null
  refName: string | null
  bookingDate: string
  eventDate: string
  startTime: string
  endTime: string
  manager: string | null
  advanceAmount: number
  balanceAmount: number
  remarks: string | null
  totalAmount: number
  cgstAmount: number
  sgstAmount: number
  taxableAmount: number
  sacCode: string
  invoiceValueInWords: string
  createdAt: string
  status?: "pending" | "paid" | "cancelled"
  items?: InvoiceItem[]
}

export default function BillingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Single page list + form modal
  const [formOpen, setFormOpen] = useState(false)

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [statusEdit, setStatusEdit] = useState<'PENDING' | 'PAID'>('PENDING')
  const [savingStatus, setSavingStatus] = useState(false)
  const [debugMode, setDebugMode] = useState(false) // Add debug mode

  // (No tabs; single page design)

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => { setMounted(true) }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/invoices")
      if (!response.ok) throw new Error("Failed to fetch invoices")
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast.error("Failed to load invoices")
    } finally { setLoading(false) }
  }

  useEffect(() => { if (mounted) fetchInvoices() }, [mounted])

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || invoice.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) || invoice.customerTel.includes(searchTerm)
        const matchesStatus = filterStatus === "all" || invoice.status === filterStatus
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
          case "date": comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break
          case "amount": comparison = a.totalAmount - b.totalAmount; break
          case "name": comparison = a.customerName.localeCompare(b.customerName); break
        }
        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [invoices, searchTerm, sortBy, sortOrder, filterStatus])

  // (Guard moved below all hook declarations to keep hook order consistent)

  const formatDate = (d: string | Date) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
  const formatCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)
      if (!response.ok) throw new Error("Failed to download invoice")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Invoice downloaded successfully!")
    } catch (error) { console.error(error); toast.error("Failed to download invoice") }
  }

  const openPreview = async (invoiceId: string) => {
    setPreviewLoading(true)
    setPreviewOpen(true)
    try {
      console.log('=== STARTING PREVIEW DEBUG ===')
      console.log('Opening preview for invoice:', invoiceId)
      
      // First fetch invoice metadata
      const metaRes = await fetch(`/api/invoices/${invoiceId}`)
      if (!metaRes.ok) {
        const errorText = await metaRes.text()
        console.error('Metadata fetch failed:', errorText)
        throw new Error(`Failed to load invoice: ${errorText}`)
      }
      const json = await metaRes.json()
      console.log('=== INVOICE METADATA ===')
      console.log('Full invoice data:', json)
      console.log('Items count:', json.items?.length || 0)
      console.log('Items data:', json.items)
      console.log('Customer name:', json.customerName)
      console.log('Total amount:', json.totalAmount)
      
      // Check if items exist
      if (!json.items || json.items.length === 0) {
        console.warn('⚠️ INVOICE HAS NO ITEMS!')
        console.warn('Invoice data:', json)
      } else {
        console.log('✅ Invoice has items:', json.items)
      }
      
      setPreviewInvoice(json)
      setStatusEdit((json.status as 'PENDING' | 'PAID') || 'PENDING')
      
      // Then fetch PDF
      console.log('=== FETCHING PDF ===')
      const pdfRes = await fetch(`/api/invoices/${invoiceId}/download`)
      if (!pdfRes.ok) {
        const errorText = await pdfRes.text()
        console.error('❌ PDF response error:', errorText)
        throw new Error(`Failed to load PDF: ${errorText}`)
      }
      
      // Check content type
      const contentType = pdfRes.headers.get('content-type')
      console.log('PDF content type:', contentType)
      
      const blob = await pdfRes.blob()
      console.log('PDF blob size:', blob.size, 'bytes')
      console.log('PDF blob type:', blob.type)
      
      if (blob.size === 0) {
        console.error('❌ Generated PDF is empty!')
        throw new Error('Generated PDF is empty')
      }
      
      // Create URL with proper type
      const url = URL.createObjectURL(blob)
      setPreviewPdfUrl(url)
      console.log('✅ Preview URL created:', url)
      console.log('=== PREVIEW DEBUG COMPLETE ===')
    } catch (e) {
      console.error('❌ Preview error:', e)
      toast.error(`Failed to open invoice preview: ${e instanceof Error ? e.message : String(e)}`)
      setPreviewOpen(false)
    } finally { 
      setPreviewLoading(false) 
    }
  }

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success("Invoice deleted")
      setPreviewOpen(false)
      fetchInvoices()
    } catch { toast.error("Delete failed") }
  }

  const saveInvoiceStatus = async () => {
    if (!previewInvoice) return
    try {
      setSavingStatus(true)
      const payload = {
        customerName: previewInvoice.customerName,
        customerAddress: previewInvoice.customerAddress,
        customerTel: previewInvoice.customerTel,
        customerState: previewInvoice.customerState,
        customerStateCode: previewInvoice.customerStateCode,
        customerGSTIN: previewInvoice.customerGSTIN || '',
        refName: previewInvoice.refName || '',
        bookingDate: previewInvoice.bookingDate,
        eventDate: previewInvoice.eventDate,
        startTime: previewInvoice.startTime,
        endTime: previewInvoice.endTime,
        manager: previewInvoice.manager || '',
        advanceAmount: previewInvoice.advanceAmount,
        balanceAmount: previewInvoice.balanceAmount,
        remarks: previewInvoice.remarks || '',
        totalAmount: previewInvoice.totalAmount,
        cgstAmount: previewInvoice.cgstAmount,
        sgstAmount: previewInvoice.sgstAmount,
        taxableAmount: previewInvoice.taxableAmount,
        sacCode: previewInvoice.sacCode,
        invoiceValueInWords: previewInvoice.invoiceValueInWords,
        status: statusEdit,
        items: (previewInvoice.items || []).map((it) => ({
          srl: it.srl, particular: it.particular, quantity: it.quantity, rent: it.rent, amount: it.amount,
        })),
      }
      const res = await fetch(`/api/invoices/${previewInvoice.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Status updated')
      await fetchInvoices()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  // Edit invoice: open form tab prefilled
  const [editData, setEditData] = useState<any | null>(null)
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null)
  const editInvoice = (invoice: Invoice) => {
    // Map API invoice to form shape
    const mapped = {
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
      customerTel: invoice.customerTel,
      customerState: invoice.customerState,
      customerStateCode: invoice.customerStateCode,
      customerGSTIN: invoice.customerGSTIN || "",
      refName: invoice.refName || "",
      bookingDate: invoice.bookingDate?.slice(0,10),
      eventDate: invoice.eventDate?.slice(0,10),
      startTime: invoice.startTime || "",
      endTime: invoice.endTime || "",
      manager: invoice.manager || "",
      advanceAmount: invoice.advanceAmount || 0,
      balanceAmount: invoice.balanceAmount || 0,
      remarks: invoice.remarks || "",
      items: (invoice.items || []).map(it => ({ srl: it.srl, particular: it.particular, quantity: it.quantity, rent: it.rent, amount: it.amount })),
    }
    setEditInvoiceId(invoice.id)
    setEditData(mapped)
    setFormOpen(true)
    setPreviewOpen(false)
  }

  // Auth/mount guard AFTER all hooks
  if (!mounted || session?.user?.role !== "ADMIN") {
    if (mounted && session?.user?.role !== "ADMIN") router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Billing Management" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
            <p className="text-gray-600">Manage invoices, payments, and billing operations</p>
          </div>
          <Button className="btn-primary" onClick={() => { setEditData(null); setEditInvoiceId(null); setFormOpen(true) }}>+ Create Invoice</Button>
              </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Filters */}
              <Card className="card-modern mb-6"><CardContent className="p-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search invoices..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10 input-modern" /></div>
                <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className="input-modern"><option value="all">All Status</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select>
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value as any)} className="input-modern"><option value="date">Sort by Date</option><option value="amount">Sort by Amount</option><option value="name">Sort by Name</option></select>
                <Button variant="outline" onClick={()=>setSortOrder(sortOrder==='asc'?'desc':'asc')} className="flex items-center justify-center">{sortOrder==='asc'?<SortAsc className="h-4 w-4 mr-2"/>:<SortDesc className="h-4 w-4 mr-2"/>}{sortOrder==='asc'?"Ascending":"Descending"}</Button>
              </div></CardContent></Card>

              {/* List */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {loading ? (
                  <div className="space-y-4">{[...Array(5)].map((_,i)=>(<Card key={i} className="card-modern"><CardContent className="p-6"><div className="animate-pulse"><div className="flex items-center justify-between"><div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-48"></div><div className="h-3 bg-gray-200 rounded w-32"></div></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-24"></div><div className="h-3 bg-gray-200 rounded w-16"></div></div></div></div></CardContent></Card>))}</div>
                ) : filteredInvoices.length === 0 ? (
                  <Card className="card-modern"><CardContent className="p-12 text-center"><Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3><p className="text-gray-600 mb-6">{searchTerm||filterStatus!=='all'?"Try adjusting your search or filter criteria":"Get started by creating your first invoice"}</p><Button onClick={()=>{ setEditData(null); setEditInvoiceId(null); setFormOpen(true) }} className="btn-primary"><Plus className="h-4 w-4 mr-2"/>Create Invoice</Button></CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredInvoices.map((invoice,index)=> (
                        <motion.div key={invoice.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{delay:index*0.05}}>
                          <Card className="card-modern hover:shadow-xl transition-all duration-300"><CardContent className="p-6"><div className="flex items-center justify-between">
                            <div className="flex-1"><div className="flex items-center space-x-4"><div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center"><Receipt className="h-6 w-6 text-white"/></div><div><h3 className="font-semibold text-gray-900">{invoice.customerName}</h3><p className="text-sm text-gray-600">Quotation: {invoice.quotationNo} • {invoice.customerTel}</p><div className="flex items-center space-x-4 mt-1"><span className="text-sm text-gray-500">Created: {formatDate(invoice.createdAt)}</span><span className="text-sm text-gray-500">Event: {formatDate(invoice.eventDate)}</span></div></div></div></div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={()=>openPreview(invoice.id)} className="text-green-600 hover:text-green-700 hover:bg-green-50">View</Button>
                              <Button variant="outline" size="sm" onClick={()=>downloadInvoice(invoice.id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Download</Button>
                </div>
                          </div></CardContent></Card>
        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
        </motion.div>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewOpen && (
            <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <motion.div className="modal-content max-w-5xl w-[95vw] h-[85vh] overflow-hidden flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Redesigned toolbar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-soft px-4 py-3">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Invoice #{previewInvoice?.quotationNo}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">Customer: {previewInvoice?.customerName}</p>
                </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select value={statusEdit} onChange={(e)=>setStatusEdit(e.target.value as any)} className="appearance-none input-modern w-auto pr-8 py-2">
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Paid</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                      <Button onClick={saveInvoiceStatus} className="btn-secondary" disabled={savingStatus}>{savingStatus ? 'Saving...' : 'Save'}</Button>
                      <Button onClick={()=>previewInvoice && downloadInvoice(previewInvoice.id)} className="btn-primary flex items-center"><Download className="h-4 w-4 mr-2"/>Download</Button>
                      <Button onClick={()=>previewInvoice && editInvoice(previewInvoice)} className="btn-secondary flex items-center"><Pencil className="h-4 w-4 mr-2"/>Edit</Button>
                      <Button onClick={()=>previewInvoice && deleteInvoice(previewInvoice.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"><Trash2 className="h-4 w-4 mr-2"/>Delete</Button>
                      <Button onClick={()=>setDebugMode(!debugMode)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center text-xs">
                        {debugMode ? 'PDF' : 'Debug'}
                      </Button>
                      <Button 
                        onClick={() => {
                          if (previewInvoice) {
                            window.open(`/api/test-pdf?id=${previewInvoice.id}`, '_blank');
                          }
                        }} 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-xs"
                      >
                        Test HTML
                      </Button>
                      <Button 
                        onClick={() => {
                          if (previewInvoice) {
                            window.open(`/api/debug-invoice/${previewInvoice.id}`, '_blank');
                          }
                        }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-xs"
                      >
                        Raw Data
                      </Button>
                      <Button onClick={()=>setPreviewOpen(false)} className="btn-ghost p-2"><X className="h-4 w-4"/></Button>
                </div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden">
                  {previewLoading ? (
                    <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
                  ) : debugMode && previewInvoice ? (
                    <div className="w-full h-full overflow-auto p-4 bg-white">
                      <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Debug View - Invoice #{previewInvoice.quotationNo}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="border p-4 rounded">
                            <h3 className="font-bold mb-2">Customer Details</h3>
                            <p><strong>Name:</strong> {previewInvoice.customerName}</p>
                            <p><strong>Address:</strong> {previewInvoice.customerAddress}</p>
                            <p><strong>Phone:</strong> {previewInvoice.customerTel}</p>
                            <p><strong>State:</strong> {previewInvoice.customerState}</p>
                            <p><strong>GSTIN:</strong> {previewInvoice.customerGSTIN || 'N/A'}</p>
                          </div>
                          <div className="border p-4 rounded">
                            <h3 className="font-bold mb-2">Event Details</h3>
                            <p><strong>Booking Date:</strong> {new Date(previewInvoice.bookingDate).toLocaleDateString()}</p>
                            <p><strong>Event Date:</strong> {new Date(previewInvoice.eventDate).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {previewInvoice.startTime} - {previewInvoice.endTime}</p>
                            <p><strong>Manager:</strong> {previewInvoice.manager || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="border p-4 rounded mb-6">
                          <h3 className="font-bold mb-2">Items ({previewInvoice.items?.length || 0})</h3>
                          {previewInvoice.items && previewInvoice.items.length > 0 ? (
                            <table className="w-full border-collapse border">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border p-2">Srl</th>
                                  <th className="border p-2">Particular</th>
                                  <th className="border p-2">Qty</th>
                                  <th className="border p-2">Rent</th>
                                  <th className="border p-2">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {previewInvoice.items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="border p-2">{item.srl}</td>
                                    <td className="border p-2">{item.particular}</td>
                                    <td className="border p-2">{item.quantity}</td>
                                    <td className="border p-2">₹{item.rent}</td>
                                    <td className="border p-2">₹{item.amount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-red-500">No items found!</p>
                          )}
                        </div>
                        <div className="border p-4 rounded">
                          <h3 className="font-bold mb-2">Financial Details</h3>
                          <p><strong>Total Amount:</strong> ₹{previewInvoice.totalAmount}</p>
                          <p><strong>Advance:</strong> ₹{previewInvoice.advanceAmount}</p>
                          <p><strong>Balance:</strong> ₹{previewInvoice.balanceAmount}</p>
                          <p><strong>Amount in Words:</strong> {previewInvoice.invoiceValueInWords}</p>
                        </div>
                      </div>
                    </div>
                  ) : previewPdfUrl ? (
                    <div className="w-full h-full flex flex-col">
                      <iframe 
                        src={previewPdfUrl} 
                        className="w-full h-full border-0" 
                        title="Invoice PDF"
                        onLoad={() => console.log('PDF iframe loaded successfully')}
                        onError={(e) => console.error('PDF iframe error:', e)}
                      />
                      <div className="p-2 bg-gray-100 text-xs text-gray-600 text-center">
                        If the PDF doesn't display properly, try downloading it instead.
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">No preview available</div>
                  )}
              </div>
        </motion.div>
        </motion.div>
          )}
        </AnimatePresence>

        {/* Form Modal for create/edit */}
        <AnimatePresence>
          {formOpen && (
            <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <motion.div className="modal-content max-w-5xl w-[95vw] h-[90vh] overflow-y-auto flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">{editData ? 'Edit Invoice' : 'Create Invoice'}</h3>
                  <Button className="btn-ghost p-2" onClick={()=>setFormOpen(false)}><X className="h-4 w-4"/></Button>
                </div>
                {editData ? (
                  <InvoiceForm mode="edit" invoiceId={editInvoiceId || undefined} initialData={editData} onSaved={() => { setEditData(null); setFormOpen(false); fetchInvoices(); }} />
                ) : (
                  <InvoiceForm onSaved={() => { setFormOpen(false); fetchInvoices(); }} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
} 
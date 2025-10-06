"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminNavbar from "@/components/AdminNavbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Download, FileText, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Row { quotationNo: string; customer: string; itemName: string; qty: number; eventTime: string; area: string | null; vendor: string | null; remark: string | null }

export default function DeliveryReportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rowsByDate, setRowsByDate] = useState<Array<{date: string; rows: Row[]}>>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [search, setSearch] = useState("")
  const [vendorFilter, setVendorFilter] = useState("")
  const [areaFilter, setAreaFilter] = useState("")

  // Add entry modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [vendors, setVendors] = useState<Array<{ id: string; businessName: string }>>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")
  const [form, setForm] = useState({ eventDate: "", eventTime: "", area: "", vendor: "", remark: "" })

  useEffect(() => {
    if (session && !(session.user.role === 'ADMIN' || session.user.role === 'EMPLOYEE')) {
      router.push('/dashboard')
    }
  }, [session, router])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/delivery-report?start_date=${dateRange.start}&end_date=${dateRange.end}`)
      if (!res.ok) throw new Error('Failed to fetch delivery report')
      const json = await res.json()
      setRowsByDate(json.result || [])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { if (session?.user?.id) fetchReport() }, [session])

  // Derived filtered rows
  const filteredRowsByDate = useMemo(() => {
    const lc = search.toLowerCase()
    return rowsByDate.map(group => ({
      date: group.date,
      rows: group.rows.filter(r =>
        (!lc || r.customer.toLowerCase().includes(lc) || r.itemName.toLowerCase().includes(lc) || (r.quotationNo || '').includes(search)) &&
        (!vendorFilter || (r.vendor || '').toLowerCase().includes(vendorFilter.toLowerCase())) &&
        (!areaFilter || (r.area || '').toLowerCase().includes(areaFilter.toLowerCase()))
      )
    })).filter(g => g.rows.length > 0)
  }, [rowsByDate, search, vendorFilter, areaFilter])

  const overview = useMemo(() => {
    const totalEvents = filteredRowsByDate.reduce((s, g) => s + g.rows.length, 0)
    const uniqueCustomers = new Set<string>()
    filteredRowsByDate.forEach(g => g.rows.forEach(r => uniqueCustomers.add(r.customer)))
    return { totalEvents, customers: uniqueCustomers.size }
  }, [filteredRowsByDate])

  const openAddModal = async () => {
    try {
      setModalOpen(true)
      // fetch invoices within date range for convenience
      const res = await fetch(`/api/invoices`)
      if (res.ok) {
        const data = await res.json()
        setInvoices(data)
      }
      const vres = await fetch('/api/vendors')
      if (vres.ok) {
        const vjson = await vres.json()
        setVendors(vjson.vendors || [])
      }
      // default event date to start of filter
      setForm(prev => ({ ...prev, eventDate: dateRange.start }))
    } catch {}
  }

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoiceId) return
    try {
      const payload = {
        invoiceId: selectedInvoiceId,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        area: form.area,
        vendor: form.vendor,
        remark: form.remark,
      }
      const res = await fetch('/api/delivery-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to add delivery entry')
      setModalOpen(false)
      // refresh report
      fetchReport()
    } catch (e) {
      console.error(e)
    }
  }

  const exportCsv = () => {
    const header = ['Event Date','Sl.No.','Customer','Item Name','Qty','Event Time','Area','Vendor','Remark']
    const lines: string[] = [header.join(',')]
    filteredRowsByDate.forEach(g => {
      g.rows.forEach(r => {
        lines.push([
          g.date,
          r.quotationNo,
          '"'+r.customer.replaceAll('"','""')+'"',
          '"'+r.itemName.replaceAll('"','""')+'"',
          String(r.qty),
          r.eventTime || '',
          '"'+(r.area||'').replaceAll('"','""')+'"',
          '"'+(r.vendor||'').replaceAll('"','""')+'"',
          '"'+(r.remark||'').replaceAll('"','""')+'"',
        ].join(','))
      })
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `delivery-report-${dateRange.start}-to-${dateRange.end}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Delivery Report" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Delivery Report</h1>
            <p className="text-gray-600">Generate item delivery plan for events</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Input type="date" value={dateRange.start} onChange={(e)=>setDateRange(prev=>({...prev, start: e.target.value}))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 w-full sm:w-auto" />
            <Input type="date" value={dateRange.end} onChange={(e)=>setDateRange(prev=>({...prev, end: e.target.value}))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 w-full sm:w-auto" />
            <Button onClick={fetchReport} className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200 w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportCsv} className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200 w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          <Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search customer, item, or number" className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 w-full" />
          <Input value={vendorFilter} onChange={(e)=>setVendorFilter(e.target.value)} placeholder="Filter by vendor" className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 w-full" />
          <Input value={areaFilter} onChange={(e)=>setAreaFilter(e.target.value)} placeholder="Filter by area" className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 w-full" />
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/70 border-green-100"><CardContent className="p-4"><div className="text-sm text-gray-600">Events</div><div className="text-2xl font-bold text-gray-800">{overview.totalEvents}</div></CardContent></Card>
          <Card className="bg-white/70 border-blue-100"><CardContent className="p-4"><div className="text-sm text-gray-600">Customers</div><div className="text-2xl font-bold text-gray-800">{overview.customers}</div></CardContent></Card>
          <div></div>
        </div>

        {/* Report Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-0">
            {/* Desktop/tablet table */}
            <div className="overflow-x-auto hidden md:block">
              {filteredRowsByDate.length === 0 ? (
                <div className="text-center py-12 text-gray-500"><FileText className="h-6 w-6 inline mr-2"/>No data for selected range</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-gray-600">Sl.No.</th>
                      <th className="px-4 py-3 text-gray-600">Customer</th>
                      <th className="px-4 py-3 text-gray-600">Item Name</th>
                      <th className="px-4 py-3 text-gray-600">Qty</th>
                      <th className="px-4 py-3 text-gray-600">Event Time</th>
                      <th className="px-4 py-3 text-gray-600">Area</th>
                      <th className="px-4 py-3 text-gray-600">Vendor</th>
                      <th className="px-4 py-3 text-gray-600">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRowsByDate.map(group => (
                      <>
                        <tr key={`date-${group.date}`} className="bg-gray-100">
                          <td colSpan={8} className="px-4 py-2 font-semibold text-gray-700">Event Date : {new Date(group.date).toLocaleDateString()}</td>
                        </tr>
                        {group.rows.map((r, idx) => (
                          <tr key={`${group.date}-${idx}`} className="border-b border-gray-100">
                            <td className="px-4 py-2 text-gray-700">{r.quotationNo}</td>
                            <td className="px-4 py-2 text-gray-800">{r.customer}</td>
                            <td className="px-4 py-2 text-gray-800">{r.itemName}</td>
                            <td className="px-4 py-2">{r.qty}</td>
                            <td className="px-4 py-2">{r.eventTime}</td>
                            <td className="px-4 py-2">{r.area || '-'}</td>
                            <td className="px-4 py-2">{r.vendor || '-'}</td>
                            <td className="px-4 py-2">{r.remark || '-'}</td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Mobile list view */}
            <div className="md:hidden">
              {filteredRowsByDate.length === 0 ? (
                <div className="text-center py-10 text-gray-500"><FileText className="h-6 w-6 inline mr-2"/>No data</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredRowsByDate.map(group => (
                    <div key={`m-${group.date}`} className="py-2">
                      <div className="px-4 py-2 bg-gray-100 text-sm font-semibold text-gray-700 rounded">Event Date : {new Date(group.date).toLocaleDateString()}</div>
                      <div className="space-y-3 mt-3">
                        {group.rows.map((r, idx) => (
                          <div key={`m-${group.date}-${idx}`} className="mx-2 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="text-xs text-gray-500">#{r.quotationNo}</div>
                            <div className="font-medium text-gray-900">{r.customer}</div>
                            <div className="text-sm text-gray-700">{r.itemName} × {r.qty}</div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div><span className="text-gray-500">Time:</span> {r.eventTime || '-'}</div>
                              <div><span className="text-gray-500">Area:</span> {r.area || '-'}</div>
                              <div><span className="text-gray-500">Vendor:</span> {r.vendor || '-'}</div>
                              <div><span className="text-gray-500">Remark:</span> {r.remark || '-'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Entry Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-3xl" initial={{scale:0.95, y: 20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Add Delivery Entry</h3>
                  <Button variant="ghost" onClick={()=>setModalOpen(false)}>Close</Button>
                </div>
                <div className="p-6">
                  <form onSubmit={submitAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">Invoice</label>
                      <select value={selectedInvoiceId} onChange={(e)=>setSelectedInvoiceId(e.target.value)} className="w-full rounded-md border border-gray-300 py-2 px-3 focus:border-purple-500 focus:outline-none">
                        <option value="">Select an invoice</option>
                        {invoices.map((inv) => (
                          <option key={inv.id} value={inv.id}>{inv.quotationNo} - {inv.customerName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Event Date</label>
                      <Input type="date" value={form.eventDate} onChange={(e)=>setForm(prev=>({...prev, eventDate: e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Event Time</label>
                      <Input value={form.eventTime} onChange={(e)=>setForm(prev=>({...prev, eventTime: e.target.value}))} placeholder="e.g. 17:00:00" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Area</label>
                      <Input value={form.area} onChange={(e)=>setForm(prev=>({...prev, area: e.target.value}))} placeholder="Area / Address" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Vendor</label>
                      <select value={form.vendor} onChange={(e)=>setForm(prev=>({...prev, vendor: e.target.value}))} className="w-full rounded-md border border-gray-300 py-2 px-3 focus:border-purple-500 focus:outline-none">
                        <option value="">Select vendor</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.businessName}>{v.businessName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Remark</label>
                      <Input value={form.remark} onChange={(e)=>setForm(prev=>({...prev, remark: e.target.value}))} placeholder="Remark" />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
                      <Button type="button" variant="outline" onClick={()=>setModalOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save</Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}



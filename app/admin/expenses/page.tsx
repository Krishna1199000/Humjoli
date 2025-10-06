"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import AdminNavbar from "@/components/AdminNavbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { Calendar, Plus, RefreshCw, Wallet } from "lucide-react"

interface LedgerEntry {
  id: string
  type: "CREDIT" | "DEBIT"
  amount: number // paise
  reason: string
  counterParty: string | null
  date: string
  createdAt: string
}

export default function DailyExpensePage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'range'>('day')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [formOpen, setFormOpen] = useState(false)

  const [formData, setFormData] = useState({
    type: "DEBIT" as "CREDIT" | "DEBIT",
    amount: "",
    counterParty: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Guard
  useEffect(() => {
    if (session && !(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE")) {
      router.push("/dashboard")
    }
  }, [session, router])

  const getComputedRange = () => {
    if (viewMode === 'day') {
      return { start: selectedDate, end: selectedDate }
    }
    if (viewMode === 'week') {
      const d = new Date(selectedDate)
      const day = d.getDay() || 7 // 1-7 Mon-Sun
      const monday = new Date(d)
      monday.setDate(d.getDate() - (day - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] }
    }
    if (viewMode === 'month') {
      const d = new Date(selectedDate)
      const first = new Date(d.getFullYear(), d.getMonth(), 1)
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      return { start: first.toISOString().split('T')[0], end: last.toISOString().split('T')[0] }
    }
    return dateRange
  }

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const { start, end } = getComputedRange()
      const res = await fetch(`/api/account-entries?start_date=${start}&end_date=${end}`)
      if (!res.ok) throw new Error("Failed to fetch entries")
      const json = await res.json()
      setEntries(json.entries || [])
    } catch (e) {
      console.error(e)
      toast.error("Failed to load expenses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchEntries()
    }
  }, [session, selectedDate, viewMode, dateRange])

  const totalForDay = useMemo(() => {
    const credit = entries.filter(e => e.type === "CREDIT").reduce((s, e) => s + e.amount, 0)
    const debit = entries.filter(e => e.type === "DEBIT").reduce((s, e) => s + e.amount, 0)
    return { credit, debit, net: credit - debit }
  }, [entries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const rupees = parseFloat(formData.amount)
      if (isNaN(rupees) || rupees <= 0) throw new Error("Enter a valid amount")
      if (!formData.description.trim()) throw new Error("Description is required")
      const res = await fetch("/api/account-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          amount: rupees, // API converts to paise
          currency: "INR",
          reason: formData.description.trim(),
          counterParty: formData.counterParty || undefined,
          date: formData.date,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save entry")
      }
      toast.success("Entry added")
      // reset amount and description
      setFormData(prev => ({ ...prev, amount: "", description: "" }))
      setFormOpen(false)
      fetchEntries()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add entry")
    } finally {
      setSubmitting(false)
    }
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Daily Expense" />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Expense</h1>
            <p className="text-gray-600">Record and review credits/debits by day, week, or month</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="range">Date Range</option>
            </select>
            {viewMode === 'day' && (
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400" />
            )}
            {viewMode === 'week' && (
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400" />
            )}
            {viewMode === 'month' && (
              <Input type="month" value={selectedDate.slice(0,7)} onChange={(e) => setSelectedDate(e.target.value + '-01')} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400" />
            )}
            {viewMode === 'range' && (
              <>
                <Input type="date" value={dateRange.start} onChange={(e)=>setDateRange(prev=>({...prev, start: e.target.value}))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400" />
                <Input type="date" value={dateRange.end} onChange={(e)=>setDateRange(prev=>({...prev, end: e.target.value}))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400" />
              </>
            )}
            <Button onClick={fetchEntries} className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => { setFormOpen(true); setFormData(prev => ({ ...prev, date: selectedDate })) }} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Table of Entries */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 mb-6">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-gray-600">Type</th>
                    <th className="px-4 py-3 text-gray-600">Counter Party</th>
                    <th className="px-4 py-3 text-gray-600">Description</th>
                    <th className="px-4 py-3 text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-gray-600">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Loading…</td></tr>
                  ) : entries.length === 0 ? (
                    <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No entries</td></tr>
                  ) : (
                    entries.map(e => (
                      <tr key={e.id} className="border-b border-gray-100">
                        <td className="px-4 py-3"><span className={e.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>{e.type}</span></td>
                        <td className="px-4 py-3 text-gray-800">{e.counterParty || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{e.reason}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">₹{(e.amount / 100).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(e.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary & List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-green-600 font-medium">Credits</h3>
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-700">₹{(totalForDay.credit / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-red-600 font-medium">Debits</h3>
                <Wallet className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-700">₹{(totalForDay.debit / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-blue-600 font-medium">Net</h3>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-700">₹{(totalForDay.net / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100 mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Entries for {(() => { const r = getComputedRange(); return r.start === r.end ? r.start : `${r.start} to ${r.end}` })()}</h3>
              </div>
            </div>
            <div className="text-sm text-gray-600">Use the table above to view and verify entries.</div>
          </CardContent>
        </Card>

        {/* Form Modal */}
        <AnimatePresence>
          {formOpen && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-2xl" initial={{scale:0.95, y: 20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Add Expense Entry</h3>
                  <Button variant="ghost" onClick={()=>setFormOpen(false)}>Close</Button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <Label>Type</Label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                      >
                        <option value="DEBIT">Debit</option>
                        <option value="CREDIT">Credit</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Amount (₹)</Label>
                      <Input value={formData.amount} onChange={(e)=>setFormData(prev=>({...prev, amount: e.target.value}))} type="number" step="0.01" min="0" placeholder="0.00" className="mt-1" required />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Date</Label>
                      <Input type="date" value={formData.date} onChange={(e)=>setFormData(prev=>({...prev, date: e.target.value}))} className="mt-1" required />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Counter Party</Label>
                      <Input value={formData.counterParty} onChange={(e)=>setFormData(prev=>({...prev, counterParty: e.target.value}))} placeholder="Name (optional)" className="mt-1" />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Description</Label>
                      <Input value={formData.description} onChange={(e)=>setFormData(prev=>({...prev, description: e.target.value}))} placeholder="Describe the transaction" className="mt-1" required />
                    </div>
                    <div className="md:col-span-6 flex justify-end space-x-3 mt-2">
                      <Button type="button" variant="outline" onClick={()=>setFormOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {submitting ? 'Saving…' : 'Save Entry'}
                      </Button>
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



"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"

interface AccountEntry {
  id: string
  type: "CREDIT" | "DEBIT"
  amount: number
  currency: string
  reason: string
  counterParty: string | null
  date: string
  createdBy: string | null
  createdAt: string
}

export default function AccountsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<AccountEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [entryType, setEntryType] = useState<"CREDIT" | "DEBIT" | null>(null)
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  })

  // Redirect if not admin/employee
  useEffect(() => {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EMPLOYEE") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch entries
  const fetchEntries = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
        ...(entryType && { type: entryType }),
        ...(dateRange.start && { start_date: dateRange.start }),
        ...(dateRange.end && { end_date: dateRange.end })
      })

      const response = await fetch(`/api/account-entries?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch entries')
      
      const data = await response.json()
      setEntries(data.entries)
      setTotalPages(data.pagination.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Failed to fetch entries')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchEntries()
    }
  }, [session, searchTerm, entryType, dateRange])

  // Handle entry deletion
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      setIsDeleting(entryId)
      const response = await fetch(`/api/account-entries/${entryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete entry')
      }

      toast.success('Entry deleted successfully')
      fetchEntries(currentPage)
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete entry')
    } finally {
      setIsDeleting(null)
    }
  }

  // Calculate totals
  const totals = entries.reduce((acc, entry) => {
    if (entry.type === 'CREDIT') {
      acc.credits += entry.amount
    } else {
      acc.debits += entry.amount
    }
    return acc
  }, { credits: 0, debits: 0 })

  const balance = totals.credits - totals.debits

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Account Ledger" />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
                Account Ledger
              </h1>
              <p className="text-gray-600 text-lg">
                Track and manage financial transactions
              </p>
            </div>
            <Link href="/admin/accounts/new">
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="mr-2 h-5 w-5" />
                Add New Entry
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-green-600 font-medium">Total Credits</h3>
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-700">
                ₹{(totals.credits / 100).toLocaleString()}
              </p>
              <p className="text-sm text-green-500">
                {entries.filter(e => e.type === 'CREDIT').length} entries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-red-600 font-medium">Total Debits</h3>
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-700">
                ₹{(totals.debits / 100).toLocaleString()}
              </p>
              <p className="text-sm text-red-500">
                {entries.filter(e => e.type === 'DEBIT').length} entries
              </p>
            </CardContent>
          </Card>

          <Card className={balance >= 0 ? "bg-blue-50" : "bg-amber-50"}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className={balance >= 0 ? "text-blue-600" : "text-amber-600"}>
                  Current Balance
                </h3>
                <DollarSign className={`h-5 w-5 ${
                  balance >= 0 ? "text-blue-500" : "text-amber-500"
                }`} />
              </div>
              <p className={`text-2xl font-bold ${
                balance >= 0 ? "text-blue-700" : "text-amber-700"
              }`}>
                ₹{(Math.abs(balance) / 100).toLocaleString()}
              </p>
              <p className={`text-sm ${
                balance >= 0 ? "text-blue-500" : "text-amber-500"
              }`}>
                {balance >= 0 ? "Positive Balance" : "Negative Balance"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by reason or counter party..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                  />
                </div>

                <select
                  value={entryType || ""}
                  onChange={(e) => setEntryType(e.target.value as "CREDIT" | "DEBIT" | null)}
                  className="h-10 rounded-lg border border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                >
                  <option value="">All Entries</option>
                  <option value="CREDIT">Credits Only</option>
                  <option value="DEBIT">Debits Only</option>
                </select>

                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                  placeholder="Start Date"
                />

                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                  placeholder="End Date"
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    setDateRange({ start: "", end: "" })
                    setEntryType(null)
                    setSearchTerm("")
                  }}
                  variant="outline"
                  className="mr-2"
                >
                  Clear Filters
                </Button>

                <Button
                  onClick={() => fetchEntries(1)}
                  className="bg-purple-100 text-purple-600 hover:bg-purple-200 border border-purple-200"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No entries found</p>
              <p className="text-gray-500">Add a new entry to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={entry.type === 'CREDIT' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                            }>
                              {entry.type}
                            </Badge>
                          <p className="text-lg font-semibold text-gray-800">
                            ₹{(entry.amount / 100).toLocaleString()}
                          </p>
                          </div>
                          <p className="text-gray-600">{entry.reason}</p>
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                          <div className="flex items-center space-x-2 text-gray-500 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          {entry.counterParty && (
                            <div className="flex items-center space-x-2 text-gray-500">
                              <User className="h-4 w-4" />
                              <span>{entry.counterParty}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end space-x-2">
                        <Link href={`/admin/accounts/${entry.id}`}>
                          <Button variant="outline" className="text-purple-600 border-purple-200">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/accounts/${entry.id}/edit`}>
                          <Button variant="outline" className="text-purple-600 border-purple-200">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteEntry(entry.id)}
                            disabled={isDeleting === entry.id}
                          >
                            {isDeleting === entry.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => fetchEntries(page)}
                  variant={page === currentPage ? "default" : "outline"}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-200
                    ${page === currentPage 
                      ? "bg-purple-600 text-white" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                    }
                  `}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
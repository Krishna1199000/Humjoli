"use client"

import { useEffect, useMemo, useState } from 'react'
import AdminNavbar from '@/components/AdminNavbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'
import { exportSalesReportXLSX } from '@/utils/exportExcel'
import { Download, Calendar } from 'lucide-react'

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

export default function SalesReportPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>({ summary: { totalSales: 0, invoiceCount: 0, avgInvoice: 0 }, trend: [], byCustomer: [], byItem: [], invoices: [] })

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set('month', String(month))
    params.set('year', String(year))
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return params.toString()
  }, [month, year, startDate, endDate])

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch(`/api/sales-report?${query}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [query])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <AdminNavbar title="Sales Report" />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
          <Button onClick={() => exportSalesReportXLSX(data.summary, data.invoices, `SalesReport-${year}-${String(month).padStart(2,'0')}.xlsx`)}>
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6"><CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={month} onChange={(e)=>setMonth(parseInt(e.target.value))} className="input-modern">
              {months.map((m, i)=>(<option key={m} value={i+1}>{m}</option>))}
            </select>
            <select value={year} onChange={(e)=>setYear(parseInt(e.target.value))} className="input-modern">
              {Array.from({length: 6}).map((_,i)=>{const y=now.getFullYear()-i;return <option value={y} key={y}>{y}</option>})}
            </select>
            <Input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="input-modern" />
            <Input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="input-modern" />
          </div>
        </CardContent></Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-soft"><CardContent className="p-6"><p className="text-sm text-gray-600">Total Sales</p><p className="text-3xl font-bold">₹{data.summary.totalSales?.toLocaleString('en-IN')}</p></CardContent></Card>
          <Card className="shadow-soft"><CardContent className="p-6"><p className="text-sm text-gray-600">Invoices</p><p className="text-3xl font-bold">{data.summary.invoiceCount}</p></CardContent></Card>
          <Card className="shadow-soft"><CardContent className="p-6"><p className="text-sm text-gray-600">Avg Invoice</p><p className="text-3xl font-bold">₹{Math.round(data.summary.avgInvoice).toLocaleString('en-IN')}</p></CardContent></Card>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-soft xl:col-span-2"><CardContent className="p-6">
            <h3 className="font-semibold mb-4">Sales Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>
          <Card className="shadow-soft"><CardContent className="p-6">
            <h3 className="font-semibold mb-4">By Customer</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.byCustomer} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60} label>
                    {data.byCustomer?.map((_: any, idx: number) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="shadow-soft"><CardContent className="p-6">
            <h3 className="font-semibold mb-4">Sales by Item</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byItem}>
                  <XAxis dataKey="name" hide={false} tick={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>
        </div>

        {/* Table */}
        <Card className="shadow-soft"><CardContent className="p-6">
          <h3 className="font-semibold mb-4">Invoices</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2">Invoice No</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices?.map((row: any) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.quotationNo}</td>
                    <td className="px-4 py-2">{row.customerName}</td>
                    <td className="px-4 py-2">{[row.customerAddress, row.customerState].filter(Boolean).join(', ')}</td>
                    <td className="px-4 py-2">{new Date(row.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-2">{row.time || ''}</td>
                    <td className="px-4 py-2">₹{row.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      </main>
    </div>
  )
}


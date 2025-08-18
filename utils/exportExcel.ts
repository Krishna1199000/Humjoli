import ExcelJS from 'exceljs'

export async function exportSalesReportXLSX(
  summary: { totalSales: number; invoiceCount: number; avgInvoice: number },
  invoices: Array<{ quotationNo: string; customerName: string; customerAddress?: string; customerState?: string; date: string | Date; time?: string; amount: number; status: string }>,
  fileName: string
) {
  const workbook = new ExcelJS.Workbook()
  const summarySheet = workbook.addWorksheet('Summary')
  const detailSheet = workbook.addWorksheet('Invoices')

  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 25 },
  ]

  summarySheet.addRows([
    { metric: 'Total Sales', value: summary.totalSales },
    { metric: 'Invoice Count', value: summary.invoiceCount },
    { metric: 'Average Invoice', value: summary.avgInvoice },
  ])

  detailSheet.columns = [
    { header: 'Invoice No', key: 'quotationNo', width: 16 },
    { header: 'Customer', key: 'customerName', width: 24 },
    { header: 'Location', key: 'location', width: 24 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Time', key: 'time', width: 12 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ]

  invoices.forEach((inv) => {
    detailSheet.addRow({
      quotationNo: inv.quotationNo,
      customerName: inv.customerName,
      location: [inv.customerAddress, inv.customerState].filter(Boolean).join(', '),
      date: new Date(inv.date).toLocaleDateString('en-IN'),
      time: inv.time || '',
      amount: inv.amount,
      status: inv.status,
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}


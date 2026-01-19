"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, FileSpreadsheet } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Transaction, Expense } from "@/lib/types"

interface ReportsCenterProps {
  transactions: Transaction[]
  expenses: Expense[]
  allMonths: string[]
}

export function ReportsCenter({ transactions, expenses, allMonths }: ReportsCenterProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(allMonths[0] || "")

  const generateMonthlyPDF = () => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text("THE BOYS HOSTEL", 105, 20, { align: "center" })
    doc.setFontSize(16)
    doc.text("Monthly Financial Summary", 105, 30, { align: "center" })
    doc.setFontSize(12)
    doc.text(selectedMonth, 105, 38, { align: "center" })
    
    // Filter data for selected month
    const monthTransactions = transactions.filter((t) => t.month === selectedMonth && t.status === "Paid")
    const monthExpenses = expenses.filter((e) => e.month === selectedMonth)
    
    const totalRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    
    // Summary Section
    doc.setFontSize(14)
    doc.text("Financial Overview", 14, 50)
    
    doc.setFontSize(11)
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, 60)
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, 68)
    doc.setFont(undefined, "bold")
    doc.text(`Net Profit: $${netProfit.toFixed(2)}`, 20, 76)
    doc.setFont(undefined, "normal")
    
    // Top 5 Expenses
    const sortedExpenses = [...monthExpenses].sort((a, b) => b.amount - a.amount).slice(0, 5)
    
    doc.setFontSize(14)
    doc.text("Top 5 Expenses", 14, 90)
    
    autoTable(doc, {
      startY: 95,
      head: [["Category", "Description", "Amount", "Date"]],
      body: sortedExpenses.map((e) => [
        e.category,
        e.description,
        `$${e.amount.toFixed(2)}`,
        new Date(e.date).toLocaleDateString(),
      ]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
    })
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    doc.setFontSize(10)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      14,
      doc.internal.pageSize.height - 10
    )
    doc.text(
      `Page ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    )
    
    doc.save(`Monthly_Summary_${selectedMonth.replace(/ /g, "_")}.pdf`)
  }

  const exportLedgerToCSV = () => {
    const monthTransactions = transactions.filter((t) => t.month === selectedMonth)
    
    // CSV Headers
    const headers = ["Date", "Type", "Amount", "Status", "Month", "Description"]
    
    // CSV Rows
    const rows = monthTransactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.amount,
      t.status,
      t.month,
      t.description || "",
    ])
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `Transaction_Ledger_${selectedMonth.replace(/ /g, "_")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Statements & Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Month Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">
              Select Month:
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[280px] bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {allMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Monthly Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a comprehensive PDF report including revenue, expenses, and top spending categories.
                </p>
                <Button onClick={generateMonthlyPDF} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  Export Transaction Ledger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all transactions for the selected month to a CSV file for further analysis.
                </p>
                <Button onClick={exportLedgerToCSV} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

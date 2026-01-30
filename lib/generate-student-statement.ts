import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Student, Transaction } from "./types"

export function generateStudentStatement(
  student: Student,
  transactions: Transaction[],
  roomNumber?: string
) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text("THE BOYS HOSTEL", 105, 20, { align: "center" })
  doc.setFontSize(14)
  doc.text("Student Account Statement", 105, 30, { align: "center" })
  
  // Student Information
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Student Details", 14, 45)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  
  doc.text(`Name: ${student.name}`, 20, 53)
  doc.text(`Phone: ${student.phone}`, 20, 60)
  if (student.email) {
    doc.text(`Email: ${student.email}`, 20, 67)
  }
  if (roomNumber) {
    doc.text(`Room: ${roomNumber}`, 20, student.email ? 74 : 67)
  }
  
  // Financial Summary
  const totalPaid = transactions
    .filter((t) => t.status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalUnpaid = transactions
    .filter((t) => t.status === "Unpaid")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalAmount = totalPaid + totalUnpaid
  
  const summaryY = roomNumber ? (student.email ? 88 : 81) : (student.email ? 81 : 74)
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Account Summary", 14, summaryY)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  
  doc.text(`Total Charges: $${totalAmount.toFixed(2)}`, 20, summaryY + 8)
  doc.setTextColor(34, 197, 94) // Green
  doc.text(`Total Paid: $${totalPaid.toFixed(2)}`, 20, summaryY + 15)
  
  if (totalUnpaid > 0) {
    doc.setTextColor(239, 68, 68) // Red
    doc.text(`Outstanding Balance: $${totalUnpaid.toFixed(2)}`, 20, summaryY + 22)
  } else {
    doc.setTextColor(34, 197, 94) // Green
    doc.text("Account Status: All Cleared", 20, summaryY + 22)
  }
  
  doc.setTextColor(0, 0, 0) // Reset to black
  
  // Transaction History
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Transaction History", 14, summaryY + 36)
  
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  autoTable(doc, {
    startY: summaryY + 40,
    head: [["Date", "Type", "Description", "Amount", "Status"]],
    body: sortedTransactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.description || t.month,
      `$${t.amount.toFixed(2)}`,
      t.status,
    ]),
    theme: "striped",
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 9 },
    columnStyles: {
      4: {
        cellWidth: 25,
        halign: "center",
      },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const status = data.cell.raw as string
        if (status === "Paid") {
          data.cell.styles.textColor = [34, 197, 94]
          data.cell.styles.fontStyle = "bold"
        } else if (status === "Unpaid") {
          data.cell.styles.textColor = [239, 68, 68]
          data.cell.styles.fontStyle = "bold"
        }
      }
    },
  })
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
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
  
  // Save
  doc.save(`Statement_${student.name.replace(/ /g, "_")}_${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`)
}

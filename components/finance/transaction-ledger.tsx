"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, FileText } from "lucide-react"
import { EditRentDialog } from "./edit-rent-dialog"
import { generateStudentStatement } from "@/lib/generate-student-statement"
import type { Transaction, Student, Room } from "@/lib/types"

interface TransactionLedgerProps {
  transactions: Transaction[]
  students: Student[]
  rooms?: Room[]
  onMarkAsPaid: (transactionId: string) => void
  onUpdateRent: (transactionId: string, newAmount: number) => void
}

export function TransactionLedger({ transactions, students, rooms, onMarkAsPaid, onUpdateRent }: TransactionLedgerProps) {
  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    return student?.name || "Unknown"
  }

  const handleGenerateStatement = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    const studentTransactions = transactions.filter((t) => t.studentId === studentId)
    const room = rooms?.find((r) => r.id === student.roomId)
    
    generateStudentStatement(student, studentTransactions, room?.roomNumber)
  }

  // Sort by date descending
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Student</TableHead>
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Month</TableHead>
            <TableHead className="text-muted-foreground text-right">Amount</TableHead>
            <TableHead className="text-muted-foreground text-center">Status</TableHead>
            <TableHead className="text-muted-foreground text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No transactions yet
              </TableCell>
            </TableRow>
          ) : (
            sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="border-border">
                <TableCell className="text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium text-foreground">{getStudentName(transaction.studentId)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      transaction.type === "Rent"
                        ? "border-primary/50 text-primary"
                        : transaction.type === "Penalty" || transaction.type === "Damage"
                          ? "border-danger/50 text-danger"
                          : "border-accent/50 text-accent"
                    }
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{transaction.month}</TableCell>
                <TableCell className="text-right font-medium text-foreground">${transaction.amount}</TableCell>
                <TableCell className="text-center">
                  {transaction.status === "Paid" ? (
                    <Badge className="bg-success/20 text-success border-success/30">Paid</Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-danger/20 text-danger border-danger/30">
                      Unpaid
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleGenerateStatement(transaction.studentId)}
                      className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                      title="Generate Statement"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    {transaction.status === "Unpaid" && transaction.type === "Rent" && (
                      <EditRentDialog transaction={transaction} onUpdateRent={onUpdateRent} />
                    )}
                    {transaction.status === "Unpaid" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onMarkAsPaid(transaction.id)}
                        className="h-8 px-2 text-success hover:text-success hover:bg-success/10"
                        title="Mark as Paid"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

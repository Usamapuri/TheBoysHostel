"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import type { Expense } from "@/lib/types"

interface ExpensesTableProps {
  expenses: Expense[]
  onDeleteExpense: (expenseId: string) => void
}

export function ExpensesTable({ expenses, onDeleteExpense }: ExpensesTableProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Utility":
        return "border-blue-500/50 text-blue-400"
      case "Maintenance":
        return "border-yellow-500/50 text-yellow-400"
      case "Salary":
        return "border-purple-500/50 text-purple-400"
      case "Other":
        return "border-gray-500/50 text-gray-400"
      default:
        return ""
    }
  }

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Category</TableHead>
            <TableHead className="text-muted-foreground">Description</TableHead>
            <TableHead className="text-muted-foreground text-right">Amount</TableHead>
            <TableHead className="text-muted-foreground text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No expenses recorded
              </TableCell>
            </TableRow>
          ) : (
            sortedExpenses.map((expense) => (
              <TableRow key={expense.id} className="border-border">
                <TableCell className="text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getCategoryColor(expense.category)}>
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground">{expense.description}</TableCell>
                <TableCell className="text-right font-medium text-danger">${expense.amount}</TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="h-8 px-2 text-danger hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

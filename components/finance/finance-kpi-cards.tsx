"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react"

interface FinanceKPICardsProps {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  outstandingDues: number
}

export function FinanceKPICards({ totalRevenue, totalExpenses, netProfit, outstandingDues }: FinanceKPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalRevenue}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">${totalExpenses}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-danger" />
          </div>
        </CardContent>
      </Card>

      <Card className={`bg-card border-border ${netProfit >= 0 ? "border-success/30" : "border-danger/30"}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-success" : "text-danger"}`}>${netProfit}</p>
            </div>
            <DollarSign className={`h-8 w-8 ${netProfit >= 0 ? "text-success" : "text-danger"}`} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border border-danger/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Dues</p>
              <p className="text-2xl font-bold text-danger">${outstandingDues}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-danger" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

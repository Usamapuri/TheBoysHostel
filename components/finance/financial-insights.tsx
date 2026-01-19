"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, PieChartIcon } from "lucide-react"
import type { Transaction, Expense } from "@/lib/types"

interface FinancialInsightsProps {
  transactions: Transaction[]
  expenses: Expense[]
}

export function FinancialInsights({ transactions, expenses }: FinancialInsightsProps) {
  // Generate last 6 months of data
  const getMonthlyData = () => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      
      const monthIncome = transactions
        .filter((t) => t.month === monthYear && t.status === "Paid")
        .reduce((sum, t) => sum + t.amount, 0)
      
      const monthExpenses = expenses
        .filter((e) => e.month === monthYear)
        .reduce((sum, e) => sum + e.amount, 0)
      
      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        income: monthIncome,
        expenses: monthExpenses,
      })
    }
    
    return months
  }

  // Calculate expense distribution by category
  const getExpenseDistribution = () => {
    const distribution: Record<string, number> = {}
    
    expenses.forEach((expense) => {
      distribution[expense.category] = (distribution[expense.category] || 0) + expense.amount
    })
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const monthlyData = getMonthlyData()
  const expenseDistribution = getExpenseDistribution()

  const COLORS = {
    income: "#22c55e",
    expenses: "#ef4444",
    Utility: "#3b82f6",
    Maintenance: "#f59e0b",
    Salary: "#8b5cf6",
    Other: "#6b7280",
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ${entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Income vs Expenses */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: "14px", color: "#9ca3af" }}
                />
                <Bar dataKey="income" fill={COLORS.income} name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill={COLORS.expenses} name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Expense Distribution by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: "14px", color: "#9ca3af" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BarChart3, Building2 } from "lucide-react"
import type { Transaction, Expense, Room, Location } from "@/lib/types"

interface AnalyticsSectionProps {
  transactions: Transaction[]
  expenses: Expense[]
  rooms: Room[]
  locations: Location[]
  onLocationClick?: (locationName: string) => void
}

export function AnalyticsSection({ transactions, expenses, rooms, locations, onLocationClick }: AnalyticsSectionProps) {
  // Generate last 6 months income vs expenses data
  const getMonthlyTrends = () => {
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

  // Calculate occupancy by location
  const getOccupancyByLocation = () => {
    const occupancyData: Record<string, { total: number; occupied: number }> = {}
    
    rooms.forEach((room) => {
      const location = locations.find((loc) => loc.id === room.locationId)
      const locationName = location?.name || "Unknown"
      
      if (!occupancyData[locationName]) {
        occupancyData[locationName] = { total: 0, occupied: 0 }
      }
      
      occupancyData[locationName].total += room.beds.length
      occupancyData[locationName].occupied += room.beds.filter((b) => b.isOccupied).length
    })
    
    return Object.entries(occupancyData).map(([name, data]) => ({
      name,
      value: data.occupied,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
    }))
  }

  const monthlyData = getMonthlyTrends()
  const occupancyData = getOccupancyByLocation()

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"]

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

  const DonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} / {data.total} beds ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Income vs Expenses Line Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Income vs Expenses (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
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
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 4 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Occupancy by Location Donut Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Occupancy by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                onClick={(data) => onLocationClick && onLocationClick(data.name)}
                cursor="pointer"
              >
                {occupancyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {occupancyData.map((entry, index) => (
              <div 
                key={entry.name} 
                className="flex items-center justify-between text-sm cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                onClick={() => onLocationClick && onLocationClick(entry.name)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-foreground">{entry.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {entry.value}/{entry.total} ({entry.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

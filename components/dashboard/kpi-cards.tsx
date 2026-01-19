"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, AlertCircle, Wrench } from "lucide-react"

interface KPICardsProps {
  occupancyRate: number
  totalBeds: number
  occupiedBeds: number
  vacantBeds: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  overdueDues: number
  overdueStudentsCount: number
  highPriorityMaintenance: number
  pendingMaintenance: number
  onNavigateToStudents?: () => void
  onNavigateToMaintenance?: () => void
}

export function KPICards({
  occupancyRate,
  totalBeds,
  occupiedBeds,
  vacantBeds,
  totalRevenue,
  totalExpenses,
  netProfit,
  overdueDues,
  overdueStudentsCount,
  highPriorityMaintenance,
  pendingMaintenance,
  onNavigateToStudents,
  onNavigateToMaintenance,
}: KPICardsProps) {
  const isProfitable = netProfit >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Occupancy Card (Contextual) */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Occupancy</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {occupiedBeds} / {totalBeds} Beds
          </div>
          <p className="text-xs text-muted-foreground">{vacantBeds} beds currently vacant</p>
          <Progress value={occupancyRate} className="h-1.5" />
        </CardContent>
      </Card>

      {/* 2. Profitability Card (Replacing Collection Card) */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Net Profit</CardTitle>
          <TrendingUp className={`h-4 w-4 ${isProfitable ? "text-success" : "text-danger"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfitable ? "text-success" : "text-danger"}`}>
            ${Math.abs(netProfit).toFixed(0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Rev: ${totalRevenue} | Exp: ${totalExpenses}
          </p>
        </CardContent>
      </Card>

      {/* 3. Defaulter Card (Action-Oriented) - Clickable */}
      <Card
        className="bg-card border-border cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onNavigateToStudents}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Dues</CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">${overdueDues}</div>
          <p className="text-xs text-muted-foreground">
            From {overdueStudentsCount} student(s) currently late
          </p>
        </CardContent>
      </Card>

      {/* 4. Maintenance Card (Priority-Focused) - Clickable */}
      <Card
        className="bg-card border-border cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onNavigateToMaintenance}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {highPriorityMaintenance > 0 ? `${highPriorityMaintenance} Urgent Repairs` : "Maintenance"}
          </CardTitle>
          <Wrench className={`h-4 w-4 ${highPriorityMaintenance > 0 ? "text-danger" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${highPriorityMaintenance > 0 ? "text-danger" : "text-foreground"}`}>
            {highPriorityMaintenance > 0 ? highPriorityMaintenance : pendingMaintenance}
          </div>
          <p className="text-xs text-muted-foreground">Total of {pendingMaintenance} tasks in queue</p>
        </CardContent>
      </Card>
    </div>
  )
}

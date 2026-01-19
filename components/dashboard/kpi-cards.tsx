"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, AlertCircle, Wrench } from "lucide-react"

interface KPICardsProps {
  occupancyRate: number
  totalCollected: number
  totalOutstanding: number
  pendingMaintenance: number
}

export function KPICards({ occupancyRate, totalCollected, totalOutstanding, pendingMaintenance }: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Occupancy</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{occupancyRate}%</div>
          <p className="text-xs text-muted-foreground">of total capacity</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Collected This Month</CardTitle>
          <DollarSign className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">${totalCollected}</div>
          <p className="text-xs text-muted-foreground">total payments received</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">${totalOutstanding}</div>
          <p className="text-xs text-muted-foreground">pending payments</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Maintenance</CardTitle>
          <Wrench className="h-4 w-4 text-danger" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{pendingMaintenance}</div>
          <p className="text-xs text-muted-foreground">requests to process</p>
        </CardContent>
      </Card>
    </div>
  )
}

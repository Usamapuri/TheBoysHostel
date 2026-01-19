"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, DollarSign } from "lucide-react"

interface BillingActionsProps {
  onGenerateBills: () => void
  occupiedBeds: number
}

export function BillingActions({ onGenerateBills, occupiedBeds }: BillingActionsProps) {
  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Monthly Billing
        </CardTitle>
        <CardDescription className="text-muted-foreground">Generate rent bills for {currentMonth}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div>
            <p className="text-sm font-medium text-foreground">Occupied Beds</p>
            <p className="text-xs text-muted-foreground">Students to be billed</p>
          </div>
          <span className="text-2xl font-bold text-foreground">{occupiedBeds}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div>
            <p className="text-sm font-medium text-foreground">Monthly Rent</p>
            <p className="text-xs text-muted-foreground">Per bed</p>
          </div>
          <span className="text-2xl font-bold text-foreground">$500</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div>
            <p className="text-sm font-medium text-foreground">Total Billable</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
          <span className="text-2xl font-bold text-primary">${occupiedBeds * 500}</span>
        </div>
        <Button onClick={onGenerateBills} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <DollarSign className="h-4 w-4 mr-2" />
          Generate Monthly Bills
        </Button>
      </CardContent>
    </Card>
  )
}

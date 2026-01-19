"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface MonthPickerProps {
  selectedMonth: string | null
  onMonthChange: (month: string | null) => void
  availableMonths: string[]
}

export function MonthPicker({ selectedMonth, onMonthChange, availableMonths }: MonthPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <Select value={selectedMonth || "all"} onValueChange={(val) => onMonthChange(val === "all" ? null : val)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Transactions</SelectItem>
          {availableMonths.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedMonth && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}

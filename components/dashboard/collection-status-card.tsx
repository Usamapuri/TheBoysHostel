"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Bell } from "lucide-react"

interface CollectionStatusCardProps {
  totalCollected: number
  totalExpected: number
  onRemindDefaulters: () => void
}

export function CollectionStatusCard({ 
  totalCollected, 
  totalExpected,
  onRemindDefaulters 
}: CollectionStatusCardProps) {
  const percentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
  const remaining = Math.max(0, totalExpected - totalCollected)
  
  // SVG Circle Progress
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Collection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Circular Progress */}
          <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#374151"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#22c55e"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{percentage}%</span>
              <span className="text-xs text-muted-foreground">Collected</span>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Collected:</span>
              <span className="text-lg font-semibold text-success">${totalCollected}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expected:</span>
              <span className="text-lg font-semibold text-foreground">${totalExpected}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Remaining:</span>
              <span className="text-lg font-semibold text-danger">${remaining}</span>
            </div>
          </div>

          {/* Remind Defaulters Button */}
          {remaining > 0 && (
            <Button 
              onClick={onRemindDefaulters}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Bell className="h-4 w-4 mr-2" />
              Remind Defaulters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, DollarSign, Wrench, LogOut, MessageCircle } from "lucide-react"
import Link from "next/link"
import type { Student, Transaction, MaintenanceTask } from "@/lib/types"

interface PriorityAlertsProps {
  students: Student[]
  transactions: Transaction[]
  maintenanceTasks: MaintenanceTask[]
}

interface Alert {
  id: string
  type: "payment" | "maintenance" | "checkout"
  title: string
  description: string
  severity: "high" | "medium"
  link?: string
  studentId?: string
  studentPhone?: string
  taskId?: string
  unpaidAmount?: number
}

export function PriorityAlerts({ students, transactions, maintenanceTasks }: PriorityAlertsProps) {
  const [assigningTask, setAssigningTask] = useState<string | null>(null)
  const alerts: Alert[] = []
  const now = new Date()
  
  // 1. Overdue transactions (Unpaid AND past due date)
  const overdueTransactions = transactions.filter((t) => {
    if (t.status !== "Unpaid") return false
    const dueDate = t.dueDate ? new Date(t.dueDate) : new Date(t.date)
    return dueDate < now
  })
  
  const overdueStudentIds = new Set(overdueTransactions.map((t) => t.studentId))
  
  overdueStudentIds.forEach((studentId) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      const unpaidAmount = overdueTransactions
        .filter((t) => t.studentId === studentId)
        .reduce((sum, t) => sum + t.amount, 0)
      
      alerts.push({
        id: `payment-${studentId}`,
        type: "payment",
        title: `${student.name} - Payment Overdue`,
        description: `$${unpaidAmount} overdue`,
        severity: "high",
        link: `/students/${studentId}`,
        studentId: student.id,
        studentPhone: student.phone,
        unpaidAmount,
      })
    }
  })
  
  // 2. High priority maintenance tasks that are "Reported"
  maintenanceTasks
    .filter((task) => task.priority === "High" && task.status === "Reported")
    .forEach((task) => {
      alerts.push({
        id: `maintenance-${task.id}`,
        type: "maintenance",
        title: `${task.title} - Room ${task.roomNumber}`,
        description: `${task.category} - Requires immediate attention`,
        severity: "high",
        taskId: task.id,
      })
    })
  
  // 3. Students with checkout within 48 hours (mock - would need checkout date field)
  // For now, we'll check students who checked in exactly 30 days ago as a demo
  const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  
  students.forEach((student) => {
    const checkInDate = new Date(student.checkInDate)
    const thirtyDaysLater = new Date(checkInDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    if (thirtyDaysLater <= twoDaysFromNow && thirtyDaysLater >= now) {
      alerts.push({
        id: `checkout-${student.id}`,
        type: "checkout",
        title: `${student.name} - Checkout Soon`,
        description: `Expected checkout in ${Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))} days`,
        severity: "medium",
        link: `/students/${student.id}`,
      })
    }
  })
  
  // Sort by severity
  alerts.sort((a, b) => (a.severity === "high" ? -1 : 1))
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-5 w-5" />
      case "maintenance":
        return <Wrench className="h-5 w-5" />
      case "checkout":
        return <LogOut className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }
  
  const getAlertColor = (severity: string) => {
    return severity === "high" 
      ? "bg-danger/20 text-danger border-danger/50" 
      : "bg-warning/20 text-warning border-warning/50"
  }

  const handleWhatsApp = (phone: string, name: string, amount: number) => {
    const message = encodeURIComponent(
      `Hi ${name}, this is a friendly reminder about your pending payment of $${amount}. Please complete the payment at your earliest convenience. Thank you!`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const handleQuickAssign = (taskId: string, staffMember: string) => {
    // TODO: Implement actual task assignment logic
    console.log(`Assigning task ${taskId} to ${staffMember}`)
    alert(`Task assigned to ${staffMember}! (This is a demo - integrate with your backend)`)
    setAssigningTask(null)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" />
          Priority Alerts
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto bg-danger text-danger-foreground">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No priority alerts at this time</p>
            <p className="text-sm text-muted-foreground mt-1">All systems running smoothly! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${alert.severity === "high" ? "text-danger" : "text-warning"}`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {alert.link ? (
                      <Link href={alert.link} className="hover:underline">
                        <h4 className="font-medium text-foreground text-sm">{alert.title}</h4>
                      </Link>
                    ) : (
                      <h4 className="font-medium text-foreground text-sm">{alert.title}</h4>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    
                    {/* Action buttons */}
                    <div className="mt-3 flex gap-2">
                      {alert.type === "payment" && alert.studentPhone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleWhatsApp(alert.studentPhone!, alert.title.split(' - ')[0], alert.unpaidAmount!)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                      
                      {alert.type === "maintenance" && alert.taskId && (
                        assigningTask === alert.taskId ? (
                          <Select onValueChange={(value) => handleQuickAssign(alert.taskId!, value)}>
                            <SelectTrigger className="h-7 w-[140px] text-xs">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="John (Plumber)">John (Plumber)</SelectItem>
                              <SelectItem value="Mike (Electrician)">Mike (Electrician)</SelectItem>
                              <SelectItem value="Sarah (General)">Sarah (General)</SelectItem>
                              <SelectItem value="David (Supervisor)">David (Supervisor)</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setAssigningTask(alert.taskId!)}
                          >
                            <Wrench className="h-3 w-3 mr-1" />
                            Quick Assign
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={alert.severity === "high" ? "destructive" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

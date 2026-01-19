"use client"

import { useState } from "react"
import type { MaintenanceTask } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TaskDetailDialogProps {
  task: MaintenanceTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleteWithCost: (taskId: string, cost?: number) => void
}

export function TaskDetailDialog({ task, open, onOpenChange, onCompleteWithCost }: TaskDetailDialogProps) {
  const [showCostInput, setShowCostInput] = useState(false)
  const [cost, setCost] = useState("")

  if (!task) return null

  const priorityColor = {
    High: "bg-danger text-white",
    Medium: "bg-yellow-500 text-white",
    Low: "bg-blue-500 text-white",
  }

  const statusColor = {
    Reported: "bg-slate-500 text-white",
    "In Progress": "bg-blue-500 text-white",
    "Awaiting Parts": "bg-yellow-600 text-white",
    Completed: "bg-success text-white",
  }

  const handleComplete = () => {
    if (task.status === "Completed") {
      onOpenChange(false)
      return
    }

    if (showCostInput) {
      onCompleteWithCost(task.id, cost ? Number.parseInt(cost) : undefined)
      onOpenChange(false)
      setCost("")
      setShowCostInput(false)
    } else {
      setShowCostInput(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>Room {task.roomNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge className={statusColor[task.status]}>{task.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              <Badge className={priorityColor[task.priority]}>{task.priority}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium text-foreground">{task.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date Reported</p>
              <p className="text-sm font-medium text-foreground">{task.dateReported}</p>
            </div>
          </div>

          {task.dateCompleted && (
            <div>
              <p className="text-xs text-muted-foreground">Date Completed</p>
              <p className="text-sm font-medium text-foreground">{task.dateCompleted}</p>
            </div>
          )}

          {task.cost !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Cost Incurred</p>
              <p className="text-sm font-medium text-foreground">₹{task.cost}</p>
            </div>
          )}

          {showCostInput && task.status !== "Completed" && (
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Cost incurred for this repair (optional)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
              />
            </div>
          )}

          <div className="flex gap-2">
            {task.status !== "Completed" && (
              <Button onClick={handleComplete} className="flex-1">
                {showCostInput ? "Confirm & Mark Complete" : "Mark as Complete"}
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type { MaintenanceTask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Trash2 } from "lucide-react"

interface TaskCardProps {
  task: MaintenanceTask
  onTaskClick: (task: MaintenanceTask) => void
  onMoveTask: (taskId: string, newStatus: MaintenanceTask["status"]) => void
  onDeleteTask: (taskId: string) => void
  nextStatus?: MaintenanceTask["status"]
  prevStatus?: MaintenanceTask["status"]
}

export function TaskCard({ task, onTaskClick, onMoveTask, onDeleteTask, nextStatus, prevStatus }: TaskCardProps) {
  const priorityColor = {
    High: "border-l-4 border-l-danger bg-danger/5",
    Medium: "border-l-4 border-l-yellow-500 bg-yellow-500/5",
    Low: "border-l-4 border-l-blue-500 bg-blue-500/5",
  }

  const priorityBadgeColor = {
    High: "bg-danger/20 text-danger",
    Medium: "bg-yellow-500/20 text-yellow-600",
    Low: "bg-blue-500/20 text-blue-600",
  }

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${priorityColor[task.priority]}`}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground truncate">{task.title}</p>
          <p className="text-xs text-muted-foreground">Room {task.roomNumber}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded font-medium ml-2 whitespace-nowrap ${priorityBadgeColor[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{task.category}</span>
        <span className="text-xs text-muted-foreground">{task.dateReported}</span>
      </div>

      <div className="flex gap-1 justify-end">
        {prevStatus && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onMoveTask(task.id, prevStatus)
            }}
            title="Move to previous status"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {nextStatus && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onMoveTask(task.id, nextStatus)
            }}
            title="Move to next status"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-danger hover:text-danger"
          onClick={(e) => {
            e.stopPropagation()
            onDeleteTask(task.id)
          }}
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

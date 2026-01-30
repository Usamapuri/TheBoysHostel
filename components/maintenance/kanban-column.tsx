"use client"

import type { MaintenanceTask } from "@/lib/types"
import { TaskCard } from "./task-card"

interface KanbanColumnProps {
  title: string
  status: "Reported" | "In Progress" | "Awaiting Parts" | "Completed"
  tasks: MaintenanceTask[]
  onTaskClick: (task: MaintenanceTask) => void
  onMoveTask: (taskId: string, newStatus: MaintenanceTask["status"]) => void
  onDeleteTask: (taskId: string) => void
}

export function KanbanColumn({ title, status, tasks, onTaskClick, onMoveTask, onDeleteTask }: KanbanColumnProps) {
  const statusTasks = tasks.filter((t) => t.status === status)

  const getNextStatus = (): typeof status => {
    const statuses: Array<typeof status> = ["Reported", "In Progress", "Awaiting Parts", "Completed"]
    const currentIndex = statuses.indexOf(status)
    return statuses[currentIndex + 1] || status
  }

  const getPrevStatus = (): typeof status => {
    const statuses: Array<typeof status> = ["Reported", "In Progress", "Awaiting Parts", "Completed"]
    const currentIndex = statuses.indexOf(status)
    return statuses[currentIndex - 1] || status
  }

  return (
    <div className="flex flex-col bg-muted/30 rounded-lg p-4 min-h-[500px] flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">{statusTasks.length}</span>
      </div>

      <div className="space-y-3 flex-1">
        {statusTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No tasks yet</p>
          </div>
        ) : (
          statusTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onMoveTask={onMoveTask}
              onDeleteTask={onDeleteTask}
              nextStatus={status !== "Completed" ? getNextStatus() : undefined}
              prevStatus={status !== "Reported" ? getPrevStatus() : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}

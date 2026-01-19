"use client"

import { useState } from "react"
import type { Room, MaintenanceTask } from "@/lib/types"
import { KanbanColumn } from "./kanban-column"
import { TaskDetailDialog } from "./task-detail-dialog"
import { AddTaskDialog } from "./add-task-dialog"
import { MaintenanceFilters } from "./maintenance-filters"

interface KanbanBoardProps {
  tasks: MaintenanceTask[]
  rooms: Room[]
  onAddTask: (taskData: {
    roomId: string
    roomNumber: string
    title: string
    description: string
    category: "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"
    priority: "Low" | "Medium" | "High"
  }) => void
  onMoveTask: (taskId: string, newStatus: MaintenanceTask["status"]) => void
  onDeleteTask: (taskId: string) => void
  onCompleteWithCost: (taskId: string, cost?: number) => void
}

export function KanbanBoard({
  tasks,
  rooms,
  onAddTask,
  onMoveTask,
  onDeleteTask,
  onCompleteWithCost,
}: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTasks = tasks.filter((task) => {
    if (selectedRoom && task.roomId !== selectedRoom) return false
    if (selectedCategory && task.category !== selectedCategory) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <MaintenanceFilters
          rooms={rooms}
          tasks={tasks}
          selectedRoom={selectedRoom}
          selectedCategory={selectedCategory}
          onRoomChange={setSelectedRoom}
          onCategoryChange={setSelectedCategory}
        />
        <AddTaskDialog rooms={rooms} onAddTask={onAddTask} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KanbanColumn
          title="Reported"
          status="Reported"
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
        />
        <KanbanColumn
          title="In Progress"
          status="In Progress"
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
        />
        <KanbanColumn
          title="Awaiting Parts"
          status="Awaiting Parts"
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
        />
        <KanbanColumn
          title="Completed"
          status="Completed"
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
        />
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onCompleteWithCost={onCompleteWithCost}
      />
    </div>
  )
}

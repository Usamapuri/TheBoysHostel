"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Room } from "@/lib/types"
import { Plus } from "lucide-react"

interface AddTaskDialogProps {
  rooms: Room[]
  onAddTask: (taskData: {
    roomId: string
    roomNumber: string
    title: string
    description: string
    category: "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"
    priority: "Low" | "Medium" | "High"
  }) => void
}

export function AddTaskDialog({ rooms, onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other">("Other")
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium")

  const handleSubmit = () => {
    if (!selectedRoom || !title.trim()) return

    const room = rooms.find((r) => r.id === selectedRoom)
    if (!room) return

    onAddTask({
      roomId: selectedRoom,
      roomNumber: room.roomNumber,
      title,
      description,
      category,
      priority,
    })

    setOpen(false)
    setSelectedRoom("")
    setTitle("")
    setDescription("")
    setCategory("Other")
    setPriority("Medium")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Maintenance Issue</DialogTitle>
          <DialogDescription>Create a new maintenance task</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Room</label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.roomNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Category</label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Internet">Internet</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Issue Title</label>
            <Input
              placeholder="e.g., Tap leakage, Light not working"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="Provide detailed description of the issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Priority</label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={!selectedRoom || !title.trim()} className="w-full">
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import type { Student } from "@/lib/types"

interface AddChargeDialogProps {
  students: Student[]
  onAddCharge: (studentId: string, type: "Penalty" | "Damage", amount: number, description: string) => void
}

export function AddChargeDialog({ students, onAddCharge }: AddChargeDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    type: "Penalty" as const,
    amount: 0,
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.studentId) return
    onAddCharge(formData.studentId, formData.type, formData.amount, formData.description)
    setFormData({ studentId: "", type: "Penalty", amount: 0, description: "" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-danger text-danger-foreground hover:bg-danger/90">
          <Plus className="h-4 w-4 mr-2" />
          Add One-off Charge
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add One-off Charge</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add penalty or damage charge for a student
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-foreground">Student</Label>
            <Select value={formData.studentId} onValueChange={(val) => setFormData({ ...formData, studentId: val })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Charge Type</Label>
            <Select value={formData.type} onValueChange={(val: any) => setFormData({ ...formData, type: val })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Penalty">Penalty</SelectItem>
                <SelectItem value="Damage">Damage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Amount</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number.parseInt(e.target.value) || 0 })}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-danger text-danger-foreground hover:bg-danger/90">
              Add Charge
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

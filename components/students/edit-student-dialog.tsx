"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Student } from "@/lib/types"

interface EditStudentDialogProps {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (studentId: string, updates: Partial<Student>) => void
}

export function EditStudentDialog({ student, open, onOpenChange, onSave }: EditStudentDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [emergencyName, setEmergencyName] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")
  const [emergencyRelation, setEmergencyRelation] = useState("")

  useEffect(() => {
    if (student) {
      setName(student.name)
      setPhone(student.phone)
      setEmail(student.email || "")
      setAddress(student.address || "")
      setEmergencyName(student.emergencyContact?.name || "")
      setEmergencyPhone(student.emergencyContact?.phone || "")
      setEmergencyRelation(student.emergencyContact?.relation || "")
    }
  }, [student])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !name || !phone) return

    onSave(student.id, {
      name,
      phone,
      email: email || undefined,
      address: address || undefined,
      emergencyContact: emergencyName
        ? { name: emergencyName, phone: emergencyPhone, relation: emergencyRelation }
        : undefined,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-foreground">
              Name *
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="text-foreground">
              Phone *
            </Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-background border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-foreground">
              Email
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address" className="text-foreground">
              Address
            </Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3">Emergency Contact</p>
            <div className="space-y-3">
              <Input
                placeholder="Contact Name"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="bg-background border-border"
              />
              <Input
                placeholder="Contact Phone"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="bg-background border-border"
              />
              <Input
                placeholder="Relation"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

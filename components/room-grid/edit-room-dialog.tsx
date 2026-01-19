"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Room } from "@/lib/types"

interface EditRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onEditRoom: (roomId: string, updates: { type: "AC" | "Non-AC"; capacity: number; baseMonthlyRent: number }) => void
}

export function EditRoomDialog({ open, onOpenChange, room, onEditRoom }: EditRoomDialogProps) {
  const [capacity, setCapacity] = useState("2")
  const [type, setType] = useState<"AC" | "Non-AC">("Non-AC")
  const [baseMonthlyRent, setBaseMonthlyRent] = useState("500")

  useEffect(() => {
    if (room) {
      setCapacity(room.capacity.toString())
      setType(room.type)
      setBaseMonthlyRent(room.baseMonthlyRent.toString())
    }
  }, [room])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (room) {
      onEditRoom(room.id, {
        type,
        capacity: Number.parseInt(capacity),
        baseMonthlyRent: Number.parseFloat(baseMonthlyRent),
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Room {room?.roomNumber}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Update room configuration</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-foreground">
                Type
              </Label>
              <Select value={type} onValueChange={(v) => setType(v as "AC" | "Non-AC")}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="Non-AC">Non-AC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity" className="text-foreground">
                Capacity (Number of Beds)
              </Label>
              <Select value={capacity} onValueChange={setCapacity}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {[1, 2, 3, 4].map((c) => (
                    <SelectItem key={c} value={c.toString()}>
                      {c} Bed{c > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="base-rent" className="text-foreground">
                Base Monthly Rent ($)
              </Label>
              <Input
                id="base-rent"
                type="number"
                step="0.01"
                value={baseMonthlyRent}
                onChange={(e) => setBaseMonthlyRent(e.target.value)}
                className="bg-input border-border text-foreground"
                required
              />
              <p className="text-xs text-muted-foreground">
                Default rent for new students in this room
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Update Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

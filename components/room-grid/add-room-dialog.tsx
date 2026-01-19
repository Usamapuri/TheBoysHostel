"use client"

import type React from "react"
import { useState } from "react"
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
import type { Location } from "@/lib/types"

interface AddRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locations: Location[]
  onAddRoom: (roomData: {
    roomNumber: string
    floor: number
    capacity: number
    type: "AC" | "Non-AC"
    locationId: string
  }) => void
}

export function AddRoomDialog({ open, onOpenChange, locations, onAddRoom }: AddRoomDialogProps) {
  const [roomNumber, setRoomNumber] = useState("")
  const [floor, setFloor] = useState("1")
  const [capacity, setCapacity] = useState("2")
  const [type, setType] = useState<"AC" | "Non-AC">("Non-AC")
  const [locationId, setLocationId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomNumber && floor && capacity && locationId) {
      onAddRoom({
        roomNumber,
        floor: Number.parseInt(floor),
        capacity: Number.parseInt(capacity),
        type,
        locationId,
      })
      setRoomNumber("")
      setFloor("1")
      setCapacity("2")
      setType("Non-AC")
      setLocationId("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Room</DialogTitle>
          <DialogDescription className="text-muted-foreground">Create a new room with beds</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room-number" className="text-foreground">
                Room Number
              </Label>
              <Input
                id="room-number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., 101"
                className="bg-input border-border text-foreground"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-foreground">
                Location <span className="text-destructive">*</span>
              </Label>
              <Select value={locationId} onValueChange={setLocationId} required>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {locations.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No locations available. Please add a location first.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="floor" className="text-foreground">
                Floor
              </Label>
              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {[1, 2, 3, 4, 5].map((f) => (
                    <SelectItem key={f} value={f.toString()}>
                      Floor {f}
                    </SelectItem>
                  ))}
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground"
              disabled={!locationId || locations.length === 0}
            >
              Add Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

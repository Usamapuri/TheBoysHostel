"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Room } from "@/lib/types"

interface AddStudentDialogProps {
  rooms: Room[]
  onAdd: (data: {
    name: string
    phone: string
    email?: string
    roomId?: string
    bedId?: string
    checkInDate: string
  }) => void
}

export function AddStudentDialog({ rooms, onAdd }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedBed, setSelectedBed] = useState("")
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split("T")[0])
  const [error, setError] = useState<string | null>(null)

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom)
  const availableBeds = selectedRoomData?.beds.filter((b) => !b.isOccupied) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !phone) {
      setError("Name and Phone are required")
      return
    }

    // If a room is selected, a bed MUST be selected
    if (selectedRoom && !selectedBed) {
      setError("Please select a bed for the assigned room")
      return
    }

    onAdd({
      name,
      phone,
      email: email || undefined,
      roomId: selectedRoom || undefined,
      bedId: selectedBed || undefined,
      checkInDate,
    })

    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setPhone("")
    setEmail("")
    setSelectedRoom("")
    setSelectedBed("")
    setCheckInDate(new Date().toISOString().split("T")[0])
    setError(null)
  }

  // Get rooms with available beds
  const roomsWithAvailableBeds = rooms.filter((r) => r.beds.some((b) => !b.isOccupied))

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
              className="bg-background border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              Phone *
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="bg-background border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email (optional)"
              className="bg-background border-border"
            />
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-4">Room Assignment (Optional)</h4>
            <p className="text-xs text-muted-foreground mb-4 italic">
              You can skip room assignment now and assign later from the Rooms dashboard.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room" className="text-foreground text-xs uppercase tracking-wider font-semibold opacity-70">
                  Room
                </Label>
                <Select
                  value={selectedRoom}
                  onValueChange={(val) => {
                    setSelectedRoom(val)
                    setSelectedBed("")
                  }}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Skip assignment" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="SKIP">None (Registry Only)</SelectItem>
                    {roomsWithAvailableBeds.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bed" className="text-foreground text-xs uppercase tracking-wider font-semibold opacity-70">
                  Bed
                </Label>
                <Select
                  value={selectedBed}
                  onValueChange={setSelectedBed}
                  disabled={!selectedRoom || selectedRoom === "SKIP"}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder={!selectedRoom || selectedRoom === "SKIP" ? "---" : "Select bed"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {availableBeds.map((bed) => (
                      <SelectItem key={bed.id} value={bed.id}>
                        Bed {bed.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInDate" className="text-foreground">
              Check-in Date *
            </Label>
            <Input
              id="checkInDate"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="bg-background border-border"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Add Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { RoomCard } from "./room-card"
import { AssignStudentDialog } from "./assign-student-dialog"
import { StudentInfoDialog } from "./student-info-dialog"
import { AddRoomDialog } from "./add-room-dialog"
import { EditRoomDialog } from "./edit-room-dialog"
import { TransferStudentDialog } from "./transfer-student-dialog"
import { AddLocationDialog } from "./add-location-dialog"
import { ManageLocationsDialog } from "./manage-locations-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoomFilters } from "./room-filters"
import { Plus, Settings, MapPin } from "lucide-react"
import type { Room, Student, Location } from "@/lib/types"

interface RoomGridProps {
  rooms: Room[]
  students: Student[]
  locations: Location[]
  onCheckIn: (bedId: string, roomId: string, name: string, phone: string) => void
  onAddRoom: (roomData: {
    roomNumber: string
    floor: number
    capacity: number
    type: "AC" | "Non-AC"
    locationId: string
  }) => void
  onEditRoom: (roomId: string, updates: { type: "AC" | "Non-AC"; capacity: number }) => void
  onDeleteRoom: (roomId: string) => void
  onTransferStudent: (studentId: string, newBedId: string, newRoomId: string) => void
  onAssignStudent: (studentId: string, bedId: string, roomId: string) => void
  onAddLocation: (name: string) => void
  onUpdateLocation: (locationId: string, name: string) => void
  onDeleteLocation: (locationId: string) => { success: boolean; error?: string }
}

export function RoomGrid({
  rooms,
  students,
  locations,
  onCheckIn,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onTransferStudent,
  onAssignStudent,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
}: RoomGridProps) {
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [roomType, setRoomType] = useState("all")
  const [seaterType, setSeaterType] = useState("all")
  const [availability, setAvailability] = useState("all")

  const [selectedBed, setSelectedBed] = useState<{
    bedId: string
    roomId: string
    roomNumber: string
    bedLabel: string
  } | null>(null)

  const [addRoomOpen, setAddRoomOpen] = useState(false)
  const [editRoomOpen, setEditRoomOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  const [transferOpen, setTransferOpen] = useState(false)
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null)

  const [studentInfoOpen, setStudentInfoOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const [addLocationOpen, setAddLocationOpen] = useState(false)
  const [manageLocationsOpen, setManageLocationsOpen] = useState(false)

  const handleBedClick = (bedId: string, roomId: string, isOccupied: boolean, studentId?: string) => {
    const room = rooms.find((r) => r.id === roomId)
    const bed = room?.beds.find((b) => b.id === bedId)

    if (isOccupied && studentId) {
      // Show student info
      const student = students.find((s) => s.id === studentId)
      if (student && room && bed) {
        setSelectedStudent(student)
        setSelectedRoom(room)
        setSelectedBed({
          bedId,
          roomId,
          roomNumber: room.roomNumber,
          bedLabel: bed.label,
        })
        setStudentInfoOpen(true)
      }
    } else if (!isOccupied) {
      // Assign registered student
      if (room && bed) {
        setSelectedBed({
          bedId,
          roomId,
          roomNumber: room.roomNumber,
          bedLabel: bed.label,
        })
      }
    }
  }

  const handleAssignStudent = (studentId: string) => {
    if (selectedBed) {
      onAssignStudent(studentId, selectedBed.bedId, selectedBed.roomId)
      setSelectedBed(null)
    }
  }

  const handleTransferClick = () => {
    if (selectedStudent) {
      setTransferringStudent(selectedStudent)
      setStudentInfoOpen(false)
      setSelectedBed(null) // Clear selected bed when transferring
      setTransferOpen(true)
    }
  }

  const handleStudentInfoClose = (open: boolean) => {
    setStudentInfoOpen(open)
    if (!open) {
      // Clear all selected states when closing student info dialog
      setSelectedBed(null)
      setSelectedStudent(null)
      setSelectedRoom(null)
    }
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setEditRoomOpen(true)
  }

  const handleTransferStudent = (newBedId: string, newRoomId: string) => {
    if (transferringStudent) {
      onTransferStudent(transferringStudent.id, newBedId, newRoomId)
      setTransferringStudent(null)
    }
  }

  // Get vacant beds for transfer dialog
  const vacantBeds = rooms.flatMap((room) =>
    room.beds
      .filter((bed) => !bed.isOccupied)
      .map((bed) => ({
        bedId: bed.id,
        roomId: room.id,
        roomNumber: room.roomNumber,
        bedLabel: bed.label,
      })),
  )

  // Helper to get location name by id
  const getLocationName = (locationId: string) => {
    return locations.find((loc) => loc.id === locationId)?.name || "Unknown"
  }

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    if (locationFilter !== "all" && room.locationId !== locationFilter) return false
    if (roomType !== "all" && room.type !== roomType) return false
    if (seaterType !== "all" && room.capacity !== Number.parseInt(seaterType)) return false
    if (availability === "has-vacancy" && room.beds.every((b) => b.isOccupied)) return false
    return true
  })

  // Group by location
  const roomsByLocation = filteredRooms.reduce(
    (acc, room) => {
      const locationName = getLocationName(room.locationId)
      if (!acc[locationName]) acc[locationName] = []
      acc[locationName].push(room)
      return acc
    },
    {} as Record<string, Room[]>,
  )

  // Get sorted location names
  const sortedLocationNames = locations
    .map((loc) => loc.name)
    .filter((name) => roomsByLocation[name] && roomsByLocation[name].length > 0)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Top bar with location dropdown and buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-[280px]">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">Location:</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setManageLocationsOpen(true)}
              title="Manage Locations"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAddLocationOpen(true)}
              variant="outline"
              className="text-foreground"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Add Location
            </Button>
            <Button
              onClick={() => setAddRoomOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Filters */}
        <RoomFilters
          roomType={roomType}
          seaterType={seaterType}
          availability={availability}
          onRoomTypeChange={setRoomType}
          onSeaterTypeChange={setSeaterType}
          onAvailabilityChange={setAvailability}
        />
      </div>

      {/* Rooms by location */}
      <div className="space-y-8">
        {sortedLocationNames.map((locationName) => {
          const locRooms = roomsByLocation[locationName] || []
          if (locRooms.length === 0) return null

          return (
            <div key={locationName}>
              <h3 className="text-lg font-semibold text-foreground mb-4">{locationName}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {locRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    students={students}
                    locationName={locationName}
                    onBedClick={handleBedClick}
                    onEditRoom={handleEditRoom}
                    onDeleteRoom={onDeleteRoom}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {Object.values(roomsByLocation).flat().length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No rooms found matching the selected filters.</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AssignStudentDialog
        open={!!selectedBed && !studentInfoOpen}
        onOpenChange={(open) => !open && setSelectedBed(null)}
        roomNumber={selectedBed?.roomNumber || ""}
        bedLabel={selectedBed?.bedLabel || ""}
        students={students}
        onAssign={handleAssignStudent}
      />

      <StudentInfoDialog
        open={studentInfoOpen}
        onOpenChange={handleStudentInfoClose}
        student={selectedStudent}
        room={selectedRoom}
        bedLabel={selectedBed?.bedLabel || ""}
        onTransferClick={handleTransferClick}
      />

      <AddRoomDialog
        open={addRoomOpen}
        onOpenChange={setAddRoomOpen}
        locations={locations}
        onAddRoom={onAddRoom}
      />

      <EditRoomDialog open={editRoomOpen} onOpenChange={setEditRoomOpen} room={editingRoom} onEditRoom={onEditRoom} />

      <TransferStudentDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        student={transferringStudent}
        vacantBeds={vacantBeds}
        onTransfer={handleTransferStudent}
      />

      <AddLocationDialog
        open={addLocationOpen}
        onOpenChange={setAddLocationOpen}
        onAddLocation={onAddLocation}
      />

      <ManageLocationsDialog
        open={manageLocationsOpen}
        onOpenChange={setManageLocationsOpen}
        locations={locations}
        onUpdateLocation={onUpdateLocation}
        onDeleteLocation={onDeleteLocation}
      />
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BedIcon, Edit2, Trash2 } from "lucide-react"
import type { Room, Student } from "@/lib/types"

interface RoomCardProps {
  room: Room
  students: Student[]
  locationName: string
  onBedClick: (bedId: string, roomId: string, isOccupied: boolean, studentId?: string) => void
  onEditRoom: (room: Room) => void
  onDeleteRoom: (roomId: string) => void
}

export function RoomCard({ room, students, locationName, onBedClick, onEditRoom, onDeleteRoom }: RoomCardProps) {
  const getStudentForBed = (studentId?: string) => {
    return students.find((s) => s.id === studentId)
  }

  const vacantBeds = room.beds.filter((b) => !b.isOccupied).length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Room {room.roomNumber}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Floor {room.floor} • {locationName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditRoom(room)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteRoom(room.id)}
              className="text-muted-foreground hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant={room.type === "AC" ? "default" : "secondary"} className="text-xs">
            {room.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {room.capacity}-Seater
          </Badge>
          <Badge variant="outline" className="text-xs">
            {vacantBeds} vacant
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {room.beds.map((bed) => {
            const student = getStudentForBed(bed.studentId)
            return (
              <button
                key={bed.id}
                onClick={() => onBedClick(bed.id, room.id, bed.isOccupied, bed.studentId)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 min-w-[80px] ${bed.isOccupied
                  ? "bg-danger/20 border-danger/50 hover:bg-danger/30 cursor-pointer"
                  : "bg-success/20 border-success/50 hover:bg-success/30 cursor-pointer"
                  }`}
              >
                <BedIcon className={`h-5 w-5 mb-1 ${bed.isOccupied ? "text-danger" : "text-success"}`} />
                <span className="text-xs font-medium text-foreground">Bed {bed.label}</span>
                {student && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                    {student.name.split(" ")[0]}
                  </span>
                )}
                {!bed.isOccupied && <span className="text-[10px] text-success">Vacant</span>}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

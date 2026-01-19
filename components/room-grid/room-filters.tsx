"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RoomFiltersProps {
  roomType: string
  seaterType: string
  availability: string
  onRoomTypeChange: (value: string) => void
  onSeaterTypeChange: (value: string) => void
  onAvailabilityChange: (value: string) => void
}

export function RoomFilters({
  roomType,
  seaterType,
  availability,
  onRoomTypeChange,
  onSeaterTypeChange,
  onAvailabilityChange,
}: RoomFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-2 min-w-[180px]">
        <label className="text-sm font-medium text-foreground">Room Type</label>
        <Select value={roomType} onValueChange={onRoomTypeChange}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="AC">AC</SelectItem>
            <SelectItem value="Non-AC">Non-AC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 min-w-[180px]">
        <label className="text-sm font-medium text-foreground">Seater Type</label>
        <Select value={seaterType} onValueChange={onSeaterTypeChange}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Seaters</SelectItem>
            <SelectItem value="1">1-Seater</SelectItem>
            <SelectItem value="2">2-Seater</SelectItem>
            <SelectItem value="3">3-Seater</SelectItem>
            <SelectItem value="4">4-Seater</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 min-w-[180px]">
        <label className="text-sm font-medium text-foreground">Availability</label>
        <Select value={availability} onValueChange={onAvailabilityChange}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="has-vacancy">Has Vacancy</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

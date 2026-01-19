"use client"

import type { Room, MaintenanceTask } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface MaintenanceFiltersProps {
  rooms: Room[]
  tasks: MaintenanceTask[]
  selectedRoom: string | null
  selectedCategory: string | null
  onRoomChange: (roomId: string | null) => void
  onCategoryChange: (category: string | null) => void
}

const categories = ["Plumbing", "Electrical", "Furniture", "Internet", "Other"]

export function MaintenanceFilters({
  rooms,
  tasks,
  selectedRoom,
  selectedCategory,
  onRoomChange,
  onCategoryChange,
}: MaintenanceFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Filter by Room</label>
        <Select
          value={selectedRoom || "allRooms"}
          onValueChange={(value) => onRoomChange(value === "allRooms" ? null : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="allRooms">All Rooms</SelectItem>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                Room {room.roomNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Filter by Category</label>
        <Select
          value={selectedCategory || "allCategories"}
          onValueChange={(value) => onCategoryChange(value === "allCategories" ? null : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="allCategories">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(selectedRoom || selectedCategory) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onRoomChange(null)
            onCategoryChange(null)
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}

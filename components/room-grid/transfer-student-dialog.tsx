"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Student } from "@/lib/types"

interface TransferStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
  vacantBeds: Array<{ bedId: string; roomId: string; roomNumber: string; bedLabel: string }>
  onTransfer: (newBedId: string, newRoomId: string) => void
}

export function TransferStudentDialog({
  open,
  onOpenChange,
  student,
  vacantBeds,
  onTransfer,
}: TransferStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Transfer {student?.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a vacant bed to transfer the student
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4 max-h-[300px] overflow-y-auto">
          {vacantBeds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vacant beds available</p>
          ) : (
            vacantBeds.map((bed) => (
              <button
                key={bed.bedId}
                onClick={() => {
                  onTransfer(bed.bedId, bed.roomId)
                  onOpenChange(false)
                }}
                className="p-3 rounded-lg border border-border bg-input hover:bg-input/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Room {bed.roomNumber}, Bed {bed.bedLabel}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-success/20 border-success text-success">
                    Vacant
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

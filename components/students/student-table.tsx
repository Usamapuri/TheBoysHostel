"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AddStudentDialog } from "./add-student-dialog"
import { EditStudentDialog } from "./edit-student-dialog"
import { DeleteStudentDialog } from "./delete-student-dialog"
import { Pencil, Trash2 } from "lucide-react"
import type { Student, Transaction, Room } from "@/lib/types"

interface StudentTableProps {
  students: Student[]
  transactions: Transaction[]
  rooms: Room[]
  onAddStudent: (data: {
    name: string
    phone: string
    email?: string
    roomId: string
    bedId: string
    checkInDate: string
  }) => void
  onUpdateStudent: (studentId: string, updates: Partial<Student>) => void
  onDeleteStudent: (studentId: string) => void
}

export function StudentTable({
  students,
  transactions,
  rooms,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}: StudentTableProps) {
  const [showDefaultersOnly, setShowDefaultersOnly] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    return room?.roomNumber || "N/A"
  }

  const getBedLabel = (bedId: string, roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    const bed = room?.beds.find((b) => b.id === bedId)
    return bed?.label || ""
  }

  const getBalanceStatus = (studentId: string) => {
    const unpaidTransactions = transactions.filter((t) => t.studentId === studentId && t.status === "Unpaid")
    const totalUnpaid = unpaidTransactions.reduce((acc, t) => acc + t.amount, 0)
    return totalUnpaid
  }

  const filteredStudents = showDefaultersOnly
    ? students.filter((student) => getBalanceStatus(student.id) > 0)
    : students

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch id="defaulters" checked={showDefaultersOnly} onCheckedChange={setShowDefaultersOnly} />
          <Label htmlFor="defaulters" className="text-muted-foreground cursor-pointer">
            Show Defaulters Only
          </Label>
        </div>
        <AddStudentDialog rooms={rooms} onAdd={onAddStudent} />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Phone</TableHead>
              <TableHead className="text-muted-foreground">Room</TableHead>
              <TableHead className="text-muted-foreground">Check-in Date</TableHead>
              <TableHead className="text-muted-foreground text-right">Balance</TableHead>
              <TableHead className="text-muted-foreground text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {showDefaultersOnly ? "No defaulters found" : "No students checked in yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const balance = getBalanceStatus(student.id)
                return (
                  <TableRow key={student.id} className="border-border">
                    <TableCell className="font-medium">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-primary hover:text-primary/80 hover:underline"
                      >
                        {student.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.phone}</TableCell>
                    <TableCell className="text-foreground">
                      {getRoomNumber(student.roomId)}-{getBedLabel(student.bedId, student.roomId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(student.checkInDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {balance > 0 ? (
                        <Badge variant="destructive" className="bg-danger/20 text-danger border-danger/30">
                          ${balance} Due
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                          Cleared
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-danger"
                          onClick={() => setDeletingStudent(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <EditStudentDialog
        student={editingStudent}
        open={!!editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
        onSave={onUpdateStudent}
      />

      {/* Delete Dialog */}
      <DeleteStudentDialog
        student={deletingStudent}
        open={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
        onConfirm={onDeleteStudent}
      />
    </div>
  )
}

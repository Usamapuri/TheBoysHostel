"use client"

import { useState, useMemo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Search, User } from "lucide-react"
import type { Student } from "@/lib/types"

interface AssignStudentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    roomNumber: string
    bedLabel: string
    students: Student[]
    onAssign: (studentId: string) => void
}

export function AssignStudentDialog({
    open,
    onOpenChange,
    roomNumber,
    bedLabel,
    students,
    onAssign,
}: AssignStudentDialogProps) {
    const [searchQuery, setSearchQuery] = useState("")

    // Filter to only unassigned students (those without a bedId or with empty bedId)
    const unassignedStudents = useMemo(() => {
        return students.filter((s) => !s.bedId || s.bedId === "")
    }, [students])

    // Filter by search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return unassignedStudents
        const query = searchQuery.toLowerCase()
        return unassignedStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                s.phone.includes(query) ||
                s.email?.toLowerCase().includes(query)
        )
    }, [unassignedStudents, searchQuery])

    const handleAssign = (studentId: string) => {
        onAssign(studentId)
        setSearchQuery("")
        onOpenChange(false)
    }

    const handleClose = () => {
        setSearchQuery("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Assign Student to Bed</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Room {roomNumber}, Bed {bedLabel}
                    </DialogDescription>
                </DialogHeader>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, phone, or email..."
                        className="pl-10 bg-input border-border text-foreground"
                    />
                </div>

                {/* Student List */}
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-8">
                            <User className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {unassignedStudents.length === 0
                                    ? "No unassigned students available"
                                    : "No students match your search"}
                            </p>
                        </div>
                    ) : (
                        filteredStudents.map((student) => (
                            <button
                                key={student.id}
                                onClick={() => handleAssign(student.id)}
                                className="w-full p-3 rounded-lg border border-border bg-input hover:bg-input/50 transition-colors text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.phone}</p>
                                        {student.email && (
                                            <p className="text-xs text-muted-foreground">{student.email}</p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        Select
                                    </Badge>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

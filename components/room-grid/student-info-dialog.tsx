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
import { User, Phone, Mail, Calendar, AlertCircle, ArrowRightLeft } from "lucide-react"
import type { Student, Room } from "@/lib/types"

interface StudentInfoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    student: Student | null
    room: Room | null
    bedLabel: string
    onTransferClick: () => void
}

export function StudentInfoDialog({
    open,
    onOpenChange,
    student,
    room,
    bedLabel,
    onTransferClick,
}: StudentInfoDialogProps) {
    if (!student || !room) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {student.name}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Room {room.roomNumber}, Bed {bedLabel}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Contact Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-foreground">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{student.phone}</span>
                        </div>
                        {student.email && (
                            <div className="flex items-center gap-3 text-foreground">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{student.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-foreground">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Check-in: {formatDate(student.checkInDate)}</span>
                        </div>
                    </div>

                    {/* Address */}
                    {student.address && (
                        <div className="pt-2 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-1">Address</p>
                            <p className="text-foreground text-sm">{student.address}</p>
                        </div>
                    )}

                    {/* Emergency Contact */}
                    {student.emergencyContact && (
                        <div className="pt-2 border-t border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-warning" />
                                <p className="text-sm font-medium text-foreground">Emergency Contact</p>
                            </div>
                            <div className="text-sm space-y-1 pl-6">
                                <p className="text-foreground">{student.emergencyContact.name}</p>
                                <p className="text-muted-foreground">{student.emergencyContact.phone}</p>
                                <Badge variant="outline" className="text-xs">
                                    {student.emergencyContact.relation}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Security Deposit */}
                    <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Security Deposit</p>
                            <Badge
                                variant={student.securityDepositStatus === "Paid" ? "default" : "destructive"}
                                className="text-xs"
                            >
                                {student.securityDepositStatus || "Pending"} - ₹{student.securityDeposit || 500}
                            </Badge>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onTransferClick}
                        className="flex items-center gap-2"
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        Transfer to Another Bed
                    </Button>
                    <Button type="button" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

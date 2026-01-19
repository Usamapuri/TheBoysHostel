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

interface AddLocationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddLocation: (name: string) => void
}

export function AddLocationDialog({ open, onOpenChange, onAddLocation }: AddLocationDialogProps) {
    const [name, setName] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onAddLocation(name.trim())
            setName("")
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Location</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Create a new building or wing for your hostel
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="location-name" className="text-foreground">
                                Location Name
                            </Label>
                            <Input
                                id="location-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., North Wing, Annex B"
                                className="bg-input border-border text-foreground"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary text-primary-foreground">
                            Add Location
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

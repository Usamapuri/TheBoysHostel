"use client"

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
import { Pencil, Trash2, Check, X } from "lucide-react"
import type { Location } from "@/lib/types"

interface ManageLocationsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    locations: Location[]
    onUpdateLocation: (locationId: string, name: string) => void
    onDeleteLocation: (locationId: string) => { success: boolean; error?: string }
}

export function ManageLocationsDialog({
    open,
    onOpenChange,
    locations,
    onUpdateLocation,
    onDeleteLocation,
}: ManageLocationsDialogProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleEdit = (location: Location) => {
        setEditingId(location.id)
        setEditValue(location.name)
        setError(null)
    }

    const handleSaveEdit = () => {
        if (editingId && editValue.trim()) {
            onUpdateLocation(editingId, editValue.trim())
            setEditingId(null)
            setEditValue("")
        }
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditValue("")
    }

    const handleDelete = (locationId: string) => {
        setError(null)
        const result = onDeleteLocation(locationId)
        if (!result.success && result.error) {
            setError(result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Manage Locations</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Edit or delete existing locations. Locations with rooms cannot be deleted.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {locations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No locations found.</p>
                    ) : (
                        <div className="space-y-2">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    {editingId === location.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="bg-input border-border text-foreground h-8"
                                                autoFocus
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                onClick={handleSaveEdit}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={handleCancelEdit}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-foreground font-medium">{location.name}</span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleEdit(location)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(location.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

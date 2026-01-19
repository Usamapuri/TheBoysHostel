"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2 } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface EditRentDialogProps {
  transaction: Transaction
  onUpdateRent: (transactionId: string, newAmount: number) => void
}

export function EditRentDialog({ transaction, onUpdateRent }: EditRentDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(transaction.amount)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount > 0) {
      onUpdateRent(transaction.id, amount)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 px-2">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Rent Amount</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Override the rent amount for this month
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-foreground">New Rent Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number.parseInt(e.target.value) || 0)}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Update
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

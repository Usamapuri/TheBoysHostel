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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Upload } from "lucide-react"

interface AddExpenseDialogProps {
  onAddExpense: (data: {
    date: string
    month: string
    category: "Utility" | "Maintenance" | "Salary" | "Supplies" | "Staff" | "Other"
    amount: number
    description: string
    vendorName?: string
    receiptUrl?: string
  }) => void
}

export function AddExpenseDialog({ onAddExpense }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Utility" as const,
    amount: 0,
    description: "",
    vendorName: "",
    receiptFile: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const month = new Date(formData.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    
    // Mock receipt URL (in production, you'd upload to cloud storage)
    const receiptUrl = formData.receiptFile 
      ? `uploads/${Date.now()}_${formData.receiptFile.name}` 
      : undefined
    
    onAddExpense({
      date: formData.date,
      month,
      category: formData.category,
      amount: formData.amount,
      description: formData.description,
      vendorName: formData.vendorName || undefined,
      receiptUrl,
    })
    setFormData({ 
      date: new Date().toISOString().split("T")[0], 
      category: "Utility", 
      amount: 0, 
      description: "",
      vendorName: "",
      receiptFile: null,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Expense</DialogTitle>
          <DialogDescription className="text-muted-foreground">Record a new hostel expense</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-foreground">Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Category</Label>
              <Select value={formData.category} onValueChange={(val: any) => setFormData({ ...formData, category: val })}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Utility">Utilities</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground">Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-foreground">Vendor Name (Optional)</Label>
            <Input
              type="text"
              placeholder="e.g., Electric Company, Plumber, etc."
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Description</Label>
            <Textarea
              placeholder="Brief description of the expense..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary border-border text-foreground"
              required
            />
          </div>
          <div>
            <Label className="text-foreground">Receipt Upload (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="receipt-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, receiptFile: e.target.files?.[0] || null })}
                className="bg-secondary border-border text-foreground"
              />
              <Button type="button" variant="outline" size="icon" className="shrink-0">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {formData.receiptFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {formData.receiptFile.name}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Expense
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

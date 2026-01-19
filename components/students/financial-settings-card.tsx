"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DollarSign, Edit, Save, X } from "lucide-react"
import type { Student } from "@/lib/types"

interface FinancialSettingsCardProps {
  student: Student
  onUpdate: (updates: Partial<Student>) => Promise<void>
}

export function FinancialSettingsCard({ student, onUpdate }: FinancialSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [monthlyRent, setMonthlyRent] = useState(student.monthlyRent?.toString() || "500")
  const [securityDeposit, setSecurityDeposit] = useState(student.securityDeposit?.toString() || "500")
  const [adminNotes, setAdminNotes] = useState(student.adminNotes || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate({
        monthlyRent: Number.parseFloat(monthlyRent),
        securityDeposit: Number.parseFloat(securityDeposit),
        adminNotes: adminNotes || undefined,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update financial settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setMonthlyRent(student.monthlyRent?.toString() || "500")
    setSecurityDeposit(student.securityDeposit?.toString() || "500")
    setAdminNotes(student.adminNotes || "")
    setIsEditing(false)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Settings
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-primary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-foreground">Monthly Rent ($)</Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="bg-input border-border text-foreground mt-1"
              />
            ) : (
              <p className="text-2xl font-bold text-foreground mt-1">
                ${student.monthlyRent || 500}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              This student's monthly rent amount
            </p>
          </div>

          <div>
            <Label className="text-foreground">Security Deposit ($)</Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="bg-input border-border text-foreground mt-1"
              />
            ) : (
              <p className="text-2xl font-bold text-foreground mt-1">
                ${student.securityDeposit || 500}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Deposit amount for this student
            </p>
          </div>
        </div>

        <div>
          <Label className="text-foreground">Admin Notes (Private)</Label>
          {isEditing ? (
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="bg-input border-border text-foreground mt-1"
              placeholder="Internal notes about this student..."
              rows={4}
            />
          ) : (
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {student.adminNotes || "No admin notes"}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

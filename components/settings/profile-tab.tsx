"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateTenantProfile } from "@/lib/settings-actions"
import type { Tenant } from "@/lib/tenant-context"
import { Building2, Loader2 } from "lucide-react"

interface ProfileTabProps {
  tenant: Tenant
}

export function ProfileTab({ tenant }: ProfileTabProps) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(tenant.name)
  const [address, setAddress] = useState(tenant.address ?? "")
  const [phone, setPhone] = useState(tenant.phone ?? "")
  const [contactEmail, setContactEmail] = useState(tenant.contactEmail ?? "")

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Hostel name is required")
      return
    }

    setSaving(true)
    try {
      await updateTenantProfile({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      })
      toast.success("Profile updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Building2 className="h-5 w-5" />
          Hostel Profile
        </CardTitle>
        <CardDescription>
          Update your hostel&apos;s basic information and contact details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Hostel Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Hostel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@hostel.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street, City, Country"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

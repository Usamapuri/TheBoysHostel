"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateTenantBranding } from "@/lib/settings-actions"
import type { Tenant } from "@/lib/tenant-context"
import { Palette, Loader2, ImageIcon } from "lucide-react"

interface BrandingTabProps {
  tenant: Tenant
}

const PRESET_COLORS = [
  "#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
]

export function BrandingTab({ tenant }: BrandingTabProps) {
  const [saving, setSaving] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor)
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl ?? "")

  async function handleSave() {
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      toast.error("Please enter a valid hex color (e.g. #22c55e)")
      return
    }

    setSaving(true)
    try {
      await updateTenantBranding({
        primaryColor,
        logoUrl: logoUrl.trim() || undefined,
      })
      toast.success("Branding updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update branding")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Palette className="h-5 w-5" />
          Branding
        </CardTitle>
        <CardDescription>
          Customize your hostel&apos;s look and feel. Changes apply to all users of this hostel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Logo Upload Placeholder */}
        <div className="space-y-3">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Paste logo URL (image upload coming soon)"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to your logo image. Direct file upload will be available soon.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Color Picker */}
        <div className="space-y-3">
          <Label>Primary Theme Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-border bg-transparent"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#22c55e"
              className="w-32 font-mono"
            />
            <div
              className="h-10 flex-1 rounded-md border border-border"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setPrimaryColor(color)}
                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: primaryColor === color ? "white" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Branding
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

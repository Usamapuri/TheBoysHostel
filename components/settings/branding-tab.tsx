"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateTenantBranding } from "@/lib/settings-actions"
import { normalizeImageUrl } from "@/lib/normalize-image-url"
import { useTenant } from "@/lib/tenant-context"
import type { Tenant } from "@/lib/tenant-context"
import { Palette, Loader2, ImageIcon, ImageOff } from "lucide-react"

interface BrandingTabProps {
  tenant: Tenant
}

const PRESET_COLORS = [
  "#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
]

const PRESET_BG_COLORS = [
  "#0a0a0a", "#0c1222", "#0f1519", "#13100e",
  "#0d0f1a", "#10141a", "#0e1210", "#140e0e",
]

export function BrandingTab({ tenant }: BrandingTabProps) {
  const { refreshTenant } = useTenant()
  const [saving, setSaving] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor)
  const [backgroundColor, setBackgroundColor] = useState(tenant.backgroundColor)
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl ?? "")
  const [logoError, setLogoError] = useState(false)

  async function handleSave() {
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      toast.error("Please enter a valid hex color (e.g. #22c55e)")
      return
    }

    setSaving(true)
    try {
      await updateTenantBranding({
        primaryColor,
        backgroundColor,
        logoUrl: logoUrl.trim() ? normalizeImageUrl(logoUrl.trim()) : undefined,
      })
      await refreshTenant()
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
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 overflow-hidden">
              {logoUrl && !logoError ? (
                <img
                  src={normalizeImageUrl(logoUrl)}
                  alt="Logo"
                  className="h-full w-full rounded-lg object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : logoUrl && logoError ? (
                <div className="flex flex-col items-center gap-1">
                  <ImageOff className="h-5 w-5 text-destructive" />
                  <span className="text-[9px] text-destructive">Invalid</span>
                </div>
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                value={logoUrl}
                onChange={(e) => { setLogoUrl(e.target.value); setLogoError(false) }}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Paste an image URL or a Google Drive / Dropbox share link. It will be auto-converted.
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

        {/* Background Color Picker */}
        <div className="space-y-3">
          <Label>Background Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-border bg-transparent"
            />
            <Input
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="#0a0a0a"
              className="w-32 font-mono"
            />
            <div
              className="h-10 flex-1 rounded-md border border-border"
              style={{ backgroundColor }}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_BG_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setBackgroundColor(color)}
                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: backgroundColor === color ? "white" : "transparent",
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Controls the app background, cards, sidebar, and input areas. Use dark colors for best readability.
          </p>
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

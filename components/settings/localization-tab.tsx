"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { updateTenantLocalization } from "@/lib/settings-actions"
import type { Tenant } from "@/lib/tenant-context"
import { Globe, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/format-currency"

interface LocalizationTabProps {
  tenant: Tenant
}

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
]

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Asia/Dubai", label: "Gulf Standard Time" },
  { value: "Africa/Lagos", label: "West Africa Time" },
  { value: "Asia/Singapore", label: "Singapore Time" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  { value: "Australia/Sydney", label: "Australian Eastern Time" },
]

export function LocalizationTab({ tenant }: LocalizationTabProps) {
  const [saving, setSaving] = useState(false)
  const [currency, setCurrency] = useState(tenant.currency)
  const [timezone, setTimezone] = useState(tenant.timezone)

  async function handleSave() {
    setSaving(true)
    try {
      await updateTenantLocalization({ currency, timezone })
      toast.success("Localization settings updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Globe className="h-5 w-5" />
          Localization
        </CardTitle>
        <CardDescription>
          Configure how currencies and dates are displayed across the entire dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Preview: {formatCurrency(1234.56, currency)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

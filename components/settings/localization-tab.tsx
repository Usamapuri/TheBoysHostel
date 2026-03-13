"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { updateTenantLocalization } from "@/lib/settings-actions"
import { useTenant } from "@/lib/tenant-context"
import type { Tenant } from "@/lib/tenant-context"
import { Globe, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/format-currency"

interface LocalizationTabProps {
  tenant: Tenant
}

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "PKR", label: "Pakistani Rupee (PKR)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "THB", label: "Thai Baht (THB)" },
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "AED", label: "UAE Dirham (AED)" },
  { value: "SAR", label: "Saudi Riyal (SAR)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "BDT", label: "Bangladeshi Taka (BDT)" },
  { value: "BRL", label: "Brazilian Real (BRL)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
  { value: "COP", label: "Colombian Peso (COP)" },
  { value: "EGP", label: "Egyptian Pound (EGP)" },
  { value: "GHS", label: "Ghanaian Cedi (GHS)" },
  { value: "IDR", label: "Indonesian Rupiah (IDR)" },
  { value: "ILS", label: "Israeli Shekel (ILS)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "KES", label: "Kenyan Shilling (KES)" },
  { value: "KRW", label: "South Korean Won (KRW)" },
  { value: "KWD", label: "Kuwaiti Dinar (KWD)" },
  { value: "LKR", label: "Sri Lankan Rupee (LKR)" },
  { value: "MAD", label: "Moroccan Dirham (MAD)" },
  { value: "MXN", label: "Mexican Peso (MXN)" },
  { value: "MYR", label: "Malaysian Ringgit (MYR)" },
  { value: "NPR", label: "Nepalese Rupee (NPR)" },
  { value: "NZD", label: "New Zealand Dollar (NZD)" },
  { value: "PHP", label: "Philippine Peso (PHP)" },
  { value: "PLN", label: "Polish Zloty (PLN)" },
  { value: "QAR", label: "Qatari Riyal (QAR)" },
  { value: "RUB", label: "Russian Ruble (RUB)" },
  { value: "SEK", label: "Swedish Krona (SEK)" },
  { value: "SGD", label: "Singapore Dollar (SGD)" },
  { value: "TRY", label: "Turkish Lira (TRY)" },
  { value: "TWD", label: "Taiwan Dollar (TWD)" },
  { value: "TZS", label: "Tanzanian Shilling (TZS)" },
  { value: "UGX", label: "Ugandan Shilling (UGX)" },
  { value: "VND", label: "Vietnamese Dong (VND)" },
  { value: "ZAR", label: "South African Rand (ZAR)" },
]

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "America/Sao_Paulo", label: "Brasilia Time" },
  { value: "America/Mexico_City", label: "Central Time (Mexico)" },
  { value: "America/Bogota", label: "Colombia Time" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time" },
  { value: "Europe/Moscow", label: "Moscow Time" },
  { value: "Europe/Istanbul", label: "Turkey Time" },
  { value: "Africa/Lagos", label: "West Africa Time" },
  { value: "Africa/Cairo", label: "Eastern European Time" },
  { value: "Africa/Nairobi", label: "East Africa Time" },
  { value: "Africa/Johannesburg", label: "South Africa Time" },
  { value: "Africa/Casablanca", label: "Morocco Time" },
  { value: "Asia/Karachi", label: "Pakistan Standard Time" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Asia/Dhaka", label: "Bangladesh Time" },
  { value: "Asia/Bangkok", label: "Indochina Time (Thailand)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time" },
  { value: "Asia/Riyadh", label: "Arabia Standard Time" },
  { value: "Asia/Singapore", label: "Singapore Time" },
  { value: "Asia/Shanghai", label: "China Standard Time" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  { value: "Asia/Seoul", label: "Korea Standard Time" },
  { value: "Asia/Jakarta", label: "Western Indonesia Time" },
  { value: "Asia/Manila", label: "Philippine Time" },
  { value: "Asia/Kuala_Lumpur", label: "Malaysia Time" },
  { value: "Asia/Colombo", label: "Sri Lanka Time" },
  { value: "Asia/Kathmandu", label: "Nepal Time" },
  { value: "Asia/Taipei", label: "Taipei Time" },
  { value: "Asia/Ho_Chi_Minh", label: "Vietnam Time" },
  { value: "Australia/Sydney", label: "Australian Eastern Time" },
  { value: "Pacific/Auckland", label: "New Zealand Time" },
]

export function LocalizationTab({ tenant }: LocalizationTabProps) {
  const { refreshTenant } = useTenant()
  const [saving, setSaving] = useState(false)
  const [currency, setCurrency] = useState(tenant.currency)
  const [timezone, setTimezone] = useState(tenant.timezone)

  async function handleSave() {
    setSaving(true)
    try {
      await updateTenantLocalization({ currency, timezone })
      await refreshTenant()
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

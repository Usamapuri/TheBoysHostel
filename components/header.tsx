"use client"

import { Building2 } from "lucide-react"
import { useTenant } from "@/lib/tenant-context"

export function Header() {
  const { tenant } = useTenant()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground uppercase">
              {tenant?.name || "Loading..."}
            </h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>
    </header>
  )
}

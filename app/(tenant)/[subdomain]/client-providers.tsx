"use client"

import type React from "react"
import { TenantProvider } from "@/lib/tenant-context"
import { SessionProvider } from "@/components/auth/session-provider"

export function ClientProviders({
  children,
  subdomain,
}: {
  children: React.ReactNode
  subdomain: string
}) {
  return (
    <SessionProvider>
      <TenantProvider subdomain={subdomain}>
        {children}
      </TenantProvider>
    </SessionProvider>
  )
}

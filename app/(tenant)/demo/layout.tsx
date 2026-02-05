"use client"

import { SessionProvider } from "@/components/auth/session-provider"
import { TenantProvider } from "@/lib/tenant-context"

// Force dynamic rendering for demo route (authentication required)
export const dynamic = 'force-dynamic'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <TenantProvider subdomain="demo">
        {children}
      </TenantProvider>
    </SessionProvider>
  )
}

import type React from "react"
import { TenantProvider } from "@/lib/tenant-context"
import { SessionProvider } from "@/components/auth/session-provider"

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  
  return (
    <SessionProvider>
      <TenantProvider subdomain={subdomain}>
        {children}
      </TenantProvider>
    </SessionProvider>
  )
}

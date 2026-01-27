"use client"

import type React from "react"
import { TenantProvider } from "@/lib/tenant-context"
import { SessionProvider } from "@/components/auth/session-provider"
import { useParams } from "next/navigation"

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  return (
    <SessionProvider>
      <TenantProvider subdomain={subdomain}>
        {children}
      </TenantProvider>
    </SessionProvider>
  )
}

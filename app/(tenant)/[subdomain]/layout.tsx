import type React from "react"
import { ClientProviders } from "./client-providers"

// Force dynamic rendering for all tenant routes
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  
  return (
    <ClientProviders subdomain={subdomain}>
      {children}
    </ClientProviders>
  )
}

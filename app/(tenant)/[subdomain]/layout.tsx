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
  
  // Note: Authentication is handled by proxy.ts middleware
  // The middleware redirects unauthenticated users to /login
  // This layout wraps all pages including login, so we don't add auth checks here
  
  return (
    <ClientProviders subdomain={subdomain}>
      {children}
    </ClientProviders>
  )
}

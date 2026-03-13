"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

// ============================================================================
// SILENT TENANT CONTEXT - Build-Safe, SSR-Safe, Never Throws
// ============================================================================

export interface Tenant {
  id: string
  name: string
  subdomain: string
  createdAt: Date
  isActive: boolean
  logoUrl: string | null
  currency: string
  timezone: string
  primaryColor: string
  backgroundColor: string
  address: string | null
  phone: string | null
  contactEmail: string | null
}

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  subdomain: string
  refreshTenant: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({
  children,
  subdomain,
}: {
  children: React.ReactNode
  subdomain: string
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchTenant() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/tenant/${subdomain}`, { cache: 'no-store' })
      
      if (!response.ok) {
        throw new Error(`Tenant not found: ${subdomain}`)
      }

      const data = await response.json()
      setTenant(data)
    } catch (err) {
      console.error('Error fetching tenant:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant')
      setTenant(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (subdomain) {
      fetchTenant()
    } else {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain])

  async function refreshTenant() {
    if (subdomain) {
      await fetchTenant()
    }
  }

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error, subdomain, refreshTenant }}>
      {children}
    </TenantContext.Provider>
  )
}

// SILENT HOOK: NEVER throws, NEVER logs, ALWAYS returns safe value
export function useTenant(): TenantContextType {
  // Defensive: Try-catch to prevent ANY errors during build/SSR
  try {
    const context = useContext(TenantContext)
    
    // NULL-SAFE: Return safe default if no context (build/SSR/static generation)
    if (!context) {
      return {
        tenant: null,
        isLoading: false,
        error: null,
        subdomain: '',
        refreshTenant: async () => {},
      }
    }
    
    return context
  } catch (error) {
    // Silently handle ANY context errors during build
    return {
      tenant: null,
      isLoading: false,
      error: null,
      subdomain: '',
      refreshTenant: async () => {},
    }
  }
}

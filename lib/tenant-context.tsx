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
}

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  subdomain: string
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

  useEffect(() => {
    async function fetchTenant() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch tenant data from API route
        const response = await fetch(`/api/tenant/${subdomain}`)
        
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

    if (subdomain) {
      fetchTenant()
    } else {
      setIsLoading(false)
    }
  }, [subdomain])

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error, subdomain }}>
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
    }
  }
}

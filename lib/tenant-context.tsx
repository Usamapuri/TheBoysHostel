"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

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

export function useTenant() {
  const context = useContext(TenantContext)
  
  // Return safe default instead of throwing during SSR/build
  if (context === undefined) {
    // During SSR or when outside provider, return safe defaults
    if (typeof window === 'undefined') {
      // Server-side: return loading state
      return {
        tenant: null,
        isLoading: true,
        error: null,
        subdomain: '',
      }
    }
    // Client-side: this is an actual error
    throw new Error('useTenant must be used within a TenantProvider')
  }
  
  return context
}

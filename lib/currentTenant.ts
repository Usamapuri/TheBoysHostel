/**
 * Current Tenant Resolution
 * 
 * This file handles dynamic tenant resolution based on subdomain.
 * It works with both server-side and client-side contexts.
 */

import { headers } from 'next/headers'
import { cache } from 'react'
import { prisma } from './db'

// Fallback tenant ID for development/testing
export const FALLBACK_TENANT_ID = "the-boys-hostel-tenant-id"

/**
 * Gets the current tenant ID from subdomain
 * This function is server-side only and uses Next.js headers
 */
export const getCurrentTenantId = cache(async (): Promise<string> => {
  try {
    // Try to get subdomain from headers (set by middleware)
    const headersList = headers()
    const subdomain = headersList.get('x-subdomain')
    
    if (!subdomain) {
      // No subdomain, return fallback
      return FALLBACK_TENANT_ID
    }

    // Special handling for demo subdomain
    if (subdomain === 'demo') {
      // Return a demo tenant ID or the fallback
      return FALLBACK_TENANT_ID
    }

    // Fetch tenant by subdomain
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: { id: true },
    })

    if (!tenant) {
      console.warn(`Tenant not found for subdomain: ${subdomain}, using fallback`)
      return FALLBACK_TENANT_ID
    }

    return tenant.id
  } catch (error) {
    console.error('Error resolving tenant ID:', error)
    return FALLBACK_TENANT_ID
  }
})

/**
 * Gets tenant ID synchronously (for client components)
 * This should be used with TenantContext
 */
export function getTenantIdFromContext(tenantId?: string): string {
  return tenantId || FALLBACK_TENANT_ID
}

/**
 * Current Tenant Resolution
 * 
 * This file handles dynamic tenant resolution based on subdomain.
 * It works with both server-side and client-side contexts.
 */

import { headers } from 'next/headers'
import { cache } from 'react'
import { prisma } from './db'

/**
 * Gets the current tenant ID from subdomain
 * This function is server-side only and uses Next.js headers
 */
export const getCurrentTenantId = cache(async (): Promise<string> => {
  try {
    // Try to get subdomain from headers (set by middleware)
    const headersList = await headers()
    const subdomain = headersList.get('x-subdomain')
    
    if (!subdomain) {
      throw new Error('No subdomain header found - tenant cannot be determined')
    }

    // Fetch tenant by subdomain (works for demo, theboyshostel, or any tenant)
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: { id: true },
    })

    if (!tenant) {
      throw new Error(`Tenant not found for subdomain: ${subdomain}`)
    }

    return tenant.id
  } catch (error) {
    console.error('Error resolving tenant ID:', error)
    throw error
  }
})

/**
 * Gets tenant ID synchronously (for client components)
 * This should be used with TenantContext
 */
export function getTenantIdFromContext(tenantId?: string): string {
  if (!tenantId) {
    throw new Error('Tenant ID is required but not provided in context')
  }
  return tenantId
}

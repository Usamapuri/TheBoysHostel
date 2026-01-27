"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export interface RegisterHostelInput {
  hostelName: string
  subdomain: string
  adminEmail: string
  adminName: string
  password: string
}

export interface RegisterHostelResult {
  success: boolean
  subdomain?: string
  error?: string
}

export async function registerHostel(
  data: RegisterHostelInput
): Promise<RegisterHostelResult> {
  try {
    // Validate subdomain format (alphanumeric and hyphens only)
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(data.subdomain)) {
      return {
        success: false,
        error: "Subdomain can only contain lowercase letters, numbers, and hyphens",
      }
    }

    // Reserved subdomains
    const reservedSubdomains = [
      "www",
      "api",
      "admin",
      "app",
      "dashboard",
      "login",
      "signup",
      "register",
    ]
    
    if (reservedSubdomains.includes(data.subdomain.toLowerCase())) {
      return {
        success: false,
        error: "This subdomain is reserved",
      }
    }

    // Check if subdomain is available
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain: data.subdomain.toLowerCase() },
    })

    if (existingTenant) {
      return {
        success: false,
        error: "This subdomain is already taken",
      }
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail.toLowerCase() },
    })

    if (existingUser) {
      return {
        success: false,
        error: "This email is already registered",
      }
    }

    // Validate password strength
    if (data.password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.hostelName,
          subdomain: data.subdomain.toLowerCase(),
          isActive: true,
        },
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail.toLowerCase(),
          password: hashedPassword,
          role: UserRole.ADMIN,
          tenantId: tenant.id,
        },
      })

      return { tenant, user }
    })

    return {
      success: true,
      subdomain: result.tenant.subdomain,
    }
  } catch (error) {
    console.error("Error registering hostel:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function checkSubdomainAvailability(
  subdomain: string
): Promise<boolean> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: subdomain.toLowerCase() },
    })
    return !tenant
  } catch (error) {
    console.error("Error checking subdomain:", error)
    return false
  }
}

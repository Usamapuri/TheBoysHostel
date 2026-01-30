"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { sendNewRegistrationNotification } from "./email"

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

    // Check if subdomain is available (check both tenants and pending requests)
    const [existingTenant, existingRequest] = await Promise.all([
      prisma.tenant.findUnique({
        where: { subdomain: data.subdomain.toLowerCase() },
      }),
      prisma.tenantRegistrationRequest.findUnique({
        where: { subdomain: data.subdomain.toLowerCase() },
      }),
    ])

    if (existingTenant || existingRequest) {
      return {
        success: false,
        error: "This subdomain is already taken or has a pending request",
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

    // Hash password (ready to use when approved)
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create registration request (pending super admin approval)
    const request = await prisma.tenantRegistrationRequest.create({
      data: {
        hostelName: data.hostelName,
        subdomain: data.subdomain.toLowerCase(),
        adminEmail: data.adminEmail.toLowerCase(),
        adminName: data.adminName,
        password: hashedPassword,
        status: 'PENDING',
      },
    })

    // Send email notification to super admin about new registration request
    const superAdmins = await prisma.user.findMany({
      where: { role: UserRole.SUPERADMIN },
      select: { email: true },
    })
    
    for (const admin of superAdmins) {
      await sendNewRegistrationNotification(
        admin.email,
        data.hostelName,
        data.subdomain,
        data.adminName,
        data.adminEmail
      )
    }

    return {
      success: true,
      subdomain: request.subdomain,
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
    const [tenant, request] = await Promise.all([
      prisma.tenant.findUnique({
        where: { subdomain: subdomain.toLowerCase() },
      }),
      prisma.tenantRegistrationRequest.findUnique({
        where: { subdomain: subdomain.toLowerCase() },
      }),
    ])
    return !tenant && !request
  } catch (error) {
    console.error("Error checking subdomain:", error)
    return false
  }
}

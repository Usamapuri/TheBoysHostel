"use server"

import { prisma } from "@/lib/db"
import { UserRole, RegistrationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import {
  sendRegistrationApprovedEmail,
  sendRegistrationRejectedEmail,
  sendTenantSuspensionEmail,
  sendTenantActivationEmail,
} from "./email"

// ============================================
// REGISTRATION APPROVAL/REJECTION
// ============================================

export async function approveRegistration(
  requestId: string,
  superAdminId: string
): Promise<{ success: boolean; error?: string; tenant?: { name: string; subdomain: string } }> {
  try {
    // Verify super admin
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId },
    })

    if (!superAdmin || superAdmin.role !== UserRole.SUPERADMIN) {
      return {
        success: false,
        error: "Unauthorized: Only super admins can approve registrations",
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get registration request
      const request = await tx.tenantRegistrationRequest.findUnique({
        where: { id: requestId },
      })

      if (!request) {
        throw new Error("Registration request not found")
      }

      if (request.status !== RegistrationStatus.PENDING) {
        throw new Error(`Request has already been ${request.status.toLowerCase()}`)
      }

      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: request.hostelName,
          subdomain: request.subdomain,
          isActive: true,
          approvedAt: new Date(),
          approvedBy: superAdminId,
        },
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          name: request.adminName,
          email: request.adminEmail,
          password: request.password, // Already hashed during registration
          role: UserRole.ADMIN,
          tenantId: tenant.id,
        },
      })

      // Update request status
      await tx.tenantRegistrationRequest.update({
        where: { id: requestId },
        data: {
          status: RegistrationStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: superAdminId,
        },
      })

      return { tenant, user }
    })

    // Send approval email to admin
    await sendRegistrationApprovedEmail(
      result.user.email,
      result.tenant.name,
      result.tenant.subdomain,
      result.user.name
    )

    revalidatePath("/superadmin")
    return {
      success: true,
      tenant: {
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
      },
    }
  } catch (error) {
    console.error("Error approving registration:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve registration",
    }
  }
}

export async function rejectRegistration(
  requestId: string,
  superAdminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify super admin
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId },
    })

    if (!superAdmin || superAdmin.role !== UserRole.SUPERADMIN) {
      return {
        success: false,
        error: "Unauthorized: Only super admins can reject registrations",
      }
    }

    // Get registration request
    const request = await prisma.tenantRegistrationRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return {
        success: false,
        error: "Registration request not found",
      }
    }

    if (request.status !== RegistrationStatus.PENDING) {
      return {
        success: false,
        error: `Request has already been ${request.status.toLowerCase()}`,
      }
    }

    // Update request status
    await prisma.tenantRegistrationRequest.update({
      where: { id: requestId },
      data: {
        status: RegistrationStatus.REJECTED,
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedBy: superAdminId,
      },
    })

    // Send rejection email to applicant
    await sendRegistrationRejectedEmail(
      request.adminEmail,
      request.hostelName,
      request.adminName,
      reason
    )

    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return {
      success: false,
      error: "Failed to reject registration",
    }
  }
}

// ============================================
// TENANT MANAGEMENT
// ============================================

export async function suspendTenant(
  tenantId: string,
  superAdminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify super admin
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId },
    })

    if (!superAdmin || superAdmin.role !== UserRole.SUPERADMIN) {
      return {
        success: false,
        error: "Unauthorized: Only super admins can suspend tenants",
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: superAdminId,
        suspensionReason: reason,
      },
      include: {
        users: {
          where: { role: UserRole.ADMIN },
          take: 1,
        },
      },
    })

    // Send suspension notification email to tenant admin
    if (tenant.users[0]) {
      await sendTenantSuspensionEmail(
        tenant.users[0].email,
        tenant.name,
        tenant.users[0].name,
        reason
      )
    }

    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Error suspending tenant:", error)
    return {
      success: false,
      error: "Failed to suspend tenant",
    }
  }
}

export async function activateTenant(
  tenantId: string,
  superAdminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify super admin
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId },
    })

    if (!superAdmin || superAdmin.role !== UserRole.SUPERADMIN) {
      return {
        success: false,
        error: "Unauthorized: Only super admins can activate tenants",
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isActive: true,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null,
      },
      include: {
        users: {
          where: { role: UserRole.ADMIN },
          take: 1,
        },
      },
    })

    // Send activation notification email to tenant admin
    if (tenant.users[0]) {
      await sendTenantActivationEmail(
        tenant.users[0].email,
        tenant.name,
        tenant.users[0].name
      )
    }

    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Error activating tenant:", error)
    return {
      success: false,
      error: "Failed to activate tenant",
    }
  }
}

// ============================================
// DATA FETCHING FOR SUPER ADMIN DASHBOARD
// ============================================

export async function getAllRegistrationRequests(status?: RegistrationStatus) {
  try {
    const requests = await prisma.tenantRegistrationRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        reviewedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    })
    return requests
  } catch (error) {
    console.error("Error fetching registration requests:", error)
    return []
  }
}

export async function getAllTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            rooms: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return tenants
  } catch (error) {
    console.error("Error fetching tenants:", error)
    return []
  }
}

export async function getTenantDetails(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            students: true,
            rooms: true,
            transactions: true,
            expenses: true,
          },
        },
      },
    })
    return tenant
  } catch (error) {
    console.error("Error fetching tenant details:", error)
    return null
  }
}

export async function getSystemAnalytics() {
  try {
    const [
      totalTenants,
      activeTenants,
      pendingRequests,
      totalStudents,
      totalRooms,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.tenantRegistrationRequest.count({ where: { status: RegistrationStatus.PENDING } }),
      prisma.student.count(),
      prisma.room.count(),
    ])

    // Get monthly tenant growth (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentTenants = await prisma.tenant.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    })

    // Group by month
    const growthByMonth: { [key: string]: number } = {}
    recentTenants.forEach(tenant => {
      const month = tenant.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      growthByMonth[month] = (growthByMonth[month] || 0) + 1
    })

    return {
      totalTenants,
      activeTenants,
      suspendedTenants: totalTenants - activeTenants,
      pendingRequests,
      totalStudents,
      totalRooms,
      growthByMonth,
    }
  } catch (error) {
    console.error("Error fetching system analytics:", error)
    return {
      totalTenants: 0,
      activeTenants: 0,
      suspendedTenants: 0,
      pendingRequests: 0,
      totalStudents: 0,
      totalRooms: 0,
      growthByMonth: {},
    }
  }
}

// ============================================
// USER MANAGEMENT ACROSS TENANTS
// ============================================

export async function createUserForTenant(
  tenantId: string,
  userData: {
    name: string
    email: string
    password: string
    role: UserRole
  },
  superAdminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify super admin
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId },
    })

    if (!superAdmin || superAdmin.role !== UserRole.SUPERADMIN) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    // Create user
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        role: userData.role,
        tenantId,
      },
    })

    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      error: "Failed to create user",
    }
  }
}

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getCurrentTenantId } from "@/lib/currentTenant"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.SUPERADMIN
}

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  return session
}

export async function updateTenantProfile(data: {
  name: string
  address?: string
  phone?: string
  contactEmail?: string
}) {
  await requireSession()
  const tenantId = await getCurrentTenantId()

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      contactEmail: data.contactEmail || null,
    },
  })

  revalidatePath("/")
  return { success: true }
}

export async function updateTenantBranding(data: {
  logoUrl?: string
  primaryColor: string
}) {
  const session = await requireSession()

  if (!isAdmin(session.user.role)) {
    throw new Error("Only admins can update branding settings")
  }

  const tenantId = await getCurrentTenantId()

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor,
    },
  })

  revalidatePath("/")
  return { success: true }
}

export async function updateTenantLocalization(data: {
  currency: string
  timezone: string
}) {
  const session = await requireSession()

  if (!isAdmin(session.user.role)) {
    throw new Error("Only admins can update localization settings")
  }

  const tenantId = await getCurrentTenantId()

  const validCurrencies = ["USD", "INR", "NGN", "EUR", "GBP"]
  if (!validCurrencies.includes(data.currency)) {
    throw new Error("Invalid currency")
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      currency: data.currency,
      timezone: data.timezone,
    },
  })

  revalidatePath("/")
  return { success: true }
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const session = await requireSession()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user) throw new Error("User not found")

  const valid = await bcrypt.compare(data.currentPassword, user.password)
  if (!valid) throw new Error("Current password is incorrect")

  if (data.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters")
  }

  const hashed = await bcrypt.hash(data.newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return { success: true }
}

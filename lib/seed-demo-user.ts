/**
 * Seed Demo User Script
 * 
 * This script creates a demo user and demo tenant for testing purposes.
 * Run this after completing the Phase 3 migration.
 * 
 * Usage: pnpm tsx lib/seed-demo-user.ts
 */

import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

async function seedDemoUser() {
  console.log("🌱 Seeding demo user...")

  try {
    // Check if demo tenant already exists
    let demoTenant = await prisma.tenant.findUnique({
      where: { subdomain: "demo" },
    })

    if (!demoTenant) {
      console.log("Creating demo tenant...")
      demoTenant = await prisma.tenant.create({
        data: {
          name: "Demo Hostel",
          subdomain: "demo",
          isActive: true,
        },
      })
      console.log("✅ Demo tenant created:", demoTenant.subdomain)
    } else {
      console.log("✅ Demo tenant already exists")
    }

    // Check if demo user already exists
    const existingDemoUser = await prisma.user.findUnique({
      where: { email: "demo@theboyshostel.com" },
    })

    if (existingDemoUser) {
      console.log("✅ Demo user already exists")
      console.log("\n📝 Demo Credentials:")
      console.log("Email: demo@theboyshostel.com")
      console.log("Password: demo123456")
      console.log("URL: http://demo.localhost:3000")
      return
    }

    // Create demo user
    console.log("Creating demo user...")
    const hashedPassword = await bcrypt.hash("demo123456", 12)

    const demoUser = await prisma.user.create({
      data: {
        name: "Demo Admin",
        email: "demo@theboyshostel.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
        tenantId: demoTenant.id,
      },
    })

    console.log("✅ Demo user created!")
    console.log("\n📝 Demo Credentials:")
    console.log("Email:", demoUser.email)
    console.log("Password: demo123456")
    console.log("URL: http://demo.localhost:3000")
    console.log("\n🎉 Demo setup complete!")
  } catch (error) {
    console.error("❌ Error seeding demo user:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDemoUser()

/**
 * Complete Database Seeding
 * Seeds both "The Boys Hostel" and "Demo" tenants with users
 */

import { prisma } from "../lib/db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

async function main() {
  console.log("🌱 Starting database seeding...")

  try {
    // ============================================
    // 1. CREATE "THE BOYS HOSTEL" TENANT
    // ============================================
    console.log("\n📍 Creating 'The Boys Hostel' tenant...")
    
    let theBoysHostel = await prisma.tenant.findUnique({
      where: { subdomain: "theboyshostel" },
    })

    if (!theBoysHostel) {
      theBoysHostel = await prisma.tenant.create({
        data: {
          id: "the-boys-hostel-tenant-id",
          name: "The Boys Hostel",
          subdomain: "theboyshostel",
          isActive: true,
        },
      })
      console.log("✅ The Boys Hostel tenant created")
    } else {
      console.log("✅ The Boys Hostel tenant already exists")
    }

    // Create admin user for The Boys Hostel
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@theboyshostel.com" },
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123456", 12)
      const adminUser = await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@theboyshostel.com",
          password: hashedPassword,
          role: UserRole.ADMIN,
          tenantId: theBoysHostel.id,
        },
      })
      console.log("✅ Admin user created for The Boys Hostel")
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Password: admin123456`)
    } else {
      console.log("✅ Admin user already exists for The Boys Hostel")
    }

    // ============================================
    // 2. CREATE "DEMO" TENANT
    // ============================================
    console.log("\n📍 Creating 'Demo' tenant...")
    
    let demoTenant = await prisma.tenant.findUnique({
      where: { subdomain: "demo" },
    })

    if (!demoTenant) {
      demoTenant = await prisma.tenant.create({
        data: {
          name: "Demo Hostel",
          subdomain: "demo",
          isActive: true,
        },
      })
      console.log("✅ Demo tenant created")
    } else {
      console.log("✅ Demo tenant already exists")
    }

    // Create demo user
    const existingDemoUser = await prisma.user.findUnique({
      where: { email: "demo@theboyshostel.com" },
    })

    if (!existingDemoUser) {
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
      console.log("✅ Demo user created")
      console.log(`   Email: ${demoUser.email}`)
      console.log(`   Password: demo123456`)
    } else {
      console.log("✅ Demo user already exists")
    }

    // ============================================
    // 3. SUMMARY
    // ============================================
    console.log("\n" + "=".repeat(60))
    console.log("🎉 DATABASE SEEDING COMPLETE!")
    console.log("=".repeat(60))

    console.log("\n📝 LOGIN CREDENTIALS:")
    console.log("\n1️⃣  THE BOYS HOSTEL")
    console.log("   URL: http://theboyshostel.localhost:3000")
    console.log("   Email: admin@theboyshostel.com")
    console.log("   Password: admin123456")

    console.log("\n2️⃣  DEMO HOSTEL (Auto-login)")
    console.log("   URL: http://demo.localhost:3000")
    console.log("   Email: demo@theboyshostel.com")
    console.log("   Password: demo123456")

    console.log("\n🚀 NEXT STEPS:")
    console.log("   1. Ensure NEXTAUTH_SECRET is set in .env")
    console.log("   2. Run: pnpm dev")
    console.log("   3. Visit: http://demo.localhost:3000")
    console.log("\n✨ Your multi-tenant SaaS platform is ready!")
    console.log("=".repeat(60) + "\n")

  } catch (error) {
    console.error("\n❌ Error during seeding:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

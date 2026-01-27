/**
 * Multi-tenant Migration Script
 * 
 * This script creates "The Boys Hostel" tenant and assigns all existing data to it.
 * Run this script AFTER running the Prisma migration to add the Tenant model and tenantId fields.
 * 
 * Usage: npx tsx prisma/migrate-to-multitenant.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This tenant ID must match the one in lib/currentTenant.ts
const TENANT_ID = 'the-boys-hostel-tenant-id'
const TENANT_NAME = 'The Boys Hostel'
const TENANT_SUBDOMAIN = 'theboyshostel'

async function main() {
  console.log('🚀 Starting multi-tenant migration...\n')

  try {
    // Step 1: Create the tenant
    console.log('Step 1: Creating "The Boys Hostel" tenant...')
    
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: TENANT_ID },
    })

    let tenant
    if (existingTenant) {
      console.log('✅ Tenant already exists, skipping creation')
      tenant = existingTenant
    } else {
      tenant = await prisma.tenant.create({
        data: {
          id: TENANT_ID,
          name: TENANT_NAME,
          subdomain: TENANT_SUBDOMAIN,
        },
      })
      console.log(`✅ Created tenant: ${tenant.name} (${tenant.subdomain})`)
    }

    console.log()

    // Step 2: Update all existing data with tenantId
    console.log('Step 2: Assigning all existing data to the tenant...\n')

    // Update Locations
    const locationsUpdated = await prisma.location.updateMany({
      where: { tenantId: null },
      data: { tenantId: TENANT_ID },
    })
    console.log(`✅ Updated ${locationsUpdated.count} locations`)

    // Update Rooms
    const roomsUpdated = await prisma.room.updateMany({
      where: { tenantId: null },
      data: { tenantId: TENANT_ID },
    })
    console.log(`✅ Updated ${roomsUpdated.count} rooms`)

    // Update Students
    const studentsUpdated = await prisma.student.updateMany({
      where: { tenantId: null },
      data: { tenantId: TENANT_ID },
    })
    console.log(`✅ Updated ${studentsUpdated.count} students`)

    // Update Transactions
    const transactionsUpdated = await prisma.transaction.updateMany({
      where: { tenantId: null },
      data: { tenantId: TENANT_ID },
    })
    console.log(`✅ Updated ${transactionsUpdated.count} transactions`)

    // Update Expenses
    const expensesUpdated = await prisma.expense.updateMany({
      where: { tenantId: null },
      data: { tenantId: TENANT_ID },
    })
    console.log(`✅ Updated ${expensesUpdated.count} expenses`)

    // Update Activity Logs
    const activityLogsUpdated = await prisma.activityLog.updateMany({
      where: { tenantId: null },
      data: { tenantId: TENANT_ID },
    })
    console.log(`✅ Updated ${activityLogsUpdated.count} activity logs`)

    // Update Maintenance Tasks
    const maintenanceTasksUpdated = await prisma.maintenanceTask.updateMany({
      where: { tenantId: null },
      data: { tenantId: TENANT_ID },
    })
    console.log(`✅ Updated ${maintenanceTasksUpdated.count} maintenance tasks`)

    console.log('\n🎉 Migration completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   Tenant: ${tenant.name}`)
    console.log(`   Subdomain: ${tenant.subdomain}`)
    console.log(`   Total records migrated: ${
      locationsUpdated.count +
      roomsUpdated.count +
      studentsUpdated.count +
      transactionsUpdated.count +
      expensesUpdated.count +
      activityLogsUpdated.count +
      maintenanceTasksUpdated.count
    }`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

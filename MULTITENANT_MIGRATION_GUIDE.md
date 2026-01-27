# Multi-Tenant SaaS Migration Guide

This guide will help you complete the transformation of your hostel management app into a multi-tenant SaaS platform.

## 🎯 What's Been Done

### ✅ Task 1: Schema Update (COMPLETED)
- Created a new `Tenant` model with fields: `id`, `name`, `subdomain`, and `createdAt`
- Added `tenantId` field to all existing models:
  - Locations
  - Rooms
  - Students
  - Transactions
  - Expenses
  - ActivityLogs
  - MaintenanceTasks
- All `tenantId` fields are required and cascade on delete

### ✅ Task 2: Multi-tenant Data Logic (COMPLETED)
- Updated all Prisma queries in `lib/actions.ts` to filter by `tenantId`
- Created `lib/currentTenant.ts` with hardcoded tenant ID for testing
- All data operations now respect tenant boundaries

### ✅ Task 3: Migration Preparation (COMPLETED)
- Created migration script: `prisma/migrate-to-multitenant.ts`
- Script will create "The Boys Hostel" tenant
- Script will assign all existing data to this tenant

---

## 🚀 Next Steps: Running the Migration

Follow these steps **in order** to complete the migration:

### Step 1: Install Dependencies (if needed)

Make sure you have `tsx` installed to run TypeScript files:

```bash
pnpm add -D tsx
```

### Step 2: Create the Prisma Migration

Generate a new migration to add the Tenant model and tenantId fields:

```bash
npx prisma migrate dev --name add_multitenant_support
```

⚠️ **IMPORTANT**: When Prisma asks about data loss or nullable fields, you may need to handle it. The migration script we created will populate the tenantId fields afterward.

If the migration fails due to non-nullable constraints, you have two options:

**Option A - Make fields nullable first:**
1. Temporarily change all `tenantId` fields in `schema.prisma` to `tenantId String?`
2. Run migration: `npx prisma migrate dev --name add_multitenant_nullable`
3. Run the migration script (Step 3)
4. Change back to `tenantId String` (non-nullable)
5. Run final migration: `npx prisma migrate dev --name make_tenant_required`

**Option B - Use a two-step SQL migration:**
The migration will automatically handle this if you accept the prompts.

### Step 3: Run the Data Migration Script

After the schema migration is complete, run the data migration script:

```bash
npx tsx prisma/migrate-to-multitenant.ts
```

This script will:
- Create "The Boys Hostel" tenant with subdomain "theboyshostel"
- Assign all existing locations, rooms, students, transactions, expenses, activity logs, and maintenance tasks to this tenant
- Provide a summary of migrated records

### Step 4: Generate Prisma Client

Regenerate the Prisma client with the new schema:

```bash
npx prisma generate
```

### Step 5: Restart Your Development Server

```bash
pnpm dev
```

---

## 🧪 Testing Multi-Tenancy

After migration, test the following:

1. **Data Isolation**: All existing data should still be visible and functional
2. **New Records**: Create new locations, rooms, students - they should all get the current tenantId
3. **Queries**: Verify that all queries respect tenant boundaries

### Hardcoded Tenant ID

Currently, the tenant ID is hardcoded in `lib/currentTenant.ts`:

```typescript
export const CURRENT_TENANT_ID = "the-boys-hostel-tenant-id"
```

This allows you to test data isolation before implementing subdomain routing.

---

## 🔮 Future Enhancements

To make this a production-ready multi-tenant SaaS, you'll need to:

### 1. Dynamic Tenant Resolution

Replace the hardcoded tenant ID with dynamic resolution based on:
- Subdomain extraction from request URL
- Authentication/session data
- Middleware-based routing

Example implementation:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]
  
  // Store subdomain in header for use in server actions
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-subdomain', subdomain)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
```

### 2. Tenant Registration & Onboarding

- Create tenant signup flow
- Generate unique subdomains
- Initial setup wizard for new tenants
- Default data seeding per tenant

### 3. Authentication Integration

- User accounts linked to tenants
- Multi-tenant user management
- Role-based access control (RBAC)
- Tenant admin panel

### 4. Billing & Subscriptions

- Subscription tiers per tenant
- Usage tracking
- Payment integration (Stripe, etc.)
- Feature flags based on subscription

### 5. Performance Optimizations

- Database indexing on tenantId fields
- Connection pooling per tenant
- Caching strategies
- Query optimization

### 6. Tenant Management Dashboard

- Super admin panel
- Tenant analytics
- Usage monitoring
- Tenant suspension/activation

---

## 📋 Database Indexes Recommendation

For optimal performance, consider adding these indexes:

```prisma
model Location {
  // ... fields ...
  @@index([tenantId])
}

model Room {
  // ... fields ...
  @@index([tenantId])
  @@index([tenantId, locationId])
}

model Student {
  // ... fields ...
  @@index([tenantId])
  @@index([tenantId, status])
}

model Transaction {
  // ... fields ...
  @@index([tenantId])
  @@index([tenantId, month])
  @@index([tenantId, studentId])
}

// ... similar for other models
```

---

## ⚠️ Important Notes

1. **Backup Your Database**: Before running migrations, always backup your production database
2. **Test First**: Run migrations on a development/staging environment first
3. **Data Validation**: After migration, validate that all data is correctly assigned
4. **Rollback Plan**: Have a rollback strategy in case something goes wrong

---

## 🆘 Troubleshooting

### Migration Fails with "Column cannot be null"

If you get errors about null constraints:
1. Make tenantId nullable first
2. Run migration script
3. Make tenantId required
4. Run another migration

### No Data Visible After Migration

Check:
1. The tenant ID in `lib/currentTenant.ts` matches the one created
2. Run the migration script to assign data to the tenant
3. Check database directly to verify tenantId values

### Prisma Client Type Errors

After schema changes:
```bash
npx prisma generate
```

Then restart your TypeScript server in your IDE.

---

## 📞 Support

If you encounter issues:
1. Check the Prisma migration logs
2. Verify database state directly
3. Review the migration script output
4. Check for TypeScript errors in your IDE

---

## 🎉 Congratulations!

You've successfully transformed your app into a multi-tenant SaaS platform! Your data is now isolated by tenant, and you're ready to scale to multiple customers.

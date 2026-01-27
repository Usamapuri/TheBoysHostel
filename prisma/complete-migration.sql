-- Complete Migration: Phase 1 + Phase 3
-- This safely migrates your existing data to the new multi-tenant + auth schema

-- ============================================
-- PHASE 1: MULTI-TENANCY
-- ============================================

-- Create Tenant table
CREATE TABLE IF NOT EXISTS "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert "The Boys Hostel" tenant if it doesn't exist
INSERT INTO "Tenant" (id, name, subdomain, "isActive", "createdAt")
VALUES ('the-boys-hostel-tenant-id', 'The Boys Hostel', 'theboyshostel', true, CURRENT_TIMESTAMP)
ON CONFLICT (subdomain) DO NOTHING;

-- Add tenantId columns as nullable first
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "MaintenanceTask" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Populate tenantId for all existing records
UPDATE "Location" SET "tenantId" = 'the-boys-hostel-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Room" SET "tenantId" = 'the-boys-hostel-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Student" SET "tenantId" = 'the-boys-hostel-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Transaction" SET "tenantId" = 'the-boys-hostel-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Expense" SET "tenantId" = 'the-boys-hostel-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "ActivityLog" SET "tenantId" = 'the-boys-hostel-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "MaintenanceTask" SET "tenantId" = 'the-boys-hostel-tenant-id' WHERE "tenantId" IS NULL;

-- Make tenantId NOT NULL
ALTER TABLE "Location" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Room" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Student" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ActivityLog" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "MaintenanceTask" ALTER COLUMN "tenantId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "Location" ADD CONSTRAINT IF NOT EXISTS "Location_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Room" ADD CONSTRAINT IF NOT EXISTS "Room_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Student" ADD CONSTRAINT IF NOT EXISTS "Student_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT IF NOT EXISTS "Transaction_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT IF NOT EXISTS "Expense_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" ADD CONSTRAINT IF NOT EXISTS "ActivityLog_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceTask" ADD CONSTRAINT IF NOT EXISTS "MaintenanceTask_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update unique constraint for roomNumber (unique per tenant)
ALTER TABLE "Room" DROP CONSTRAINT IF EXISTS "Room_roomNumber_key";
ALTER TABLE "Room" ADD CONSTRAINT IF NOT EXISTS "Room_tenantId_roomNumber_key" 
    UNIQUE ("tenantId", "roomNumber");

-- ============================================
-- PHASE 3: AUTHENTICATION
-- ============================================

-- Create UserRole enum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'STAFF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") 
        REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Account table (NextAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add unique constraint for Account
ALTER TABLE "Account" ADD CONSTRAINT IF NOT EXISTS "Account_provider_providerAccountId_key" 
    UNIQUE ("provider", "providerAccountId");

-- Create Session table (NextAuth)
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create VerificationToken table (NextAuth)
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Add unique constraint for VerificationToken
ALTER TABLE "VerificationToken" ADD CONSTRAINT IF NOT EXISTS "VerificationToken_identifier_token_key" 
    UNIQUE ("identifier", "token");

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify migration
SELECT 
    'Migration Complete!' as status,
    (SELECT COUNT(*) FROM "Tenant") as total_tenants,
    (SELECT COUNT(*) FROM "Location" WHERE "tenantId" = 'the-boys-hostel-tenant-id') as locations_migrated,
    (SELECT COUNT(*) FROM "Room" WHERE "tenantId" = 'the-boys-hostel-tenant-id') as rooms_migrated,
    (SELECT COUNT(*) FROM "Student" WHERE "tenantId" = 'the-boys-hostel-tenant-id') as students_migrated,
    (SELECT COUNT(*) FROM "User") as total_users;

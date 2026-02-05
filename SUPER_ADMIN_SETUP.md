# Super Admin Setup Guide

## Overview

Your hostel management app now has a complete super admin approval system! New hostel registrations require super admin approval before tenants can access the system.

## Quick Start

### 1. Update Database Schema

Run this command to apply the new schema with TenantRegistrationRequest model:

```bash
pnpm prisma db push
```

### 2. Seed Test Data

Run this command to create super admin, demo tenant, and The Boys Hostel:

```bash
pnpm db:seed
```

This will create:
- 1 Super Admin user
- 1 Demo tenant with full test data (students, rooms, finances, etc.)
- 1 The Boys Hostel tenant (empty, ready for your friends to add data)

### 3. Start Development Server

```bash
pnpm dev
```

## Login Credentials

After seeding, you'll have these accounts:

### Super Admin (Access from root domain)
- **Email:** `superadmin@hostelflow.com`
- **Password:** `SuperAdmin123!`
- **Access:** http://localhost:3000/superadmin/login
- **Dashboard:** http://localhost:3000/superadmin

### Demo Hostel (Full test data for testing)
- **Email:** `demo@hostel.com`
- **Password:** `Demo123!`
- **Access:** http://demo.localhost:3000/login
- **Dashboard:** http://demo.localhost:3000

### The Boys Hostel (Your friends' hostel - empty slate)
- **Email:** `admin@theboyshostel.com`
- **Password:** `Admin123!`
- **Access:** http://theboyshostel.localhost:3000/login
- **Dashboard:** http://theboyshostel.localhost:3000

## Super Admin Powers

Your super admin can:

### 1. Approve/Reject Registrations
- View all registration requests at `/superadmin/requests`
- Approve to create tenant + admin user
- Reject with custom reason
- Automatic email notifications sent to applicants

### 2. Manage Tenants
- View all tenants at `/superadmin/tenants`
- Suspend tenants (blocks all access)
- Activate suspended tenants
- View tenant details and statistics
- Access any tenant's dashboard

### 3. User Management
- View all users across all tenants
- Create/edit/delete users for any tenant
- Full cross-tenant user management

### 4. Analytics
- System-wide metrics at `/superadmin/analytics`
- Total tenants, students, rooms
- Tenant growth charts
- Platform health monitoring

## Registration Flow

### Old Flow (Immediate)
```
User fills form → Tenant created → Admin can login immediately
```

### New Flow (With Approval)
```
User fills form 
  → Registration REQUEST created (status: PENDING)
  → Super admin receives notification
  → Super admin reviews in dashboard
  → Super admin APPROVES
  → Tenant + Admin user created
  → Admin receives approval email
  → Admin can now login
```

## Notification System

Currently using **console logging** for email notifications. You'll see email content in the terminal when:
- New registration request submitted
- Registration approved
- Registration rejected
- Tenant suspended
- Tenant activated

**To integrate real emails:** Replace console.log in `/lib/email.ts` with an email service like:
- SendGrid
- Resend
- AWS SES
- Nodemailer

## Testing the System

### 1. Test Registration Request
1. Go to http://localhost:3000
2. Fill out "Register Your Hostel" form
3. Submit
4. Check that success message says "pending approval"
5. User should NOT be able to login yet

### 2. Test Super Admin Approval
1. Login as super admin: http://localhost:3000/superadmin/login
2. Go to "Registration Requests"
3. See the pending request
4. Click "Approve"
5. Check that tenant appears in "Manage Tenants"

### 3. Test Tenant Login After Approval
1. Try logging in with the tenant credentials
2. Should now work and show empty dashboard (except demo which has data)

### 4. Test Tenant Suspension
1. As super admin, go to "Manage Tenants"
2. Click suspend icon on a tenant
3. Provide reason
4. Confirm
5. Try logging in as that tenant - should fail with "account disabled" message

## Production Deployment

### Environment Variables Needed

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
```

### Railway Deployment

When you push to Railway:

1. Schema will be automatically applied (via build script)
2. **Important:** Run seed command ONCE in Railway terminal:
   ```bash
   pnpm db:seed
   ```
3. Super admin will be created
4. Test tenants will be available

### Custom Domain Setup

Update these values in `/middleware.ts`:
```typescript
const rootDomains = [
  'yourdomain.com',
  'www.yourdomain.com',
]
```

And in `/lib/auth-actions.ts` reserved subdomains list.

## File Structure

```
app/
├── superadmin/              # Super admin portal
│   ├── layout.tsx          # Auth protection + nav
│   ├── page.tsx            # Dashboard overview
│   ├── login/page.tsx      # Super admin login
│   ├── requests/page.tsx   # Approve/reject registrations
│   ├── tenants/
│   │   ├── page.tsx        # All tenants list
│   │   └── [tenantId]/page.tsx  # Tenant details
│   └── analytics/page.tsx  # System analytics

components/superadmin/
└── superadmin-nav.tsx      # Navigation bar

lib/
├── superadmin-actions.ts   # Server actions for approval/management
├── email.ts                # Email notification system
├── auth-actions.ts         # Updated: creates requests not tenants
└── auth.ts                 # Updated: allows super admin root login

prisma/
├── schema.prisma           # Updated: added TenantRegistrationRequest
└── seed.ts                 # Comprehensive seed with 3 accounts
```

## What Changed

### Database Schema
- Added `TenantRegistrationRequest` model
- Added `RegistrationStatus` enum
- Added approval/suspension tracking fields to `Tenant`
- Added `reviewedRequests` relation to `User`

### Authentication
- Super admins can login from root domain (no subdomain)
- Non-super admins blocked from root domain login
- Tenant admins must match their subdomain

### Middleware
- `/superadmin` routes bypass tenant subdomain rewriting
- Super admin portal accessible from root domain

### Registration
- Creates pending request instead of immediate tenant
- Users notified about approval process
- Subdomain reserved but not active until approved

## Next Steps

1. **Run database migration:** `pnpm prisma db push`
2. **Seed initial data:** `pnpm db:seed`
3. **Test locally:** Start dev server and test all flows
4. **Deploy to Railway:** Push changes (already done!)
5. **Run seed on Railway:** Execute seed command in Railway terminal
6. **Configure custom domain:** Update middleware and env vars

## Support

If you encounter issues:
1. Check that database is accessible
2. Verify all env vars are set
3. Check server logs for error details
4. Test super admin login first before testing tenants

---

**Congratulations!** Your multi-tenant hostel management platform now has enterprise-grade approval workflows! 🎉

# 🚀 Authentication Quick Start Guide

**Phase 3: Multi-Tenant Authentication & Onboarding**

Complete this guide in 10 minutes to enable authentication for your hostel management platform.

---

## ⚡ Quick Setup (5 Commands)

```bash
# 1. Generate NextAuth secret
$env:NEXTAUTH_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# 2. Add to .env file (create if doesn't exist)
"NEXTAUTH_URL=http://localhost:3000" | Out-File -Append .env -Encoding utf8
"NEXTAUTH_SECRET=$env:NEXTAUTH_SECRET" | Out-File -Append .env -Encoding utf8

# 3. Push database schema
pnpm prisma db push

# 4. Seed demo user
pnpm tsx lib/seed-demo-user.ts

# 5. Start development server
pnpm dev
```

**Done!** Visit http://demo.localhost:3000 to test.

---

## 📋 Step-by-Step Guide

### Step 1: Environment Configuration (2 minutes)

**Generate NEXTAUTH_SECRET:**

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Update `.env` file:**
```env
DATABASE_URL="your-existing-postgresql-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-generated-secret-here"
```

---

### Step 2: Database Migration (1 minute)

Update your database schema with User and Auth tables:

```bash
pnpm prisma db push
```

**What this does:**
- Creates `User` table
- Creates `Account`, `Session`, `VerificationToken` tables (NextAuth)
- Adds `isActive` field to `Tenant` table

---

### Step 3: Generate Prisma Client (30 seconds)

```bash
pnpm prisma generate
```

---

### Step 4: Seed Demo Data (30 seconds)

Create the demo tenant and demo user:

```bash
pnpm tsx lib/seed-demo-user.ts
```

**Creates:**
- Demo Tenant (subdomain: `demo`)
- Demo User (email: `demo@theboyshostel.com`, password: `demo123456`)

---

### Step 5: Create Admin for "The Boys Hostel" (Optional)

If you want to create an admin user for your existing tenant:

**Option A: Using Prisma Studio (GUI)**
```bash
pnpm prisma studio
```
Then manually create a User record.

**Option B: Using a Script**

Create `create-admin.ts`:
```typescript
import { prisma } from './lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('your-password', 12)
  
  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@theboyshostel.com',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: 'the-boys-hostel-tenant-id', // Your tenant ID
    },
  })
  
  console.log('Admin created:', user.email)
}

createAdmin()
```

Run it:
```bash
pnpm tsx create-admin.ts
```

---

### Step 6: Start Development Server

```bash
pnpm dev
```

---

## 🧪 Test Authentication

### Test 1: Demo Auto-Login ✨

```
URL: http://demo.localhost:3000
Expected: Automatic login → Dashboard loads
```

### Test 2: Protected Routes 🔒

```
URL: http://theboyshostel.localhost:3000
Expected: Redirect to /login (no auth)
```

### Test 3: Registration Flow 📝

```
URL: http://localhost:3000
Action: Fill registration form
Expected: New subdomain created → Redirect to login
```

### Test 4: Manual Login 🔑

```
URL: http://theboyshostel.localhost:3000/login
Credentials: admin@theboyshostel.com / your-password
Expected: Login success → Dashboard
```

---

## 🎯 What You Can Do Now

### For End Users:
✅ Register a new hostel
✅ Log in with email/password
✅ Access tenant-specific dashboard
✅ Try demo without registration

### For Admins:
✅ Create new hostels
✅ Manage users
✅ Disable tenant accounts
✅ View all tenants (Superadmin)

---

## 🔐 Default Credentials

### Demo Account
```
URL: http://demo.localhost:3000
Email: demo@theboyshostel.com
Password: demo123456
Role: ADMIN
```

### The Boys Hostel (After Step 5)
```
URL: http://theboyshostel.localhost:3000
Email: admin@theboyshostel.com
Password: your-password
Role: ADMIN
```

---

## 🏗️ Architecture Summary

### User Roles

| Role | Permissions | Tenant Access |
|------|-------------|---------------|
| **SUPERADMIN** | Platform management | ALL tenants |
| **ADMIN** | Full hostel management | Assigned tenant only |
| **STAFF** | Limited access | Assigned tenant only |

### Authentication Flow

```
User visits subdomain
    ↓
Middleware checks JWT token
    ↓
No token → Redirect to /login
    ↓
User enters credentials
    ↓
Verify: Email + Password + Tenant Match
    ↓
Create JWT session
    ↓
Redirect to dashboard
```

---

## 🐛 Common Issues

### Issue: "NEXTAUTH_SECRET not configured"
**Solution:**
```bash
# Generate and add to .env
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Issue: "Can't reach database server"
**Solution:** Check DATABASE_URL in .env

### Issue: Demo login fails
**Solution:**
```bash
pnpm tsx lib/seed-demo-user.ts
```

### Issue: "Tenant not found"
**Solution:** Run registration flow or check database

### Issue: Redirect loop
**Solution:** Clear browser cookies

---

## 📚 File Structure

```
prisma/
  ├── schema.prisma              # Updated with User model
  └── phase3-auth-migration.sql  # SQL migration script

lib/
  ├── auth.ts                    # NextAuth config
  ├── auth-actions.ts            # Registration logic
  └── seed-demo-user.ts          # Demo seeding

app/
  ├── api/auth/[...nextauth]/    # NextAuth API
  ├── (tenant)/[subdomain]/
  │   ├── login/                 # Login page
  │   └── demo/                  # Demo auto-login
  └── page.tsx                   # Landing + Registration

components/
  └── auth/
      ├── register-hostel-form.tsx  # Registration UI
      └── session-provider.tsx      # NextAuth wrapper

middleware.ts                      # Route protection
```

---

## 🎊 Success Checklist

- [ ] NEXTAUTH_SECRET set in .env
- [ ] Database migrated (prisma db push)
- [ ] Demo user created
- [ ] Admin user created (optional)
- [ ] Dev server running
- [ ] Demo auto-login works
- [ ] Protected routes redirect to login
- [ ] Manual login works
- [ ] Registration flow works

---

## 🚀 Next Steps

### Immediate:
1. Complete the setup above
2. Test all authentication flows
3. Create your first admin user
4. Register a test hostel

### Future Phases:
- [ ] Email verification
- [ ] Password reset
- [ ] User management UI
- [ ] Role-based permissions
- [ ] Activity logging
- [ ] OAuth providers (Google, GitHub)

---

## 📖 Additional Documentation

- Full Guide: `PHASE_3_AUTHENTICATION_COMPLETE.md`
- Schema: `prisma/schema.prisma`
- Migration: `prisma/phase3-auth-migration.sql`

---

**Ready to go!** 🎉

Your multi-tenant SaaS platform now has production-ready authentication!

Start with:
```bash
pnpm dev
```

Then visit: http://demo.localhost:3000

# 🚂 Railway Deployment Guide

Complete guide to deploy your multi-tenant hostel management app on Railway.

---

## 📋 Prerequisites

- ✅ GitHub repository with all Phase 1-3 changes pushed
- ✅ Railway account (https://railway.app)
- ✅ Railway PostgreSQL database already created

---

## 🚀 Deployment Steps

### Step 1: Connect Railway to Your GitHub Repo

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `TheBoysHostel`
5. Railway will detect it's a Next.js app

---

### Step 2: Add Environment Variables

In your Railway project dashboard, go to **Variables** and add:

```env
# Database (use your Railway PostgreSQL database URL)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:PORT/railway

# NextAuth (CRITICAL - Generate a new secret for production)
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=<generate-new-secret-see-below>

# Environment
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET (run locally):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and paste as `NEXTAUTH_SECRET`.

---

### Step 3: Run Database Migration

Railway will build your app, but you need to run the migration manually:

**Option A: Using Railway CLI**

1. Install Railway CLI:
```powershell
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Link to your project:
```bash
railway link
```

4. Run migration:
```bash
railway run pnpm prisma db push --accept-data-loss
```

**Option B: Using Railway Dashboard**

1. Go to your project → Database
2. Click **"Query"**
3. Copy and paste contents of `prisma/complete-migration.sql`
4. Execute the query

---

### Step 4: Seed the Database

**Option A: Railway CLI**
```bash
railway run pnpm tsx prisma/seed-complete.ts
```

**Option B: Manually via SQL**

Create tenants and users using SQL:

```sql
-- Create The Boys Hostel tenant
INSERT INTO "Tenant" (id, name, subdomain, "isActive", "createdAt")
VALUES ('the-boys-hostel-tenant-id', 'The Boys Hostel', 'theboyshostel', true, CURRENT_TIMESTAMP);

-- Create admin user (replace PASSWORD_HASH with bcrypt hash)
INSERT INTO "User" (id, name, email, password, role, "tenantId", "createdAt", "updatedAt")
VALUES (
  'admin-user-id',
  'Admin',
  'admin@theboyshostel.com',
  '<BCRYPT_HASH>',
  'ADMIN',
  'the-boys-hostel-tenant-id',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Create Demo tenant
INSERT INTO "Tenant" (id, name, subdomain, "isActive", "createdAt")
VALUES ('demo-tenant-id', 'Demo Hostel', 'demo', true, CURRENT_TIMESTAMP);

-- Create demo user
INSERT INTO "User" (id, name, email, password, role, "tenantId", "createdAt", "updatedAt")
VALUES (
  'demo-user-id',
  'Demo Admin',
  'demo@theboyshostel.com',
  '<BCRYPT_HASH>',
  'ADMIN',
  'demo-tenant-id',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

**Generate bcrypt hash locally:**
```typescript
// run: pnpm tsx generate-hash.ts
import bcrypt from 'bcryptjs'
const hash = await bcrypt.hash('your-password', 12)
console.log(hash)
```

---

### Step 5: Configure Custom Domain (For Subdomain Routing)

**Important:** Subdomain routing requires a custom domain.

1. In Railway → **Settings** → **Domains**
2. Add your custom domain: `yourdomain.com`
3. Add wildcard subdomain: `*.yourdomain.com`
4. Update DNS records (Railway will show you what to add)

**DNS Records:**
```
Type: CNAME
Name: @
Value: your-app.up.railway.app

Type: CNAME
Name: *
Value: your-app.up.railway.app
```

5. Update `NEXTAUTH_URL` to your custom domain:
```
NEXTAUTH_URL=https://yourdomain.com
```

---

### Step 6: Test Deployment

Once deployed and configured:

**Test 1: Landing Page**
```
URL: https://yourdomain.com
Expected: Registration form visible
```

**Test 2: The Boys Hostel Login**
```
URL: https://theboyshostel.yourdomain.com
Email: admin@theboyshostel.com
Password: your-password
```

**Test 3: Demo Auto-Login**
```
URL: https://demo.yourdomain.com
Expected: Automatic login
```

---

## 🔧 Build Configuration

Railway should auto-detect these settings, but verify:

**Build Command:**
```bash
pnpm prisma generate && pnpm build
```

**Start Command:**
```bash
pnpm start
```

**Install Command:**
```bash
pnpm install
```

---

## 🐛 Troubleshooting

### Issue: Build fails with "Can't reach database"

**Solution:** Add build-time DATABASE_URL as a variable:
- Railway may need DATABASE_URL during build for `prisma generate`
- Ensure DATABASE_URL is set in Variables

---

### Issue: "Tenant not found" errors

**Solution:** 
1. Check database has Tenant records
2. Verify subdomain DNS is configured
3. Check middleware is working (Railway logs)

---

### Issue: Login fails

**Solution:**
1. Check NEXTAUTH_SECRET is set
2. Verify User table has records
3. Check NEXTAUTH_URL matches your domain
4. Look at Railway logs for auth errors

---

### Issue: Subdomain routing doesn't work

**Solution:**
1. Must have custom domain with wildcard DNS
2. Railway.app domains don't support subdomains
3. Update NEXTAUTH_URL to custom domain

---

## 📊 Post-Deployment Checklist

- [ ] Database migration completed
- [ ] Tenants seeded
- [ ] Users created
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] Wildcard DNS configured
- [ ] Landing page loads
- [ ] Login works
- [ ] Demo auto-login works
- [ ] Registration creates tenants
- [ ] Cross-tenant isolation verified

---

## 🔐 Security Recommendations

### Production Security:

1. **Generate new NEXTAUTH_SECRET** (never use dev secret in production)
2. **Use strong passwords** for admin accounts
3. **Enable SSL** (Railway provides this automatically)
4. **Rotate secrets** regularly
5. **Monitor logs** for suspicious activity
6. **Set up alerts** for failed logins
7. **Backup database** regularly (Railway provides automatic backups)

---

## 📝 Important Notes

### Subdomain Limitations:

- Railway's `*.up.railway.app` domains **DO NOT** support subdomains
- You **MUST** use a custom domain for subdomain routing to work
- Example: Buy `yourhotel.com` and point it to Railway

### Database Connection:

- Railway PostgreSQL URL is automatically provided
- Use the internal connection string for faster performance
- Don't hardcode database credentials

### Environment Variables:

- **NEVER** commit `.env` to GitHub
- All secrets must be in Railway Variables
- Railway injects variables at runtime

---

## 🚀 Quick Commands Reference

```bash
# Railway CLI commands
railway login
railway link
railway run pnpm prisma db push
railway run pnpm tsx prisma/seed-complete.ts
railway logs
railway status

# Local testing of production build
pnpm build
pnpm start
```

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- NextAuth.js Docs: https://next-auth.js.org
- Prisma Docs: https://www.prisma.io/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ App builds without errors
2. ✅ Database tables created
3. ✅ Landing page loads at root domain
4. ✅ Login works at tenant subdomains
5. ✅ Demo auto-login functions
6. ✅ Registration creates new tenants
7. ✅ Cross-tenant data isolated
8. ✅ No console errors in browser

---

## 🎉 You're Done!

Once all tests pass, your multi-tenant SaaS platform is live on Railway! 🚀

**Next Steps:**
- Share your app URL
- Onboard your first real tenant
- Monitor performance and logs
- Plan Phase 4 features

---

**Need help?** Check Railway logs with `railway logs` or in the dashboard.

Good luck with your deployment! 🎊

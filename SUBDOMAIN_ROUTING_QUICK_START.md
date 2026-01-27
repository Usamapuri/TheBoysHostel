# 🚀 Subdomain Routing - Quick Start Guide

## ⚡ Test Your New Multi-Tenant Setup

### Step 1: Start Development Server
```bash
pnpm dev
```

### Step 2: Test the URLs

#### Landing Page (Root Domain):
```
http://localhost:3000
```
✅ Should show: Marketing landing page with "HostelOS" branding

#### Tenant Dashboard (Subdomain):
```
http://theboyshostel.localhost:3000
```
✅ Should show: Dashboard with "THE BOYS HOSTEL" in header

#### Demo Route:
```
http://localhost:3000/demo
```
✅ Should redirect to: theboyshostel subdomain

---

## 🎯 How It Works

### URL Structure:
```
[subdomain].[domain]:[port]/[path]
     ↓         ↓        ↓      ↓
  tenant   root domain port  route
```

### Examples:
- `localhost:3000` = Landing page
- `theboyshostel.localhost:3000` = Boys Hostel dashboard  
- `theboyshostel.localhost:3000/students/abc` = Student detail
- `demo.localhost:3000` = Redirects to demo

---

## 🔧 Adding a New Tenant

### Method 1: Via Database
```sql
INSERT INTO "Tenant" (id, name, subdomain, "createdAt")
VALUES (
  'new-tenant-id',
  'New Hostel Name',
  'newhostel',
  NOW()
);
```

Then visit: `http://newhostel.localhost:3000`

### Method 2: Via Prisma Studio
```bash
pnpm db:studio
```
1. Open "Tenant" table
2. Click "Add record"
3. Fill in: name, subdomain
4. Save

---

## 📊 Architecture Overview

### Request Flow:
```
User visits: theboyshostel.localhost:3000
        ↓
Middleware (middleware.ts)
 - Extracts subdomain: "theboyshostel"
 - Rewrites URL to: /theboyshostel
 - Adds header: x-subdomain
        ↓
Next.js Router
 - Matches: app/(tenant)/[subdomain]/page.tsx
 - Passes params: { subdomain: "theboyshostel" }
        ↓
TenantProvider (layout.tsx)
 - Fetches tenant from: /api/tenant/theboyshostel
 - Provides tenant data to children
        ↓
Components
 - Use useTenant() hook
 - Display tenant.name in header
 - All data queries scoped to tenant
```

---

## 🛠️ Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Detects subdomain, rewrites URLs |
| `lib/tenant-context.tsx` | Provides tenant data to components |
| `lib/currentTenant.ts` | Resolves tenant ID for server actions |
| `app/api/tenant/[subdomain]/route.ts` | API to fetch tenant data |
| `app/(tenant)/[subdomain]/layout.tsx` | Wraps routes with TenantProvider |
| `app/(tenant)/[subdomain]/page.tsx` | Tenant dashboard |
| `app/page.tsx` | Landing page (root domain) |

---

## 🔍 Debugging

### Check Subdomain Detection:
```typescript
// In middleware.ts
console.log('Host:', hostname)
console.log('Subdomain:', subdomain)
```

### Check Tenant Loading:
```typescript
// In any component
const { tenant, isLoading, error } = useTenant()
console.log('Tenant:', tenant)
console.log('Loading:', isLoading)
console.log('Error:', error)
```

### Check Server-Side Tenant:
```typescript
// In server action
const tenantId = await getCurrentTenantId()
console.log('Server Tenant ID:', tenantId)
```

---

## ⚠️ Common Issues

### Issue: Subdomain not working
**Solution:** Make sure you're using the full URL with port:
- ✅ `theboyshostel.localhost:3000`
- ❌ `theboyshostel.localhost` (missing port)

### Issue: "Tenant not found" error
**Solution:** Check database has tenant with that subdomain:
```sql
SELECT * FROM "Tenant" WHERE subdomain = 'theboyshostel';
```

### Issue: Landing page on subdomain
**Solution:** Check middleware is running:
- Look for middleware.ts in project root
- Check middleware.ts config matcher

### Issue: Data not loading
**Solution:** Check tenant ID is being passed:
- Open browser dev tools → Network
- Check API call to `/api/tenant/[subdomain]`
- Verify response has tenant data

---

## 🎨 Customization

### Change Tenant Name Display:
```typescript
// components/header.tsx
<h1>{tenant?.name || "Loading..."}</h1>
```

### Add Tenant Logo:
```typescript
// Extend Tenant model in schema.prisma
model Tenant {
  // ... existing fields
  logoUrl String?
}

// Use in header
<img src={tenant?.logoUrl} alt={tenant?.name} />
```

### Custom Tenant Colors:
```typescript
// Add to Tenant model
primaryColor String?
secondaryColor String?

// Use in components
<div style={{ color: tenant?.primaryColor }}>
```

---

## 📈 Performance Tips

### Cache Tenant Data:
```typescript
// Already implemented with React cache
export const getCurrentTenantId = cache(async () => {
  // Cached per request
})
```

### Optimize API Calls:
```typescript
// TenantProvider already caches
// Only fetches once per subdomain
```

---

## 🚀 Next Features to Build

1. **User Authentication**
   - Login per tenant
   - Role-based access
   - User management

2. **Tenant Settings**
   - Branding options
   - Email configuration  
   - Feature flags

3. **Analytics**
   - Per-tenant metrics
   - Usage tracking
   - Billing integration

4. **Custom Domains**
   - `yourcustomdomain.com` instead of subdomain
   - SSL certificate per domain
   - DNS configuration

---

## ✅ Testing Checklist

- [ ] Landing page loads at `localhost:3000`
- [ ] Subdomain loads at `theboyshostel.localhost:3000`
- [ ] Header shows "THE BOYS HOSTEL"
- [ ] Dashboard displays data
- [ ] Students page works
- [ ] Finance page works
- [ ] Maintenance page works
- [ ] Student detail page works
- [ ] Demo route redirects correctly
- [ ] No console errors

---

## 🎉 You're Ready!

Your multi-tenant SaaS platform with subdomain routing is now live!

**Test it now:**
```bash
pnpm dev
```

Then visit:
- http://localhost:3000 (Landing)
- http://theboyshostel.localhost:3000 (Dashboard)

Enjoy! 🚀

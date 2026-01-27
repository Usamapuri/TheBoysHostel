# 🧪 Local Testing Guide

Before pushing to GitHub, let's test all the features locally.

---

## 🚀 Step 1: Start Development Server

Open a new terminal in your project directory and run:

```powershell
cd "c:\Users\usama\Dropbox\My PC (Puris)\Downloads\hostel-management-app"
pnpm dev
```

**Expected Output:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Starting...
✓ Ready in 2-3s
```

---

## ✅ Test Suite

### Test 1: Landing Page 🏠

**URL:** http://localhost:3000

**Expected:**
- ✅ Landing page loads
- ✅ "HostelFlow" branding visible
- ✅ Features displayed (Student Management, Room Allocation, etc.)
- ✅ Registration form visible
- ✅ "Go to The Boys Hostel Dashboard" button
- ✅ "Try Demo Hostel" button

**Action:** Scroll through the page, ensure all sections render properly.

---

### Test 2: Demo Auto-Login ⚡

**URL:** http://demo.localhost:3000

**Expected:**
- ✅ Loading screen appears briefly
- ✅ Automatic login (no credentials needed)
- ✅ Dashboard loads
- ✅ Header shows "DEMO HOSTEL"
- ✅ Navigation menu visible
- ✅ All dashboard sections load

**Actions to Test:**
1. Click "Rooms" in navigation → Should load rooms page
2. Click "Students" → Should load students page
3. Click "Finance" → Should load finance page
4. Check that no data is present (fresh database)

---

### Test 3: The Boys Hostel Login 🔐

**URL:** http://theboyshostel.localhost:3000

**Expected:**
- ✅ Redirect to `/login` (you're not authenticated)
- ✅ Login page loads
- ✅ Header shows "THE BOYS HOSTEL"
- ✅ Login form visible

**Login Credentials:**
```
Email: admin@theboyshostel.com
Password: admin123456
```

**After Login:**
- ✅ Redirect to dashboard
- ✅ Header shows "THE BOYS HOSTEL"
- ✅ All navigation items work
- ✅ Session persists on page reload

**Actions to Test:**
1. Reload page → Should stay logged in
2. Navigate between pages → Session persists
3. Try to access http://demo.localhost:3000 → Should work (different tenant)
4. Logout (if logout button exists) → Should redirect to login

---

### Test 4: Protected Routes 🛡️

**Test A: Unauthenticated Access**

1. Open incognito/private window
2. Visit: http://theboyshostel.localhost:3000
3. **Expected:** Automatic redirect to `/login`

**Test B: Cross-Tenant Protection**

1. Login to The Boys Hostel
2. Try to access: http://anotherhostel.localhost:3000
3. **Expected:** Should be blocked or redirect (tenant doesn't exist)

---

### Test 5: Registration Flow 📝

**URL:** http://localhost:3000

**Steps:**
1. Scroll to registration form
2. Fill in:
   - Hostel Name: "Test Hostel"
   - Subdomain: "testhostel" (should check availability)
   - Your Name: Your name
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Hostel Account"

**Expected:**
- ✅ Subdomain availability check works (✓ or ✗ icon)
- ✅ Reserved subdomains blocked (try "www", "api", "admin")
- ✅ Form validation works
- ✅ Success → Redirect to http://testhostel.localhost:3000/login
- ✅ Login page shows "TEST HOSTEL"
- ✅ Can login with credentials
- ✅ Dashboard loads for new tenant

---

### Test 6: Subdomain Routing 🌐

**Test Different Subdomains:**

| Subdomain | URL | Expected Behavior |
|-----------|-----|-------------------|
| None | http://localhost:3000 | Landing page |
| demo | http://demo.localhost:3000 | Auto-login → Dashboard |
| theboyshostel | http://theboyshostel.localhost:3000 | Login required → Dashboard |
| testhostel | http://testhostel.localhost:3000 | Login required (after registration) |
| nonexistent | http://nonexistent.localhost:3000 | Tenant not found error |

---

### Test 7: Session Management 🔑

**Test Session Persistence:**
1. Login to The Boys Hostel
2. Reload page → Still logged in ✅
3. Close tab, reopen → Still logged in ✅
4. Open new tab → Session shared ✅

**Test Session Isolation:**
1. Login to The Boys Hostel (Tab 1)
2. Open new tab, visit Demo Hostel (Tab 2)
3. **Expected:** Different sessions, both work independently

---

### Test 8: User Roles (Future) 👤

**Current Setup:**
- All users created are ADMIN role
- Superadmin functionality not yet implemented

**Test:**
- Verify user can access all tenant features
- Cross-tenant access blocked (except Superadmins)

---

## 🐛 Common Issues & Fixes

### Issue: "localhost:3000 refused to connect"
**Solution:** Ensure dev server is running (`pnpm dev`)

### Issue: "Tenant not found"
**Solution:** Check subdomain spelling, ensure tenant exists in database

### Issue: "Invalid credentials"
**Solution:** Verify email and password are correct:
- The Boys Hostel: admin@theboyshostel.com / admin123456
- Demo: demo@theboyshostel.com / demo123456

### Issue: "NEXTAUTH_SECRET not configured"
**Solution:** Check .env file has NEXTAUTH_SECRET

### Issue: Redirect loop
**Solution:** Clear browser cookies, restart dev server

### Issue: Demo auto-login fails
**Solution:** Check browser console for errors, verify demo user exists

---

## 📊 Testing Checklist

Before pushing to GitHub, verify:

### Core Functionality
- [ ] Landing page loads correctly
- [ ] Registration form works
- [ ] Subdomain routing works
- [ ] Login/logout works
- [ ] Session persistence works
- [ ] Protected routes redirect to login

### Multi-Tenancy
- [ ] Demo tenant works (auto-login)
- [ ] The Boys Hostel tenant works (manual login)
- [ ] Can create new tenants via registration
- [ ] Each tenant has isolated data
- [ ] Cross-tenant access blocked

### Authentication
- [ ] Email/password login works
- [ ] Invalid credentials rejected
- [ ] Sessions persist across page reloads
- [ ] Sessions isolated per tenant
- [ ] Logout works (if implemented)

### UI/UX
- [ ] Tenant name displayed correctly in header
- [ ] Login pages show correct tenant branding
- [ ] Navigation works across all pages
- [ ] Loading states visible
- [ ] Error messages user-friendly

### Security
- [ ] Can't access dashboard without login
- [ ] Users locked to their tenant (except Superadmin)
- [ ] Passwords hashed (not visible in database)
- [ ] JWT tokens secure

---

## 🎯 Performance Testing

### Load Times (Expected)
- Landing page: < 2s
- Dashboard: < 3s
- Login: < 1s
- Registration: < 2s

### Database Queries
- Check browser DevTools → Network tab
- Verify API calls are successful (200 OK)
- Check for unnecessary re-renders

---

## 📸 Screenshots to Capture (Optional)

Before pushing, capture screenshots of:
1. Landing page
2. Registration form
3. Login page (The Boys Hostel)
4. Dashboard (logged in)
5. Demo auto-login flow
6. Successful registration flow

---

## ✅ Final Verification

Once all tests pass:

```powershell
# 1. Check for TypeScript errors
pnpm type-check

# 2. Check for linting errors
pnpm lint

# 3. Build for production (test)
pnpm build

# 4. If build succeeds, ready to push!
git status
git add .
git commit -m "feat: implement Phase 3 - Multi-tenant authentication and onboarding"
git push
```

---

## 🎉 Success Criteria

All tests must pass before pushing to GitHub:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Production build succeeds
- ✅ All authentication flows work
- ✅ Multi-tenancy properly isolated
- ✅ Registration creates new tenants
- ✅ Demo environment works

---

## 📞 Need Help?

If any test fails:
1. Check browser console for errors
2. Check dev server logs
3. Verify .env configuration
4. Check database connection
5. Review relevant documentation files

---

**Ready to test!** Start your dev server and work through this checklist systematically.

Good luck! 🚀

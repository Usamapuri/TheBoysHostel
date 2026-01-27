# ✅ Multi-Tenant Migration Checklist

Use this checklist to ensure a smooth migration to multi-tenancy.

---

## 🔧 Pre-Migration

- [ ] **Backup your database** (CRITICAL!)
  ```bash
  # Example for PostgreSQL
  pg_dump your_database > backup_$(date +%Y%m%d).sql
  ```

- [ ] **Ensure you're on the correct branch**
  ```bash
  git status
  ```

- [ ] **All dependencies installed**
  ```bash
  pnpm install
  ```

- [ ] **Database is accessible**
  ```bash
  npx prisma db pull
  ```

---

## 🚀 Migration Steps

### Step 1: Schema Migration
- [ ] Run Prisma migration command
  ```bash
  npx prisma migrate dev --name add_multitenant_support
  ```

- [ ] Check for migration errors
- [ ] Verify migration files created in `prisma/migrations/`

**If migration fails:**
- [ ] Check database connection
- [ ] Review error messages
- [ ] Consider two-step approach (see `MULTITENANT_MIGRATION_GUIDE.md`)

---

### Step 2: Data Migration
- [ ] Run the data migration script
  ```bash
  pnpm db:migrate-multitenant
  ```

- [ ] Verify output shows:
  - [ ] ✅ Created tenant: The Boys Hostel
  - [ ] ✅ Updated X locations
  - [ ] ✅ Updated X rooms
  - [ ] ✅ Updated X students
  - [ ] ✅ Updated X transactions
  - [ ] ✅ Updated X expenses
  - [ ] ✅ Updated X activity logs
  - [ ] ✅ Updated X maintenance tasks

**Expected output:**
```
🚀 Starting multi-tenant migration...

Step 1: Creating "The Boys Hostel" tenant...
✅ Created tenant: The Boys Hostel (theboyshostel)

Step 2: Assigning all existing data to the tenant...

✅ Updated X locations
✅ Updated X rooms
✅ Updated X students
...

🎉 Migration completed successfully!
```

---

### Step 3: Generate Prisma Client
- [ ] Regenerate Prisma client
  ```bash
  npx prisma generate
  ```

- [ ] Verify no errors in output

---

### Step 4: Restart Development Server
- [ ] Stop current dev server (Ctrl+C)
- [ ] Start fresh
  ```bash
  pnpm dev
  ```

---

## 🧪 Testing & Verification

### Database Verification
- [ ] Open Prisma Studio
  ```bash
  pnpm db:studio
  ```

- [ ] Check `Tenant` table
  - [ ] One record exists: "The Boys Hostel"
  - [ ] Subdomain is "theboyshostel"
  - [ ] ID matches `lib/currentTenant.ts`

- [ ] Check any data table (e.g., `Student`)
  - [ ] All records have `tenantId` populated
  - [ ] `tenantId` matches "The Boys Hostel" tenant ID

---

### Application Testing

#### Basic Functionality
- [ ] **Dashboard loads without errors**
  - [ ] KPI cards show correct data
  - [ ] Charts render properly
  - [ ] No console errors

- [ ] **Students page works**
  - [ ] List displays existing students
  - [ ] Can add a new student
  - [ ] Can edit a student
  - [ ] Can delete a student

- [ ] **Rooms page works**
  - [ ] Grid shows all rooms
  - [ ] Can add a new room
  - [ ] Can edit a room
  - [ ] Can assign students to beds

- [ ] **Finance page works**
  - [ ] Transactions display
  - [ ] Can generate monthly bills
  - [ ] Can mark transactions as paid
  - [ ] Can add expenses

- [ ] **Maintenance page works**
  - [ ] Kanban board displays
  - [ ] Can add new tasks
  - [ ] Can update task status
  - [ ] Can complete tasks

#### Data Integrity
- [ ] **Student count matches pre-migration**
  - Pre-migration count: ___
  - Post-migration count: ___

- [ ] **Room count matches pre-migration**
  - Pre-migration count: ___
  - Post-migration count: ___

- [ ] **Transaction count matches pre-migration**
  - Pre-migration count: ___
  - Post-migration count: ___

- [ ] **All financial totals are correct**
  - Revenue matches: ___
  - Expenses match: ___

---

## 🔍 Advanced Verification

### Query Testing
- [ ] Open Prisma Studio and run test queries:
  ```typescript
  // Should return only tenant's data
  await prisma.student.findMany({
    where: { tenantId: 'the-boys-hostel-tenant-id' }
  })
  ```

### Tenant ID Verification
- [ ] Check `lib/currentTenant.ts`
  - [ ] `CURRENT_TENANT_ID` = "the-boys-hostel-tenant-id"

- [ ] Verify this matches database:
  ```sql
  SELECT id, name, subdomain FROM "Tenant";
  ```

---

## 📝 Post-Migration

### Documentation
- [ ] Read `README_MULTITENANT.md`
- [ ] Bookmark `MULTITENANT_MIGRATION_GUIDE.md` for future reference
- [ ] Share relevant docs with team members

### Code Review
- [ ] Review changes in `lib/actions.ts`
- [ ] Understand tenant filtering logic
- [ ] Review `prisma/schema.prisma` changes

### Version Control
- [ ] Commit migration files
  ```bash
  git add .
  git commit -m "feat: add multi-tenant support"
  ```

- [ ] Consider creating a backup branch
  ```bash
  git branch backup-before-multitenant
  ```

---

## 🚨 Troubleshooting

### Issue: Migration shows "0 records updated"
**Possible causes:**
- Records already have `tenantId` set
- Migration script already ran
- Database connection issue

**Solution:**
- Check if Tenant exists in database
- Verify records have `tenantId` in Prisma Studio
- If yes, you're good to go!

---

### Issue: "Tenant not found" errors in app
**Possible causes:**
- Tenant ID mismatch
- Migration script didn't run
- Wrong database

**Solution:**
- Check `lib/currentTenant.ts` has correct ID
- Verify Tenant exists in database
- Run migration script again

---

### Issue: TypeScript errors about tenantId
**Possible causes:**
- Prisma client not regenerated
- IDE cache issues

**Solution:**
```bash
npx prisma generate
# Then restart TypeScript server in IDE
```

---

### Issue: Data not showing in app
**Possible causes:**
- `tenantId` not populated
- Wrong tenant ID in code
- Database migration incomplete

**Solution:**
- Run migration script: `pnpm db:migrate-multitenant`
- Check Prisma Studio for `tenantId` values
- Verify tenant ID matches in code and database

---

## 🎉 Success Criteria

You've successfully migrated when:

✅ Migration commands completed without errors  
✅ All data is visible in the application  
✅ New records can be created  
✅ All CRUD operations work  
✅ No console errors related to tenantId  
✅ Prisma Studio shows tenant data correctly  
✅ You understand the multi-tenant architecture  

---

## 📊 Migration Statistics

Fill this out after migration:

**Database:**
- Total tenants created: ___
- Total records migrated: ___

**Tables Updated:**
- Locations: ___
- Rooms: ___
- Students: ___
- Transactions: ___
- Expenses: ___
- Activity Logs: ___
- Maintenance Tasks: ___

**Time Taken:**
- Schema migration: ___ minutes
- Data migration: ___ minutes
- Testing: ___ minutes
- Total: ___ minutes

**Issues Encountered:**
- [ ] None
- [ ] Minor (resolved quickly)
- [ ] Major (needed troubleshooting)

**Notes:**
_________________________________
_________________________________
_________________________________

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

1. **Restore from backup**
   ```bash
   psql your_database < backup_YYYYMMDD.sql
   ```

2. **Revert code changes**
   ```bash
   git checkout HEAD~1 prisma/schema.prisma
   git checkout HEAD~1 lib/actions.ts
   git checkout HEAD~1 lib/currentTenant.ts
   ```

3. **Reset migrations**
   ```bash
   npx prisma migrate reset
   ```

4. **Seek help**
   - Review error messages
   - Check documentation
   - Contact support

---

## 📞 Resources

- `QUICK_START.md` - Fast migration commands
- `MIGRATION_SUMMARY.md` - What changed
- `MULTITENANT_MIGRATION_GUIDE.md` - Detailed guide
- `README_MULTITENANT.md` - Architecture overview

---

**Date Completed:** _______________  
**Completed By:** _______________  
**Sign Off:** _______________ ✅

---

Good luck with your migration! 🚀

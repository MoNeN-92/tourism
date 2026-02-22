# Booking System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add production-safe user accounts + booking lifecycle + admin calendar without regressing existing tours/blog/admin behavior.

**Architecture:** Implement additive modules in backend (`users`, `user-auth`, `bookings`, `notifications`, `email`) with a separate user JWT cookie. Add frontend account/admin booking pages and booking form on tour detail. Keep old routes stable.

**Tech Stack:** NestJS 11, Prisma/PostgreSQL, Next.js 16, next-intl, axios

---

### Task 1: Schema and Migration Foundation

**Files:**
- Modify: `tourism-backend/prisma/schema.prisma`
- Create: `tourism-backend/prisma/migrations/<timestamp>_add_booking_system/migration.sql`

**Step 1: Write failing schema-dependent tests**
- Add booking service spec expecting booking statuses and change requests persisted.

**Step 2: Run test to verify failure**
Run: `cd tourism-backend && npm run test -- --runInBand`
Expected: fail because booking/user models do not exist.

**Step 3: Write minimal implementation**
- Add models/enums: `User`, `Booking`, `BookingChangeRequest`, `Notification`, `EmailLog`.
- Add indexes and relations.
- Create migration.

**Step 4: Verify schema compiles**
Run:
- `cd tourism-backend && npx prisma format`
- `cd tourism-backend && npx prisma generate`

**Step 5: Commit**
`git add tourism-backend/prisma/schema.prisma tourism-backend/prisma/migrations`

### Task 2: User Auth and User Management APIs

**Files:**
- Create: `tourism-backend/src/user-auth/*`
- Create: `tourism-backend/src/users/*`
- Modify: `tourism-backend/src/app.module.ts`

**Step 1: Write failing tests**
- user auth service/controller tests for register/login/me behavior.
- admin users controller tests for list/update behavior.

**Step 2: Run test to verify failure**
Run: `cd tourism-backend && npm run test -- --runInBand`
Expected: fail (modules/routes missing).

**Step 3: Write minimal implementation**
- User register/login/logout/me with `user_token` cookie.
- User JWT strategy + guard.
- Admin users endpoints secured by existing admin guard.

**Step 4: Re-run tests**
Run: `cd tourism-backend && npm run test -- --runInBand`
Expected: pass for added tests.

**Step 5: Commit**
`git add tourism-backend/src/user-auth tourism-backend/src/users tourism-backend/src/app.module.ts`

### Task 3: Booking Domain + Notifications + Email Fallback

**Files:**
- Create: `tourism-backend/src/bookings/*`
- Create: `tourism-backend/src/notifications/*`
- Create: `tourism-backend/src/email/*`
- Modify: `tourism-backend/src/app.module.ts`

**Step 1: Write failing tests**
- booking service tests for create/approve/reject/cancel/change-request transitions.

**Step 2: Run test to verify failure**
Run: `cd tourism-backend && npm run test -- --runInBand`
Expected: fail before implementation.

**Step 3: Write minimal implementation**
- User booking endpoints.
- Admin booking and change-request endpoints.
- Admin calendar endpoint by month.
- Notification creation on lifecycle events.
- Email sender with SMTP-or-log fallback and `EmailLog` persistence.

**Step 4: Re-run tests and build**
Run:
- `cd tourism-backend && npm run test -- --runInBand`
- `cd tourism-backend && npm run build`

**Step 5: Commit**
`git add tourism-backend/src/bookings tourism-backend/src/notifications tourism-backend/src/email tourism-backend/src/app.module.ts`

### Task 4: Frontend User Account + Booking UI

**Files:**
- Modify: `nextjs-frontend/app/[locale]/tours/[slug]/page.tsx`
- Create: `nextjs-frontend/app/[locale]/account/login/page.tsx`
- Create: `nextjs-frontend/app/[locale]/account/register/page.tsx`
- Create: `nextjs-frontend/app/[locale]/account/bookings/page.tsx`
- Create: `nextjs-frontend/app/[locale]/account/notifications/page.tsx`
- Create: `nextjs-frontend/app/[locale]/account/layout.tsx`

**Step 1: Write failing smoke expectations**
- manual smoke criteria for login/register/booking submit/cancel/change request.

**Step 2: Run build to confirm baseline**
Run: `cd nextjs-frontend && npm run build`

**Step 3: Write minimal implementation**
- Add account auth pages.
- Add tour booking form and login redirect when unauthorized.
- Add user bookings + notifications pages.

**Step 4: Re-run build**
Run: `cd nextjs-frontend && npm run build`

**Step 5: Commit**
`git add nextjs-frontend/app/[locale]/tours/[slug]/page.tsx nextjs-frontend/app/[locale]/account`

### Task 5: Frontend Admin Booking Calendar and Users

**Files:**
- Create: `nextjs-frontend/app/[locale]/admin/bookings/page.tsx`
- Create: `nextjs-frontend/app/[locale]/admin/calendar/page.tsx`
- Create: `nextjs-frontend/app/[locale]/admin/users/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/layout.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/page.tsx`

**Step 1: Write failing smoke expectations**
- admin list bookings, approve/reject/edit, calendar month view, users toggle active.

**Step 2: Run build to verify failure points if any**
Run: `cd nextjs-frontend && npm run build`

**Step 3: Write minimal implementation**
- Add admin pages and navigation.
- Add dashboard counters for bookings/users.

**Step 4: Re-run build**
Run: `cd nextjs-frontend && npm run build`

**Step 5: Commit**
`git add nextjs-frontend/app/[locale]/admin`

### Task 6: End-to-End Verification and Local Runbook

**Files:**
- Modify: `tourism-backend/.env.example`
- Modify: `tourism-backend/README.md`
- Modify: `nextjs-frontend/README.md`
- Create: `docs/plans/2026-02-22-booking-system-smoke.md`

**Step 1: Apply migration + seed**
Run:
- `cd tourism-backend && npx prisma migrate deploy`
- `cd tourism-backend && npm run prisma:seed` (with env)

**Step 2: Run full verification**
Run:
- `cd tourism-backend && npm run test -- --runInBand`
- `cd tourism-backend && npm run build`
- `cd nextjs-frontend && npm run build`

**Step 3: Run local smoke flow**
- register user -> login -> create booking -> admin approve -> calendar visible -> user notification and email log entry.

**Step 4: Document commands and credentials**
- update docs and smoke checklist.

**Step 5: Commit**
`git add tourism-backend/.env.example tourism-backend/README.md nextjs-frontend/README.md docs/plans/2026-02-22-booking-system-smoke.md`


# Advanced Booking Orchestrator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver RBAC-aware multi-role auth, advanced booking orchestration, soft-delete lifecycle, and mobile-ready booking UX with automated email workflows.

**Architecture:** Extend current admin auth and booking domain incrementally. Keep `Booking` as aggregate root while adding normalized child tables for tours/hotel rooms. Enforce role policies at controller + middleware layers. Preserve legacy compatibility where required.

**Tech Stack:** NestJS, Prisma ORM, PostgreSQL, Next.js App Router, Tailwind CSS, JWT cookies.

---

### Task 1: Expand Prisma schema for roles, hotel registry, booking orchestration, and retention

**Files:**
- Modify: `tourism-backend/prisma/schema.prisma`
- Create: `tourism-backend/prisma/migrations/20260226000000_advanced_booking_orchestrator/migration.sql`

**Step 1: Write failing type expectation (schema-dependent compile test)**
```bash
cd tourism-backend && npm run test -- src/bookings/bookings.service.spec.ts
```
Expected: FAIL after upcoming test additions referencing new enums/relations.

**Step 2: Add schema changes**
- Add enums: `AdminRole`, `UserRole`, `Currency`, `PaymentAmountMode`, `CarType`.
- Add models: `Hotel`, `BookingTour`, `BookingHotelService`, `BookingHotelRoom`.
- Add Booking fields: `currency`, `amountPaidMode`, `amountPaidPercent`, `isDeleted`, `deletedAt`.

**Step 3: Add SQL migration matching schema**
- Create enums/tables/columns/indexes.
- Backfill admin role mapping `'admin' -> 'ADMIN'`.

**Step 4: Generate prisma client**
```bash
cd tourism-backend && npx prisma generate
```
Expected: PASS, generated client updated.

**Step 5: Commit**
```bash
git add tourism-backend/prisma/schema.prisma tourism-backend/prisma/migrations/20260226000000_advanced_booking_orchestrator/migration.sql tourism-backend/generated
 git commit -m "feat(prisma): add advanced booking orchestration schema"
```

### Task 2: Implement backend RBAC with ADMIN and MODERATOR

**Files:**
- Modify: `tourism-backend/src/auth/auth.service.ts`
- Modify: `tourism-backend/src/auth/auth.controller.ts`
- Modify: `tourism-backend/src/auth/strategies/jwt.strategy.ts`
- Modify: `tourism-backend/src/auth/decorators/roles.decorator.ts`
- Modify: `tourism-backend/src/auth/guards/roles.guard.ts`
- Modify: `tourism-backend/src/bootstrap/admin-bootstrap.service.ts`
- Modify: `tourism-backend/prisma/seed.ts`
- Modify: `tourism-backend/src/app.controller.ts`
- Modify: `tourism-backend/src/users/users.controller.ts`
- Modify: `tourism-backend/src/tours/tours.controller.ts`
- Modify: `tourism-backend/src/blog/blog.controller.ts`

**Step 1: Write failing tests for role-restricted login paths**
- Add controller/service tests for:
  - `/auth/admin/login` rejects moderator.
  - `/auth/staff/login` rejects admin.

**Step 2: Run tests and confirm failures**
```bash
cd tourism-backend && npm test -- auth
```
Expected: FAIL with missing methods/routes.

**Step 3: Add RBAC implementation**
- Add explicit endpoints: `admin/login`, `staff/login`, legacy `login` alias.
- Role-aware auth service methods.
- Update guards/decorators to enum-driven checks.
- Restrict non-booking admin controllers to `ADMIN`.

**Step 4: Re-run auth tests**
```bash
cd tourism-backend && npm test -- auth
```
Expected: PASS.

**Step 5: Commit**
```bash
git add tourism-backend/src/auth tourism-backend/src/users/users.controller.ts tourism-backend/src/tours/tours.controller.ts tourism-backend/src/blog/blog.controller.ts tourism-backend/src/bootstrap/admin-bootstrap.service.ts tourism-backend/prisma/seed.ts tourism-backend/src/app.controller.ts
 git commit -m "feat(auth): add admin/moderator RBAC and split login endpoints"
```

### Task 3: Add hotel registry module and endpoints

**Files:**
- Create: `tourism-backend/src/hotels/hotels.module.ts`
- Create: `tourism-backend/src/hotels/hotels.service.ts`
- Create: `tourism-backend/src/hotels/hotels.controller.ts`
- Create: `tourism-backend/src/hotels/dto/create-hotel.dto.ts`
- Create: `tourism-backend/src/hotels/dto/update-hotel.dto.ts`
- Modify: `tourism-backend/src/app.module.ts`

**Step 1: Write failing tests for hotel CRUD authorization**
- Add unit/controller tests for create/list/update/delete role boundaries.

**Step 2: Verify red**
```bash
cd tourism-backend && npm test -- hotels
```
Expected: FAIL (module not found).

**Step 3: Implement hotels module**
- CRUD with `ADMIN|MODERATOR` for write/read except delete (`ADMIN`).

**Step 4: Verify green**
```bash
cd tourism-backend && npm test -- hotels
```
Expected: PASS.

**Step 5: Commit**
```bash
git add tourism-backend/src/hotels tourism-backend/src/app.module.ts
 git commit -m "feat(hotels): add hotel registry with role-aware admin API"
```

### Task 4: Refactor booking DTOs/service/controller for multi-tour, rooms, currency, soft delete

**Files:**
- Modify: `tourism-backend/src/bookings/dto/admin-create-booking.dto.ts`
- Modify: `tourism-backend/src/bookings/dto/admin-update-booking.dto.ts`
- Modify: `tourism-backend/src/bookings/dto/admin-bookings-query.dto.ts`
- Modify: `tourism-backend/src/bookings/bookings.controller.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.spec.ts`

**Step 1: Write failing tests**
- Multi-tour + carType persistence.
- Hotel service with multi-room persistence.
- Percent payment calculation.
- Soft-delete + trash list + restore + permanent delete permissions.
- Approve transition triggers guest email.

**Step 2: Verify red**
```bash
cd tourism-backend && npm test -- bookings.service
```
Expected: FAIL on missing fields/methods.

**Step 3: Implement booking orchestration and retention logic**
- Extend includes and mappers with new relations.
- Persist new relations transactionally.
- Enforce `isDeleted` filters for active queries.
- Add trash/restore/permanent endpoints + role checks.

**Step 4: Verify green**
```bash
cd tourism-backend && npm test -- bookings.service
```
Expected: PASS.

**Step 5: Commit**
```bash
git add tourism-backend/src/bookings
 git commit -m "feat(bookings): add orchestrator model, payment modes, and trash lifecycle"
```

### Task 5: Extend email automation for Zoho workflows

**Files:**
- Modify: `tourism-backend/src/email/email.service.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.ts`
- Modify: `tourism-backend/.env.example`

**Step 1: Write failing tests for event emails**
- Approval event sends confirmation.
- Hotel request sends inquiry email when enabled.

**Step 2: Verify red**
```bash
cd tourism-backend && npm test -- bookings.service
```
Expected: FAIL on missing method calls.

**Step 3: Implement templates/methods and wire transitions**
- Add professional confirmation and hotel inquiry sender methods.
- Keep fallback logging behavior.

**Step 4: Verify green**
```bash
cd tourism-backend && npm test -- bookings.service
```
Expected: PASS.

**Step 5: Commit**
```bash
git add tourism-backend/src/email tourism-backend/src/bookings/bookings.service.ts tourism-backend/.env.example
 git commit -m "feat(email): wire zoho confirmation and hotel inquiry automation"
```

### Task 6: Add purge mechanism for 30-day trash retention

**Files:**
- Create: `tourism-backend/src/scripts/purge-deleted-bookings.ts`
- Modify: `tourism-backend/package.json`
- Create: `docs/plans/2026-02-26-booking-trash-cron.md`

**Step 1: Write failing test/command check**
- Run purge script in dry mode expecting not found.

**Step 2: Implement purge script and npm command**
- Delete bookings where `isDeleted=true` and `deletedAt < now - 30d`.

**Step 3: Verify script execution**
```bash
cd tourism-backend && npx ts-node src/scripts/purge-deleted-bookings.ts --dry-run
```
Expected: PASS summary output.

**Step 4: Document Vercel/node-cron schedule options**
- Include exact cron examples.

**Step 5: Commit**
```bash
git add tourism-backend/src/scripts/purge-deleted-bookings.ts tourism-backend/package.json docs/plans/2026-02-26-booking-trash-cron.md
 git commit -m "chore(bookings): add 30-day trash purge script and cron guidance"
```

### Task 7: Update Next.js middleware and auth pages for role-aware entry points

**Files:**
- Modify: `nextjs-frontend/middleware.ts`
- Modify: `nextjs-frontend/app/[locale]/admin/login/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/account/login/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/layout.tsx`

**Step 1: Add failing behavior test checklist (manual if no harness)**
- Moderator blocked from `/admin/users`.
- Moderator allowed on `/admin/bookings`.

**Step 2: Implement middleware JWT payload role checks**
- Parse token role and gate routes.

**Step 3: Implement login flows**
- Admin page posts to `/auth/admin/login`.
- Account page adds staff mode posting `/auth/staff/login`, while preserving customer login.

**Step 4: Verify manually**
- Test both entry points and protected routes.

**Step 5: Commit**
```bash
git add nextjs-frontend/middleware.ts nextjs-frontend/app/[locale]/admin/login/page.tsx nextjs-frontend/app/[locale]/account/login/page.tsx nextjs-frontend/app/[locale]/admin/layout.tsx
 git commit -m "feat(frontend-auth): role-aware login entry points and middleware gating"
```

### Task 8: Refactor admin booking UI to orchestrator form and mobile interactions

**Files:**
- Modify: `nextjs-frontend/app/[locale]/admin/bookings/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/bookings/[id]/invoice/InvoicePrint.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/calendar/page.tsx`
- Create: `nextjs-frontend/components/SwipeGallery.tsx`
- Modify: `nextjs-frontend/app/[locale]/tours/[slug]/TourDetailClient.tsx`

**Step 1: Add failing UI behavior checks (manual)**
- Add/remove tours and rooms in modal.
- Percentage payment auto-calculates amount.
- Trash tab restore/permanent actions visible by role.

**Step 2: Implement form/state refactor**
- Side-by-side max-w-6xl layout.
- Customer autofill/override logic.
- Car type options and multi-tour rows.
- Hotel registry + multi-room rows + send request checkbox.

**Step 3: Implement swipe-enabled gallery snippet/component**
- Touch gesture next/prev image behavior on mobile.

**Step 4: Verify responsive behavior**
- Mobile/tablet/desktop checks for hit targets and overflow.

**Step 5: Commit**
```bash
git add nextjs-frontend/app/[locale]/admin/bookings/page.tsx nextjs-frontend/app/[locale]/admin/bookings/[id]/invoice/InvoicePrint.tsx nextjs-frontend/app/[locale]/admin/calendar/page.tsx nextjs-frontend/components/SwipeGallery.tsx nextjs-frontend/app/[locale]/tours/[slug]/TourDetailClient.tsx
 git commit -m "feat(frontend-bookings): add orchestrator form, trash UX, and touch gallery"
```

### Task 9: Final verification and regression checks

**Files:**
- Modify if needed: touched files only.

**Step 1: Backend tests**
```bash
cd tourism-backend && npm test
```
Expected: PASS.

**Step 2: Frontend lint/build**
```bash
cd nextjs-frontend && npm run lint && npm run build
```
Expected: PASS.

**Step 3: Manual smoke checklist**
- Admin and staff login routes.
- Booking create/edit/delete/restore/permanent delete.
- Email logs for approval/hotel inquiry events.
- Role-restricted pages and actions.

**Step 4: Summarize outputs in completion note**
- Include constraints, known gaps, and env prerequisites.

**Step 5: Commit final fixes**
```bash
git add -A
 git commit -m "chore: finalize advanced booking orchestrator rollout"
```


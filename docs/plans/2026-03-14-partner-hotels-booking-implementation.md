# Partner Hotels And Booking Extension Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add partner hotels catalog/admin management, homepage/public hotel pages, user `partnerType`, and booking driver/guide assignment without breaking the existing booking hotel registry.

**Architecture:** Keep booking `Hotel` as the internal booking registry and introduce a separate `PartnerHotel` domain for public content and SEO. Extend `User` and `BookingTour` with nullable fields so new partner assignment capabilities integrate cleanly into the current RBAC and booking orchestrator architecture.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Next.js App Router, next-intl, Tailwind CSS, Cloudinary

---

### Task 1: Schema And Migration

**Files:**
- Modify: `tourism-backend/prisma/schema.prisma`
- Create: `tourism-backend/prisma/migrations/20260314000000_partner_hotels_and_booking_partners/migration.sql`

**Step 1: Write the failing test**

Add/extend a Prisma-facing service test that expects `partnerType`, `driverId`, `guideId`, and partner hotel records to exist in generated types or service mocks.

**Step 2: Run test to verify it fails**

Run: `cd tourism-backend && npm test -- users/users.service.spec.ts`

Expected: FAIL once code references new schema fields that do not exist yet.

**Step 3: Write minimal implementation**

- Add `PartnerType` enum
- Add `PartnerHotel` and `PartnerHotelImage`
- Add `partnerType` on `User`
- Add `driverId` and `guideId` on `BookingTour`
- Add relation fields/indexes
- Create SQL migration

**Step 4: Run test to verify it passes**

Run: `cd tourism-backend && npm test -- users/users.service.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add tourism-backend/prisma/schema.prisma tourism-backend/prisma/migrations/20260314000000_partner_hotels_and_booking_partners/migration.sql
git commit -m "feat(db): add partner hotel and booking partner schema"
```

### Task 2: Partner Hotels Backend Module

**Files:**
- Create: `tourism-backend/src/partner-hotels/partner-hotels.module.ts`
- Create: `tourism-backend/src/partner-hotels/partner-hotels.controller.ts`
- Create: `tourism-backend/src/partner-hotels/partner-hotels.service.ts`
- Create: `tourism-backend/src/partner-hotels/dto/create-partner-hotel.dto.ts`
- Create: `tourism-backend/src/partner-hotels/dto/update-partner-hotel.dto.ts`
- Create: `tourism-backend/src/partner-hotels/partner-hotels.service.spec.ts`
- Modify: `tourism-backend/src/app.module.ts`

**Step 1: Write the failing test**

Add service tests for:
- creating a partner hotel with normalized website/phone data
- listing only visible hotels publicly
- attaching gallery images

**Step 2: Run test to verify it fails**

Run: `cd tourism-backend && npm test -- partner-hotels/partner-hotels.service.spec.ts`

Expected: FAIL because module/service files do not exist.

**Step 3: Write minimal implementation**

- Build admin CRUD service/controller
- Build public list/detail read methods
- Add cover/gallery attach methods using existing upload result metadata

**Step 4: Run test to verify it passes**

Run: `cd tourism-backend && npm test -- partner-hotels/partner-hotels.service.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add tourism-backend/src/partner-hotels tourism-backend/src/app.module.ts
git commit -m "feat(api): add partner hotels module"
```

### Task 3: Users Partner Type And Booking Partner Assignment

**Files:**
- Modify: `tourism-backend/src/users/dto/create-user.dto.ts`
- Modify: `tourism-backend/src/users/dto/update-user.dto.ts`
- Modify: `tourism-backend/src/users/users.service.ts`
- Modify: `tourism-backend/src/users/users.service.spec.ts`
- Modify: `tourism-backend/src/bookings/dto/admin-create-booking.dto.ts`
- Modify: `tourism-backend/src/bookings/dto/admin-update-booking.dto.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.spec.ts`

**Step 1: Write the failing test**

Add tests for:
- creating/updating users with `partnerType`
- persisting optional `driverId` and `guideId` in admin booking create/update

**Step 2: Run test to verify it fails**

Run: `cd tourism-backend && npm test -- users/users.service.spec.ts bookings/bookings.service.spec.ts`

Expected: FAIL for missing partner fields.

**Step 3: Write minimal implementation**

- propagate `partnerType` through users DTO/service responses
- add booking tour DTO fields
- validate optional assigned users and persist IDs on `BookingTour`
- include assigned driver/guide in admin booking responses

**Step 4: Run test to verify it passes**

Run: `cd tourism-backend && npm test -- users/users.service.spec.ts bookings/bookings.service.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add tourism-backend/src/users tourism-backend/src/bookings
git commit -m "feat(bookings): add partner type and driver guide assignment"
```

### Task 4: Admin Partner Hotels UI

**Files:**
- Modify: `nextjs-frontend/app/[locale]/admin/layout.tsx`
- Modify: `nextjs-frontend/middleware.ts`
- Create: `nextjs-frontend/app/[locale]/admin/partner-hotels/page.tsx`
- Create: `nextjs-frontend/app/[locale]/admin/partner-hotels/create/page.tsx`
- Create: `nextjs-frontend/app/[locale]/admin/partner-hotels/[id]/edit/page.tsx`
- Modify: `nextjs-frontend/messages/en.json`
- Modify: `nextjs-frontend/messages/ka.json`
- Modify: `nextjs-frontend/messages/ru.json`

**Step 1: Write the failing test**

At minimum, add a grep/build-level failure check for missing route files and translation keys.

**Step 2: Run test to verify it fails**

Run: `cd nextjs-frontend && rg -n "partner-hotels" app messages`

Expected: no matching admin route or incomplete message keys before implementation.

**Step 3: Write minimal implementation**

- add menu item
- add responsive list/create/edit admin pages
- reuse `/admin/uploads` for cover/gallery uploads
- connect to new backend endpoints

**Step 4: Run test to verify it passes**

Run: `cd nextjs-frontend && npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add nextjs-frontend/app/[locale]/admin nextjs-frontend/messages nextjs-frontend/middleware.ts
git commit -m "feat(admin): add partner hotels management ui"
```

### Task 5: Public Partner Hotel Pages And Homepage Swap

**Files:**
- Modify: `nextjs-frontend/app/[locale]/page.tsx`
- Create: `nextjs-frontend/app/[locale]/partner-hotels/[slug]/page.tsx`
- Create: `nextjs-frontend/app/[locale]/partner-hotels/[slug]/PartnerHotelDetailClient.tsx`
- Modify: `nextjs-frontend/lib/seo.ts` if needed

**Step 1: Write the failing test**

Add route/build checks expecting:
- homepage partner hotels section
- public partner hotel detail route

**Step 2: Run test to verify it fails**

Run: `cd nextjs-frontend && rg -n "Our Partner Hotels|partner-hotels/\\[slug\\]" app`

Expected: FAIL or no matches before implementation.

**Step 3: Write minimal implementation**

- remove `Popular Destinations`
- render `Our Partner Hotels` cards from public API
- add SEO detail page with localized metadata and Cloudinary images

**Step 4: Run test to verify it passes**

Run: `cd nextjs-frontend && npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add nextjs-frontend/app/[locale]/page.tsx nextjs-frontend/app/[locale]/partner-hotels
git commit -m "feat(frontend): add public partner hotel pages"
```

### Task 6: Booking Form Driver And Guide Selectors

**Files:**
- Modify: `nextjs-frontend/app/[locale]/admin/bookings/page.tsx`

**Step 1: Write the failing test**

Use a grep/build check to assert the new `Driver` and `Guide` selectors are absent before implementation.

**Step 2: Run test to verify it fails**

Run: `cd nextjs-frontend && rg -n "Driver|Guide|driverId|guideId" 'app/[locale]/admin/bookings/page.tsx'`

Expected: missing partner selector UI before implementation.

**Step 3: Write minimal implementation**

- load driver/guide candidate lists from users data
- add optional selectors per tour row
- include values in booking payloads and edit-state hydration

**Step 4: Run test to verify it passes**

Run: `cd nextjs-frontend && npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add nextjs-frontend/app/[locale]/admin/bookings/page.tsx
git commit -m "feat(admin): add driver and guide selectors to bookings"
```

### Task 7: Final Verification

**Files:**
- Verify only

**Step 1: Run backend tests**

Run: `cd tourism-backend && npm test -- users/users.service.spec.ts partner-hotels/partner-hotels.service.spec.ts bookings/bookings.service.spec.ts`

Expected: PASS

**Step 2: Run backend build**

Run: `cd tourism-backend && npm run build`

Expected: PASS

**Step 3: Run frontend build**

Run: `cd nextjs-frontend && npm run build`

Expected: PASS

**Step 4: Review git diff**

Run: `git status --short && git diff --stat`

Expected: only intended files changed.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add partner hotels catalog and booking partner assignment"
```

# SEO + Admin Booking Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Cloudinary/SEO fixes and a full admin booking system upgrade (guest checkout, financial tracking, unified tour+hotel form, CRUD, service completion status, invoice, and monthly revenue summary) across frontend and backend.

**Architecture:** Extend the existing `Booking` model in Prisma with nullable service and guest fields plus operational status/financial fields; expose these through NestJS DTOs/services/controllers with computed balance and new invoice/revenue endpoints; refactor Next.js blog/tours routes for server-side metadata with canonical/hreflang helpers; centralize Cloudinary URL generation and reuse across UI components.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NestJS, Prisma, PostgreSQL, Jest.

---

### Task 1: Add Failing Backend Tests for New Booking Rules

**Files:**
- Modify: `tourism-backend/src/bookings/bookings.service.spec.ts`
- Test: `tourism-backend/src/bookings/bookings.service.spec.ts`

**Step 1: Write the failing tests**

Add tests for:
- admin can create booking without `userId` when `guestName/guestPhone` are present
- create fails when both tour and hotel blocks are missing
- create fails when both user and guest identity are missing
- response includes computed `balanceDue = totalPrice - amountPaid`

Example test shape:

```ts
it('creates guest booking and computes balance due', async () => {
  // arrange mocks for tour/hotel lookup
  // act service.createAdmin(...)
  // assert booking contains totalPrice, amountPaid, balanceDue
});
```

**Step 2: Run test to verify it fails**

Run: `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: FAIL with missing validation/fields or missing balance mapping.

**Step 3: Write minimal implementation**

No implementation in this task.

**Step 4: Run test to verify it still fails for the expected reason**

Run: `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: FAIL remains tied to new behavior not yet implemented.

**Step 5: Commit**

```bash
git add tourism-backend/src/bookings/bookings.service.spec.ts
git commit -m "test(bookings): add failing coverage for guest and financial rules"
```

### Task 2: Extend Prisma Booking Schema + Migration

**Files:**
- Modify: `tourism-backend/prisma/schema.prisma`
- Create: `tourism-backend/prisma/migrations/<timestamp>_extend_booking_admin_v2/migration.sql`

**Step 1: Write the failing test**

Use compile/type failure from Task 1 plus Prisma usage in service expecting new fields.

**Step 2: Run test to verify it fails**

Run: `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: FAIL (schema/client mismatch before migration/client regen).

**Step 3: Write minimal implementation**

In `Booking` model:
- make `userId` nullable
- make tour-only fields nullable where needed (`tourId`, `desiredDate`, `adults`, `children`, `roomType`)
- add guest fields: `guestName`, `guestEmail`, `guestPhone`
- add hotel fields: `hotelName`, `hotelCheckIn`, `hotelCheckOut`, `hotelRoomType`, `hotelGuests`, `hotelNotes`
- add financial fields: `totalPrice`, `amountPaid`
- add operational status field: `serviceStatus`

Add enum:

```prisma
enum BookingServiceStatus {
  PENDING
  COMPLETED
}
```

Generate migration SQL and regenerate Prisma client.

**Step 4: Run test to verify status**

Run:
- `cd tourism-backend && npx prisma generate`
- `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: tests still fail but now on service logic, not missing schema fields.

**Step 5: Commit**

```bash
git add tourism-backend/prisma/schema.prisma tourism-backend/prisma/migrations
git commit -m "feat(prisma): extend booking schema for guest hotel and finance fields"
```

### Task 3: Update Booking DTOs and Core Admin Create/Update Logic

**Files:**
- Modify: `tourism-backend/src/bookings/dto/admin-create-booking.dto.ts`
- Modify: `tourism-backend/src/bookings/dto/admin-update-booking.dto.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.ts`

**Step 1: Write the failing test**

Add tests for:
- createAdmin supports guest-only booking
- updateAdmin can modify `totalPrice`, `amountPaid`, `serviceStatus`, hotel fields
- `balanceDue` mapped in returned payload

**Step 2: Run test to verify it fails**

Run: `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: FAIL for unimplemented validation/mapping.

**Step 3: Write minimal implementation**

DTO changes:
- make `userId` optional
- add optional guest/hotel/financial/service-status fields
- relax tour-only required fields

Service changes:
- implement validation helpers:
  - `hasTourService(dto)` / `hasHotelService(dto)`
  - `hasUserIdentity(dto)` / `hasGuestIdentity(dto)`
- enforce at least one service + one identity
- on read/write response, append `balanceDue`
- avoid user notifications/emails when `userId` is null (guest flow)

**Step 4: Run test to verify it passes**

Run: `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: PASS for new guest/financial behaviors.

**Step 5: Commit**

```bash
git add tourism-backend/src/bookings/dto/admin-create-booking.dto.ts tourism-backend/src/bookings/dto/admin-update-booking.dto.ts tourism-backend/src/bookings/bookings.service.ts tourism-backend/src/bookings/bookings.service.spec.ts
git commit -m "feat(bookings): support guest unified service and financial editing"
```

### Task 4: Add Delete, Invoice, and Revenue Summary Endpoints

**Files:**
- Modify: `tourism-backend/src/bookings/bookings.controller.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.ts`
- Create: `tourism-backend/src/bookings/dto/admin-revenue-query.dto.ts`
- Modify: `tourism-backend/src/bookings/bookings.service.spec.ts`

**Step 1: Write the failing tests**

Add tests for:
- `deleteAdmin` removes booking and throws on missing booking
- `getInvoice` response includes customer/service/financial/logo payload
- `getRevenueSummary` returns grouped monthly totals with expected sums

**Step 2: Run test to verify it fails**

Run: `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: FAIL for missing methods/logic.

**Step 3: Write minimal implementation**

Add service methods:
- `deleteAdmin(id)`
- `getInvoice(id)`
- `getRevenueSummary(query)`

Add controller routes:
- `DELETE /admin/bookings/:id`
- `GET /admin/bookings/:id/invoice`
- `GET /admin/bookings/revenue/summary`

Invoice payload must include logo URL and computed `balanceDue`.

**Step 4: Run test to verify it passes**

Run: `cd tourism-backend && npm test -- bookings.service.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tourism-backend/src/bookings/bookings.controller.ts tourism-backend/src/bookings/bookings.service.ts tourism-backend/src/bookings/dto/admin-revenue-query.dto.ts tourism-backend/src/bookings/bookings.service.spec.ts
git commit -m "feat(bookings): add delete invoice and revenue summary endpoints"
```

### Task 5: Verify Backend Integration End-to-End

**Files:**
- Modify (if needed): `tourism-backend/src/bookings/bookings.module.ts`

**Step 1: Write failing verification expectation**

Use full suite and build as gate.

**Step 2: Run verification expecting failures only if wiring incomplete**

Run:
- `cd tourism-backend && npm test`
- `cd tourism-backend && npm run build`

Expected: initially fail if route wiring/types are incomplete.

**Step 3: Write minimal fixes**

Patch module/controller imports or types until both commands are clean.

**Step 4: Run verification to green**

Run:
- `cd tourism-backend && npm test`
- `cd tourism-backend && npm run build`
Expected: all pass.

**Step 5: Commit**

```bash
git add tourism-backend/src/bookings tourism-backend/src/app.module.ts tourism-backend/src/bookings/bookings.module.ts
git commit -m "chore(bookings): finalize backend wiring and verification"
```

### Task 6: Add Cloudinary Helper and Replace Inline URL Transforms

**Files:**
- Create: `nextjs-frontend/lib/cloudinary.ts`
- Modify: `nextjs-frontend/components/ProgressiveImage.tsx`
- Modify: `nextjs-frontend/app/[locale]/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/about/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/blog/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/blog/[slug]/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/tours/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/tours/[slug]/page.tsx`

**Step 1: Write a failing helper usage check**

Add temporary lint guard by removing old hardcoded transform constants and switching imports before helper exists.

**Step 2: Run lint to verify failure**

Run: `cd nextjs-frontend && npm run lint`
Expected: FAIL because helper is missing.

**Step 3: Write minimal implementation**

Implement helper API:

```ts
export function buildCloudinaryUrl(input: string): string;
export function buildCloudinarySources(input: string): { src: string; lowResSrc: string };
```

Ensure default transforms include `f_auto,q_auto`; low-res includes `w_20,q_10,f_auto,e_blur:200`.

Refactor page/component usage to helper outputs.

**Step 4: Run lint to verify it passes**

Run: `cd nextjs-frontend && npm run lint`
Expected: PASS.

**Step 5: Commit**

```bash
git add nextjs-frontend/lib/cloudinary.ts nextjs-frontend/components/ProgressiveImage.tsx nextjs-frontend/app/[locale]/page.tsx nextjs-frontend/app/[locale]/about/page.tsx nextjs-frontend/app/[locale]/blog/page.tsx nextjs-frontend/app/[locale]/blog/[slug]/page.tsx nextjs-frontend/app/[locale]/tours/page.tsx nextjs-frontend/app/[locale]/tours/[slug]/page.tsx
git commit -m "feat(frontend): centralize Cloudinary optimization and blur placeholders"
```

### Task 7: Add Canonical/Hreflang Helper and Dynamic Metadata for Blog/Tours

**Files:**
- Create: `nextjs-frontend/lib/seo.ts`
- Modify: `nextjs-frontend/app/[locale]/blog/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/blog/[slug]/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/tours/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/tours/[slug]/page.tsx`
- Create (if required):
  - `nextjs-frontend/app/[locale]/blog/BlogPageClient.tsx`
  - `nextjs-frontend/app/[locale]/tours/ToursPageClient.tsx`
  - `nextjs-frontend/app/[locale]/tours/[slug]/TourDetailClient.tsx`

**Step 1: Write failing metadata contract**

Add server `generateMetadata` imports/usages before helper exists to intentionally fail compile/lint.

**Step 2: Run lint/build to verify failure**

Run:
- `cd nextjs-frontend && npm run lint`
- `cd nextjs-frontend && npm run build`
Expected: FAIL until helper/page split is complete.

**Step 3: Write minimal implementation**

In `lib/seo.ts` add:
- localized canonical builder
- `alternates.languages` builder for `ka`, `en`, `ru`
- locale-to-OG-locale mapping

Update blog/tours routes to emit unique localized metadata and self canonical + hreflang.

**Step 4: Run lint/build to verify pass**

Run:
- `cd nextjs-frontend && npm run lint`
- `cd nextjs-frontend && npm run build`
Expected: PASS.

**Step 5: Commit**

```bash
git add nextjs-frontend/lib/seo.ts nextjs-frontend/app/[locale]/blog/page.tsx nextjs-frontend/app/[locale]/blog/[slug]/page.tsx nextjs-frontend/app/[locale]/tours/page.tsx nextjs-frontend/app/[locale]/tours/[slug]/page.tsx nextjs-frontend/app/[locale]/blog/BlogPageClient.tsx nextjs-frontend/app/[locale]/tours/ToursPageClient.tsx nextjs-frontend/app/[locale]/tours/[slug]/TourDetailClient.tsx
git commit -m "feat(seo): add localized metadata canonical and hreflang for blog and tours"
```

### Task 8: Upgrade Admin Booking UI (Guest + Unified Services + Finance + Status + Delete)

**Files:**
- Modify: `nextjs-frontend/app/[locale]/admin/bookings/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/calendar/page.tsx`
- Create (optional split):
  - `nextjs-frontend/components/admin/bookings/BookingForm.tsx`
  - `nextjs-frontend/components/admin/bookings/BookingCard.tsx`
  - `nextjs-frontend/components/admin/bookings/BookingInvoiceButton.tsx`

**Step 1: Write failing UI-data integration check**

Change frontend booking types to include new backend fields before rendering logic is updated.

**Step 2: Run lint to verify failure**

Run: `cd nextjs-frontend && npm run lint`
Expected: FAIL due missing props/type handling.

**Step 3: Write minimal implementation**

Implement UI behaviors:
- manual guest fields in create/edit modal
- optional tour/hotel sections
- editable `totalPrice`, `amountPaid`, read-only computed balance
- lifecycle status handling + `serviceStatus` toggle
- delete action with confirm
- render fallback customer/tour labels for nullable relations

**Step 4: Run lint/build to verify pass**

Run:
- `cd nextjs-frontend && npm run lint`
- `cd nextjs-frontend && npm run build`
Expected: PASS.

**Step 5: Commit**

```bash
git add nextjs-frontend/app/[locale]/admin/bookings/page.tsx nextjs-frontend/app/[locale]/admin/page.tsx nextjs-frontend/app/[locale]/admin/calendar/page.tsx nextjs-frontend/components/admin/bookings
git commit -m "feat(admin): upgrade bookings UI for guest hotel finance and full crud"
```

### Task 9: Add Printable Invoice Route

**Files:**
- Create: `nextjs-frontend/app/[locale]/admin/bookings/[id]/invoice/page.tsx`
- Create: `nextjs-frontend/app/[locale]/admin/bookings/[id]/invoice/InvoicePrint.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/bookings/page.tsx`

**Step 1: Write failing route reference**

Link to invoice route from booking list before route exists.

**Step 2: Run build to verify failure**

Run: `cd nextjs-frontend && npm run build`
Expected: FAIL if route/component missing.

**Step 3: Write minimal implementation**

- fetch invoice payload from `GET /admin/bookings/:id/invoice`
- render printable invoice layout (logo, customer, services, totals, paid, balance)
- add print trigger button (`window.print()`)

**Step 4: Run lint/build to verify pass**

Run:
- `cd nextjs-frontend && npm run lint`
- `cd nextjs-frontend && npm run build`
Expected: PASS.

**Step 5: Commit**

```bash
git add nextjs-frontend/app/[locale]/admin/bookings/[id]/invoice/page.tsx nextjs-frontend/app/[locale]/admin/bookings/[id]/invoice/InvoicePrint.tsx nextjs-frontend/app/[locale]/admin/bookings/page.tsx
git commit -m "feat(admin): add printable booking invoice route"
```

### Task 10: Final Verification and Completion Gate

**Files:**
- Modify (if needed): touched files from previous tasks

**Step 1: Re-run requirement checklist against design doc**

Checklist source:
- `docs/plans/2026-02-23-seo-booking-admin-design.md`

**Step 2: Run full verification suite**

Run:
- `cd tourism-backend && npm test`
- `cd tourism-backend && npm run build`
- `cd nextjs-frontend && npm run lint`
- `cd nextjs-frontend && npm run build`

Expected: all commands exit 0.

**Step 3: Fix any remaining regressions**

Apply minimal patches only for failing commands.

**Step 4: Re-run full verification to green**

Run the same four commands; require clean pass.

**Step 5: Commit**

```bash
git add tourism-backend nextjs-frontend
git commit -m "chore: finalize seo and admin booking upgrade"
```

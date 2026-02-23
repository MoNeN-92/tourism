# SEO + Admin Booking System Design

**Date:** 2026-02-23
**Project:** `nextjs-frontend` + `tourism-backend` for `vibegeorgia.com`

## 1. Goals

1. Complete global SEO and image optimization improvements for localized routes.
2. Upgrade admin booking management to support guest/manual entries, financial tracking, unified tour/hotel handling, full CRUD, status control, invoice generation, and analytics-ready reporting.
3. Keep existing booking lifecycle statuses (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`) and add operational completion tracking separately.

## 2. Current State Summary

- Frontend already has mixed metadata coverage with inconsistent canonical/hreflang across routes.
- Cloudinary transforms are hardcoded inline in multiple pages/components.
- `tours` and `blog` list/detail pages are partly client-rendered, limiting metadata quality for dynamic content.
- Backend booking model currently requires `userId` and `tourId`, has no hotel fields, no direct financial fields, no delete endpoint, and no invoice/revenue summary endpoint.

## 3. Design Decisions

### 3.1 Booking Status Model

- Preserve lifecycle status: `Booking.status` remains unchanged.
- Introduce operational completion status:
  - `Booking.serviceStatus`: `PENDING | COMPLETED`
  - Used by admin for service fulfillment and business reporting.

### 3.2 Booking Data Model Extension (Single Unified Booking Record)

Use a single `Booking` entity (no secondary service-item table in this phase) and extend with optional fields:

- Guest/manual identity (for checkout without account):
  - `userId` becomes nullable
  - `guestName`, `guestEmail`, `guestPhone` nullable
- Tour fields become optional for hotel-only bookings:
  - `tourId`, `desiredDate`, `adults`, `children`, `roomType` nullable where appropriate
- Hotel fields added (all optional):
  - `hotelName`, `hotelCheckIn`, `hotelCheckOut`, `hotelRoomType`, `hotelGuests`, `hotelNotes`
- Financial fields:
  - `totalPrice` (decimal/float)
  - `amountPaid` (decimal/float)
  - `balanceDue` computed at read/update response time as `totalPrice - amountPaid` (not persisted)

Validation rules:

- At least one service block is required: tour or hotel.
- At least one identity source is required: existing user or guest fields.

### 3.3 Admin Booking Workflows

- Create booking:
  - Existing user booking or guest/manual booking.
  - Tour-only, hotel-only, or combined.
- Edit booking:
  - All service, guest, and financial fields editable.
  - Payment updates over time supported by editing `amountPaid` and/or `totalPrice`.
- Delete booking:
  - Hard delete via admin endpoint in this phase.
- Status controls:
  - Existing lifecycle transitions remain.
  - New toggle for `serviceStatus` (`PENDING`/`COMPLETED`).

### 3.4 Invoice Generation

- Add a dedicated printable invoice UI route/component in admin frontend.
- Source data from booking API response plus computed `balanceDue`.
- Include required logo:
  - `https://res.cloudinary.com/dj7qaif1i/image/upload/v1771052061/vibe-logo_kztwbw.png`
- Include: customer info, service details, total cost, amount paid, remaining balance.
- Print-first approach (`window.print`) with clean A4-friendly layout and deterministic data sectioning.

### 3.5 Analytics-Ready API

- Add revenue summary endpoint grouped by month (and optional date range filters).
- Use `totalPrice` and `amountPaid` aggregates for financial dashboards.
- Keep response shape ready for admin KPI cards and monthly charts.

## 4. SEO and Image Optimization Design

### 4.1 Cloudinary Utility

Create `nextjs-frontend/lib/cloudinary.ts` with:

- `buildCloudinaryUrl(input, options?)`
  - Accept full Cloudinary URL or public ID.
  - Ensure `f_auto,q_auto` are included.
- `buildCloudinarySources(input)`
  - Returns:
    - `src` optimized default
    - `lowResSrc` with `w_20,q_10,f_auto,e_blur:200`

Refactor existing inline Cloudinary URL usage to consume this helper.

### 4.2 Metadata Strategy for Tours and Blog

- Ensure dynamic localized metadata for:
  - `/[locale]/tours`
  - `/[locale]/tours/[slug]`
  - `/[locale]/blog`
  - `/[locale]/blog/[slug]`
- Metadata includes unique localized:
  - `title`, `description`, `openGraph`
- Where pages are currently client-only and block metadata quality, split into:
  - server page for data + metadata
  - client component for interactions

### 4.3 Canonical + Hreflang Consistency

- Every route emits self-referencing canonical URL.
- Every localized route emits sibling hreflang alternates for `ka`, `en`, `ru`.
- Centralize URL generation in `nextjs-frontend/lib/seo.ts` to avoid drift.

## 5. API and Frontend Integration Shape

### 5.1 Backend

- Prisma schema + migration for booking extensions.
- DTO updates (`admin create/update/query`) for optional service blocks and financial fields.
- Service updates for validation, computed `balanceDue`, CRUD, status toggle, invoice payload, and monthly revenue summary.
- Controller updates:
  - `DELETE /admin/bookings/:id`
  - `GET /admin/bookings/:id/invoice`
  - `GET /admin/bookings/revenue/summary`

### 5.2 Frontend

- Admin booking page/modal expanded for:
  - manual guest entry
  - optional tour and hotel sections
  - editable financial section with live balance
  - lifecycle + service status controls
  - edit/delete actions
- Add invoice print view.
- Replace Cloudinary hardcoded transforms with helper calls.
- Add metadata/canonical/hreflang helpers in relevant pages.

## 6. Error Handling and Guardrails

- Reject invalid booking payloads with clear 400 messages:
  - missing both tour and hotel
  - missing both user and guest identity
  - invalid hotel date ranges
  - negative financial fields
- Keep locale fallback behavior for missing localized text fields.
- Keep existing authentication/authorization guards for admin routes.

## 7. Testing Strategy

### Backend

- Extend service tests for:
  - guest booking creation
  - validation failures for missing service blocks
  - financial updates and computed balance
  - service status updates
  - delete behavior
  - monthly revenue summary aggregates

### Frontend

- Unit tests for `cloudinary.ts` and `seo.ts` helpers.
- Component/page behavior checks for admin booking flows and invoice render.

## 8. Rollout and Compatibility

- Migration uses nullable defaults to avoid breaking existing records.
- Existing booking records remain valid and visible.
- API responses include both legacy and new fields during transition.

## 9. Acceptance Criteria

1. Cloudinary helper is used for Cloudinary image rendering and low-res placeholders.
2. Tours and blog routes emit localized unique metadata, canonical, and hreflang.
3. Admin can create/edit/delete bookings for guest or registered users.
4. Tour-only, hotel-only, and combined bookings are supported.
5. Financial fields are editable; balance is computed and shown correctly.
6. Invoice is printable and includes logo + required business data.
7. Revenue summary endpoint supports monthly analytics use cases.

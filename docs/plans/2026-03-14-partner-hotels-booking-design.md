# Partner Hotels And Booking Extension Design

**Date:** 2026-03-14

**Goal:** Add a public-facing partner hotels catalog with SEO detail pages, extend users with `partnerType`, and extend admin booking tours with optional driver/guide assignment, without breaking the existing booking hotel registry.

## Current Architecture Summary

- Backend: NestJS 11 modular API in [`tourism-backend/src`](/Users/s.tatishvili/.config/superpowers/worktrees/tourism/partner-hotels-system/tourism-backend/src).
- Database: Prisma + PostgreSQL schema in [`tourism-backend/prisma/schema.prisma`](/Users/s.tatishvili/.config/superpowers/worktrees/tourism/partner-hotels-system/tourism-backend/prisma/schema.prisma).
- Frontend: Next.js App Router with locale segment in [`nextjs-frontend/app/[locale]`](/Users/s.tatishvili/.config/superpowers/worktrees/tourism/partner-hotels-system/nextjs-frontend/app/[locale]).
- Cloudinary upload: backend upload service in [`tourism-backend/src/uploads`](/Users/s.tatishvili/.config/superpowers/worktrees/tourism/partner-hotels-system/tourism-backend/src/uploads) and frontend admin tour image flow in [`nextjs-frontend/app/[locale]/admin/tours/[id]/edit/page.tsx`](/Users/s.tatishvili/.config/superpowers/worktrees/tourism/partner-hotels-system/nextjs-frontend/app/[locale]/admin/tours/[id]/edit/page.tsx).
- Admin shell: [`nextjs-frontend/app/[locale]/admin/layout.tsx`](/Users/s.tatishvili/.config/superpowers/worktrees/tourism/partner-hotels-system/nextjs-frontend/app/[locale]/admin/layout.tsx).

## Key Decision

`Partner Hotels` will be implemented as a separate domain from the existing booking `Hotel` registry.

Rationale:

- Existing `Hotel` is already part of the booking orchestration flow and hotel inquiry email process.
- The new public hotel catalog has richer content, SEO needs, visibility control, and Cloudinary media needs that do not belong in the booking registry.
- Keeping them separate avoids coupling the booking workflow with public catalog content.

## Data Model

### New `PartnerHotel`

- `id`
- `slug` unique
- `name`
- `starRating` integer 1-5
- `coverImageUrl`
- `coverImagePublicId`
- `shortDescription_ka`
- `shortDescription_en`
- `shortDescription_ru`
- `description_ka`
- `description_en`
- `description_ru`
- `address`
- `contactPhone`
- `website` nullable
- `isVisible` boolean default `true`
- `createdAt`
- `updatedAt`

### New `PartnerHotelImage`

- `id`
- `partnerHotelId`
- `url`
- `publicId`
- `createdAt`

### Extend `User`

- `partnerType` nullable enum:
  - `DRIVER`
  - `GUIDE`
  - `PARTNER`
  - `CUSTOMER`

### Extend `BookingTour`

- `driverId` nullable FK to `User`
- `guideId` nullable FK to `User`

This is attached to `BookingTour`, not `Booking`, because bookings already support multiple tour rows and each row may need a different driver/guide assignment.

## Backend Design

### New Nest module: `partner-hotels`

Admin endpoints:

- `GET /admin/partner-hotels`
- `POST /admin/partner-hotels`
- `GET /admin/partner-hotels/:id`
- `PATCH /admin/partner-hotels/:id`
- `DELETE /admin/partner-hotels/:id`
- `POST /admin/partner-hotels/:id/images`
- `DELETE /admin/partner-hotels/images/:imageId`
- `POST /admin/partner-hotels/:id/cover`

Public endpoints:

- `GET /partner-hotels`
- visible only
- `GET /partner-hotels/:slug`
- visible only

### Cloudinary

No new upload pipeline will be created.

Partner hotel admin pages will reuse the existing pattern:

1. upload raw file to `POST /admin/uploads`
2. receive `secure_url` + `public_id`
3. persist the returned metadata through partner hotel endpoints

This keeps Cloudinary behavior identical to current tour image handling.

## Frontend Design

### Admin UI

New admin menu item:

- `Partner Hotels`

New pages:

- `app/[locale]/admin/partner-hotels/page.tsx`
- list/search/toggle visibility/delete
- `app/[locale]/admin/partner-hotels/create/page.tsx`
- create form
- `app/[locale]/admin/partner-hotels/[id]/edit/page.tsx`
- edit form

Form requirements:

- multilingual short/full descriptions
- cover image upload
- gallery upload
- visibility toggle
- responsive layout matching existing admin patterns

### Public UI

New detail route:

- `app/[locale]/partner-hotels/[slug]/page.tsx`

Page sections:

- hero header with cover image, hotel name, stars
- full localized description
- gallery
- contact information

SEO:

- `generateMetadata`
- canonical and alternate language links
- OpenGraph and Twitter images

### Homepage

Existing `Popular Destinations` section on [`app/[locale]/page.tsx`](/Users/s.tatishvili/.config/superpowers/worktrees/tourism/partner-hotels-system/nextjs-frontend/app/[locale]/page.tsx) will be removed and replaced with `Our Partner Hotels`.

Card contents:

- cover image
- hotel name
- star rating
- localized short description
- `View Hotel` CTA

Only `isVisible = true` hotels will be shown.

## Users And Booking UI

### Admin Users Page

Extend current create/edit flow to include `partnerType`.

### Admin Booking Page

In each tour row:

- add optional `Driver` selector
- add optional `Guide` selector

Data source:

- users filtered from `/admin/users`
- drivers use `partnerType = DRIVER`
- guides use `partnerType = GUIDE`

## Migrations

A new Prisma migration will:

- create `PartnerHotel`
- create `PartnerHotelImage`
- add `partnerType` to `User`
- add `driverId`
- add `guideId`
- add indexes and foreign keys

All additions are isolated or nullable, so existing data and flows remain compatible.

## Verification

- backend targeted tests for partner hotel service/controller behavior
- backend targeted tests for user `partnerType` create/update behavior
- backend targeted tests for booking driver/guide persistence
- backend build
- frontend build
- smoke validation of:
  - admin partner hotels pages
  - homepage partner hotel cards
  - public partner hotel detail SEO route

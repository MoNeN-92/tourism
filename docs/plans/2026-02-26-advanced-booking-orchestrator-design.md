# Advanced Booking Orchestrator & Multi-Role Management Design

## Context
This design upgrades the current Next.js + NestJS + Prisma booking core to support:
- Multi-role admin security (`ADMIN`, `MODERATOR`) with route-scoped permissions.
- Multi-service booking orchestration (multiple tours + structured hotel rooms).
- Soft-delete retention flow with restore/permanent-delete controls.
- Multi-currency and percentage-based payment support.
- Automated Zoho SMTP workflows for approval and hotel inquiry events.
- Mobile-first touch interactions with swipe-friendly gallery behavior.

## Goals
- Preserve existing flows where possible and introduce backward-compatible transitions.
- Keep current entity naming and endpoint patterns unless explicitly superseded.
- Add modular persistence models for tours/hotel-room breakdown instead of overloading a single booking row.

## RBAC and Authentication

### Roles
- `ADMIN`:
  - Full CRUD on all admin entities.
  - Exclusive access to user management and permanent deletion.
- `MODERATOR`:
  - Booking create/read/update.
  - Can restore soft-deleted bookings.
  - Cannot delete records permanently and cannot access user-management admin pages.

### Login Entry Points
- `POST /auth/admin/login` for `ADMIN`.
- `POST /auth/staff/login` for `MODERATOR`.
- Keep `POST /auth/login` as temporary backward-compatible alias to admin login.

### Route Protection
- Next.js middleware reads admin JWT from `token` cookie payload and gates routes by role.
- `ADMIN`-only routes: users/tours/blog management.
- `ADMIN|MODERATOR` routes: bookings/dashboard/calendar.

## Data Model

### Admin/User Roles
- Add explicit enum role for `Admin` (`ADMIN`, `MODERATOR`).
- Add role enum in `User` model (`USER`, `ADMIN`, `MODERATOR`) for future consistency and auditability.

### Booking Core
Keep `Booking` as aggregate root and add:
- `BookingTour[]`: one booking can contain multiple tours.
- `BookingHotelService?`: one structured hotel service per booking.
- `BookingHotelRoom[]`: multiple room entries linked to hotel service.
- `Hotel` registry model (`name`, `email`) used by hotel service.

### Financial/Retention
- `Booking.currency`: `GEL`, `USD`, `EUR`.
- `Booking.amountPaidMode`: `FLAT`, `PERCENT`.
- `Booking.amountPaidPercent`: optional percentage source value.
- `Booking.isDeleted`, `Booking.deletedAt` for trash-bin lifecycle.

## API & Behavior Matrix

### Bookings
- `GET /admin/bookings` (`ADMIN|MODERATOR`): active bookings.
- `GET /admin/bookings/trash` (`ADMIN|MODERATOR`): deleted bookings.
- `POST /admin/bookings` (`ADMIN|MODERATOR`): create with tours/hotel/financials.
- `PATCH /admin/bookings/:id` (`ADMIN|MODERATOR`): update.
- `DELETE /admin/bookings/:id` (`ADMIN`): soft-delete.
- `POST /admin/bookings/:id/restore` (`ADMIN|MODERATOR`): restore.
- `DELETE /admin/bookings/:id/permanent` (`ADMIN`): hard delete.

### Hotel Registry
- `GET/POST/PATCH` for `ADMIN|MODERATOR`.
- `DELETE` for `ADMIN`.

### Email Events
- Booking `PENDING -> APPROVED`: guest confirmation email.
- Hotel request checkbox enabled: hotel inquiry to registry email.
- Failures logged to `EmailLog`; booking operations remain successful.

## Frontend Orchestrator UX

### Booking Modal (`max-w-6xl`)
- Two-column desktop layout:
  - Left: customer + tours.
  - Right: hotel + rooms.
- Mobile/tablet collapses to stacked cards.
- All controls meet touch target minimum (~44px).

### Dynamic Form Capabilities
- Existing user selector auto-fills guest details but fields remain editable.
- "No account" clears guest fields.
- `Add Tour` appends multiple tour rows with `carType`.
- `Add Room` appends hotel room rows.
- Financial mode toggle computes paid amount from percent when selected.

### Trash UX
- Active/Trash tabs.
- Role-aware action buttons.
- Restore flow and admin-only permanent deletion.

## Mobile Touch Experience
- Swipe-enabled image gallery behavior (touch drag gestures for next/prev image).
- Desktop preserves click/arrow navigation.

## Error Handling
- Frontend form validation: identity, at least one service, date consistency, payment bounds.
- Backend DTO + service validation.
- Authorization failures return explicit forbidden responses.
- Soft-deleted records excluded from active queries by default.

## Testing Strategy
- Backend unit tests:
  - Role restrictions.
  - Booking creation with multi-tour/hotel-rooms.
  - Percent payment calculations.
  - Soft-delete/restore/permanent delete.
  - Approval-triggered email dispatch.
- Frontend behavior checks:
  - Dynamic row operations.
  - Payment toggle logic.
  - Role-gated actions.
  - Mobile touch interactions.

## Rollout
- Phase A: schema + backend auth/RBAC/API.
- Phase B: frontend booking orchestrator + middleware role gating.
- Phase C: cron purge wiring and production SMTP env hardening.


# Booking + User Accounts Design

**Date:** 2026-02-22
**Status:** Approved

## Goal
Build an end-to-end booking system for Vibe Georgia where:
- users register/login and submit bookings,
- admins review/approve/reject/edit bookings,
- approved bookings appear in an admin calendar,
- users can cancel and request date changes,
- notifications are delivered in-app and by email with SMTP-or-fallback behavior.

## Constraints
- Do not break existing public tours/blog pages or existing admin auth flows.
- Keep implementation additive-first: new models, new routes, new frontend pages.
- Day-based booking only (no time slots).
- No seat/capacity limits in this phase.

## Selected Decisions
- User auth required for booking creation.
- User can cancel booking and request date changes from account area.
- Booking payload includes: `tour + desiredDate + adults + children + roomType + note`.
- `roomType` uses fixed enum: `single|double|twin|triple|family`.
- User auth MVP: email/password only (no verification/reset in this phase).
- Notifications: in-app + email.
- Email behavior: SMTP when configured; otherwise fallback to log and persist audit row.

## Architecture

### Backend modules
- `users`:
  - user entity CRUD for admin management.
  - admin endpoints for user list/detail/update active state.
- `user-auth`:
  - register/login/logout/me for normal users.
  - separate cookie (`user_token`) and separate JWT strategy/guard.
- `bookings`:
  - user booking create/list/detail/cancel/change-request.
  - admin booking list/detail/update/approve/reject.
  - admin change-request approve/reject.
  - admin calendar aggregation endpoint.
- `notifications`:
  - in-app notifications for users.
- `email`:
  - SMTP sender with automatic fallback to log.
  - email delivery audit table.

### Data model additions
- `User`
- `Booking`
- `BookingChangeRequest`
- `Notification`
- `EmailLog`
- supporting enums: booking statuses, room types, notification types, email log status.

### Frontend additions
- User auth pages: `/[locale]/account/login`, `/[locale]/account/register`.
- User area: `/[locale]/account/bookings`, `/[locale]/account/notifications`.
- Tour detail booking form on `/[locale]/tours/[slug]`.
- Admin pages:
  - `/[locale]/admin/bookings`
  - `/[locale]/admin/calendar`
  - `/[locale]/admin/users`

## API Contract

### User auth
- `POST /users/auth/register`
- `POST /users/auth/login`
- `POST /users/auth/logout`
- `GET /users/auth/me`

### User bookings
- `POST /bookings`
- `GET /bookings/my`
- `GET /bookings/my/:id`
- `POST /bookings/:id/cancel`
- `POST /bookings/:id/change-request`

### User notifications
- `GET /notifications/my`
- `GET /notifications/my/unread-count`
- `POST /notifications/:id/read`
- `POST /notifications/my/read-all`

### Admin users
- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`

### Admin bookings
- `GET /admin/bookings`
- `GET /admin/bookings/:id`
- `PATCH /admin/bookings/:id`
- `POST /admin/bookings/:id/approve`
- `POST /admin/bookings/:id/reject`
- `POST /admin/bookings/change-requests/:id/approve`
- `POST /admin/bookings/change-requests/:id/reject`

### Admin calendar
- `GET /admin/bookings/calendar?month=YYYY-MM`

## State transitions

### Booking
- `PENDING` -> `APPROVED`
- `PENDING` -> `REJECTED`
- `PENDING|APPROVED` -> `CANCELLED` (user-initiated)

### Booking change request
- `PENDING` -> `APPROVED`
- `PENDING` -> `REJECTED`
- `PENDING` -> `CANCELLED`

On approved change request:
- booking `desiredDate` gets updated,
- change request marked approved,
- user receives in-app + email notice.

## Safety / non-breaking strategy
- Keep existing admin cookie/token behavior untouched.
- Add user auth in parallel with dedicated cookie/guard.
- Do not alter existing tour/blog payload contracts.
- Introduce new admin navigation links only; keep existing links functional.

## Verification strategy
- Backend:
  - unit tests for booking state transitions + auth basics.
  - build, migration deploy, seed/update checks.
- Frontend:
  - production build success.
  - local smoke on user register/login, booking create, admin approve, calendar visibility.


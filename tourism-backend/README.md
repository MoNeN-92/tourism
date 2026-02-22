# Tourism Platform Backend

NestJS backend API for tourism platform with admin panel, user accounts, and booking lifecycle.

## Features
- ✅ Admin authentication (cookie-based JWT)
- ✅ User registration/login (cookie-based JWT)
- ✅ Tours and blog management
- ✅ Booking lifecycle (create, approve/reject, cancel, date-change requests)
- ✅ Admin calendar endpoint for approved bookings
- ✅ In-app notifications + email logs (SMTP or fallback logging)
- ✅ PostgreSQL + Prisma ORM
- ✅ Input validation

## Installation
```bash
npm install
```

## Environment Variables

Create `.env` from `.env.example` and fill required values:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tourism_db?schema=public"
JWT_SECRET=replace-with-long-random-secret
CORS_ORIGINS=http://localhost:3000
COOKIE_DOMAIN=
ALLOW_PUBLIC_REGISTER=false
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Database Setup
```bash
npx prisma generate
npx prisma migrate deploy
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=replace-me node src/scripts/create-admin.js
```

## Run
```bash
npm run start:dev
```

## Production Run
`start:prod` ავტომატურად უშვებს `prisma migrate deploy`-ს და მერე რთავს API-ს.

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Public
- GET `/tours` - Get all active tours
- GET `/tours/:slug` - Get tour by slug

### Admin (requires JWT)
- POST `/auth/login` - Admin login
- POST `/auth/logout` - Admin logout
- GET `/admin/tours` - Get all tours (active + inactive)
- POST `/admin/tours` - Create tour
- PUT `/admin/tours/:id` - Update tour
- DELETE `/admin/tours/:id` - Delete tour
- GET `/admin/users` - List users
- PATCH `/admin/users/:id` - Update user status/profile
- GET `/admin/bookings` - List bookings
- POST `/admin/bookings/:id/approve` - Approve booking
- POST `/admin/bookings/:id/reject` - Reject booking
- GET `/admin/bookings/calendar?month=YYYY-MM` - Booking calendar view

### Users (requires user JWT for protected endpoints)
- POST `/users/auth/register` - Register user
- POST `/users/auth/login` - Login user
- POST `/users/auth/logout` - Logout user
- GET `/users/auth/me` - Current user profile
- POST `/bookings` - Create booking request
- GET `/bookings/my` - List own bookings
- POST `/bookings/:id/cancel` - Cancel booking
- POST `/bookings/:id/change-request` - Request date change
- GET `/notifications/my` - User notifications

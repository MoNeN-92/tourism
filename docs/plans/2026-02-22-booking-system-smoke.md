# Booking System Smoke Test (Local)

## Preconditions
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Postgres running on `localhost:5432`
- Prisma migrations applied:
  - `cd tourism-backend && npx prisma migrate deploy`

## Admin Credentials
- Email: `admin@vibegeorgia.local`
- Password: `TestAdmin123!`

## Smoke Flow

1. Register a user
- Open: `http://localhost:3000/en/account/register`
- Create account and confirm redirect to `account/bookings`

2. Submit booking request
- Open any tour page, example: `http://localhost:3000/en/tours/test`
- Fill booking form and submit
- Expected: success message, booking visible in `account/bookings` with `PENDING`

3. Approve from admin
- Login admin: `http://localhost:3000/en/admin/login`
- Open: `http://localhost:3000/en/admin/bookings`
- Approve booking
- Expected: status becomes `APPROVED`

4. Validate calendar
- Open: `http://localhost:3000/en/admin/calendar`
- Select booking month
- Expected: day cell shows booking count and booking appears in selected day list

5. Validate user notifications
- User opens: `http://localhost:3000/en/account/notifications`
- Expected: booking created + approved notifications

6. Validate date change flow
- User: request date change from `account/bookings`
- Admin: approve change from `admin/bookings`
- Expected: booking date updates and notification appears for user

7. Validate cancellation flow
- User cancels booking from `account/bookings`
- Expected: status becomes `CANCELLED` and notification appears

## Email behavior
- If SMTP envs are empty, email events are fallback-logged into `EmailLog`.
- Query check example:
  - `cd tourism-backend && node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.emailLog.findMany({orderBy:{createdAt:'desc'},take:5}).then(r=>console.log(r)).finally(()=>p.\$disconnect())"`

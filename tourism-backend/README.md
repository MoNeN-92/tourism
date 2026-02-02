# Tourism Platform Backend

NestJS backend API for tourism platform with JWT authentication and Tours CRUD.

## Features
- ✅ Admin Authentication (JWT)
- ✅ Tours CRUD
- ✅ PostgreSQL + Prisma ORM
- ✅ Input Validation

## Installation
```bash
npm install
```

## Environment Variables

Create `.env` file:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tourism_db?schema=public"
JWT_SECRET=your-secret-key
```

## Database Setup
```bash
npx prisma generate
npx prisma db push
node src/scripts/create-admin.js
```

## Run
```bash
npm run start:dev
```

## API Endpoints

### Public
- GET `/tours` - Get all active tours
- GET `/tours/:slug` - Get tour by slug

### Admin (requires JWT)
- POST `/auth/login` - Admin login
- POST `/admin/tours` - Create tour
- PUT `/admin/tours/:id` - Update tour
- DELETE `/admin/tours/:id` - Delete tour

## Test Admin Credentials
- Email: `admin@tourism.com`
- Password: `admin123`
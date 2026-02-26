# Tourism Frontend (Next.js)

## Setup

```bash
npm install
cp .env.local.example .env.local # if you keep a template
```

Required envs for local run:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_LEGACY_TOKEN=false
NEXT_PUBLIC_ENABLE_MOCK_CONTENT=false
NEXT_PUBLIC_MERGE_MOCK_WITH_API=false
```

## Run

```bash
npm run dev
```

Open:
- Public site: `http://localhost:3000/en`
- User login: `http://localhost:3000/en/account/login`
- User bookings: `http://localhost:3000/en/account/bookings`
- Unified login (all roles): `http://localhost:3000/en/account/login`
- Admin bookings: `http://localhost:3000/en/admin/bookings`
- Admin calendar: `http://localhost:3000/en/admin/calendar`

## Build

```bash
npm run build
```

## Implemented booking UI
- Tour detail booking form (`date + adults + children + room type + note`)
- User account auth pages
- User bookings management (cancel + date change request)
- User notifications page
- Admin bookings management with approve/reject/edit
- Admin booking calendar month view
- Admin users management page

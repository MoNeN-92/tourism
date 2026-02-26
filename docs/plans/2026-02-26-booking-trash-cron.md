# Booking Trash Purge Cron

## Retention Policy
- Soft-deleted bookings stay in trash for 30 days.
- Entries older than 30 days are permanently removed by scheduled purge.

## Purge Command
```bash
cd tourism-backend
npm run bookings:purge-trash
```

## Dry Run
```bash
cd tourism-backend
npm run bookings:purge-trash -- --dry-run
```

## Custom Retention Days
```bash
cd tourism-backend
npm run bookings:purge-trash -- --days=45
```

## Vercel Cron Option
Create a scheduled job that runs daily and triggers:
- a secured backend endpoint that executes the purge command, or
- a serverless function with equivalent Prisma delete logic.

Recommended schedule:
- `0 3 * * *` (daily at 03:00 UTC)

## node-cron Option (self-hosted)
```ts
cron.schedule('0 3 * * *', async () => {
  await execa('npm', ['run', 'bookings:purge-trash'], { cwd: '/app/tourism-backend' })
})
```

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const daysArg = args.find((arg) => arg.startsWith('--days='));
  const days = daysArg ? Number(daysArg.replace('--days=', '')) : 30;

  if (!Number.isFinite(days) || days <= 0) {
    throw new Error('--days must be a positive number');
  }

  return { dryRun, days };
}

async function main() {
  const { dryRun, days } = parseArgs();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const candidates = await prisma.booking.findMany({
    where: {
      isDeleted: true,
      deletedAt: {
        not: null,
        lt: cutoff,
      },
    },
    select: {
      id: true,
      deletedAt: true,
    },
    orderBy: { deletedAt: 'asc' },
  });

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          retentionDays: days,
          cutoff: cutoff.toISOString(),
          candidates: candidates.length,
          ids: candidates.map((item) => item.id),
        },
        null,
        2,
      ),
    );
    return;
  }

  const result = await prisma.booking.deleteMany({
    where: {
      id: {
        in: candidates.map((item) => item.id),
      },
    },
  });

  console.log(
    JSON.stringify(
      {
        mode: 'delete',
        retentionDays: days,
        cutoff: cutoff.toISOString(),
        deleted: result.count,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

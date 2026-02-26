import { AdminRole, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const emailRaw = process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password =
    process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const firstName =
    process.env.SEED_ADMIN_FIRST_NAME || process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName =
    process.env.SEED_ADMIN_LAST_NAME || process.env.ADMIN_LAST_NAME || 'User';

  if (!emailRaw || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD (or ADMIN_EMAIL/ADMIN_PASSWORD) are required',
    );
  }

  const email = emailRaw.trim().toLowerCase();

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    // Re-seeding same email should reset credentials to provided values.
    update: {
      password: hashedPassword,
      firstName,
      lastName,
      role: AdminRole.ADMIN,
    },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: AdminRole.ADMIN,
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

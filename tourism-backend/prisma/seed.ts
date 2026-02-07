import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123Tatishvili.', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'ika.tatishvili@gmail.com' },
    update: {}, // თუ უკვე არსებობს, არაფერი შეცვალო
    create: {
      email: 'ika.tatishvili@gmail.com',
      password: hashedPassword,
      firstName: 'Ika',
      lastName: 'Tatishvili',
      role: 'admin',
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
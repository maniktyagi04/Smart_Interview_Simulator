import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = "d7b31f50-646a-4a71-b0c3-16e119be5957";
  const email = "tyagimanik77@gmail.com";
  const name = "Manik Tyagi";

  console.log(`Creating user ${email} with ID ${userId}...`);

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: email,
      name: name,
      role: Role.STUDENT,
    },
  });

  console.log('User created/verified:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

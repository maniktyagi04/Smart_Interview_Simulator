
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Cleaning up Test Data ---');
    // Delete test sessions
    await prisma.interviewSession.deleteMany({
        where: {}
    });
    console.log('✅ Deleted all interview sessions.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

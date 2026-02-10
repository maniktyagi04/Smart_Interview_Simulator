import { PrismaClient, QuestionCategory } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const deleted = await prisma.question.deleteMany({
      where: {
        category: QuestionCategory.SYSTEM_DESIGN
      }
    });
    console.log(`Deleted ${deleted.count} System Design questions.`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

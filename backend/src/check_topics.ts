
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking Questions in DB...');
  
  const questions = await prisma.question.findMany({
    select: {
      topic: true,
      domain: true,
      title: true
    }
  });

  console.log(`Found ${questions.length} total questions.`);

  const topics = new Set(questions.map(q => q.topic));
  console.log('\nUnique Topics in DB:', Array.from(topics));
  
  const domains = new Set(questions.map(q => q.domain));
  console.log('\nUnique Domains in DB:', Array.from(domains));

  // Check specific matches we care about
  const sample = questions.slice(0, 5);
  console.log('\nSample Questions:', sample);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());


import { PrismaClient } from '@prisma/client';
import { SessionService } from './src/services/session.service';

const prisma = new PrismaClient();

async function main() {
  const userId = '3e2e95f4-91da-4b1f-a7d6-d6ffadc91070'; // NgNik FF
  const sessionData = {
    type: 'TECHNICAL',
    domain: 'DSA',
    difficulty: 'MEDIUM',
    topics: [] 
  };

  try {
    console.log('Creating session for user:', userId);
    const session = await SessionService.createSession(userId, sessionData);
    console.log('Session created:', session.id);
  } catch (error) {
    console.error('Error creating session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

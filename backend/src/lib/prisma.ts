import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  // In Prisma 7, the connection URL is typically handled via prisma.config.ts 
  // or passed to the constructor.
});

export default prisma;

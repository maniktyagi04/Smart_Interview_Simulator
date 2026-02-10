import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function reset() {
  console.log('--- STARTING DATABASE RESET ---');

  try {
    // 1. Delete all interview questions
    await prisma.interviewQuestion.deleteMany({});
    console.log('✔ Deleted all interview questions');

    // 2. Delete all interview sessions
    await prisma.interviewSession.deleteMany({});
    console.log('✔ Deleted all interview sessions');

    // 3. Delete all students (Role = STUDENT)
    await prisma.user.deleteMany({
      where: { role: 'STUDENT' }
    });
    console.log('✔ Deleted all students');

    // 4. Ensure at least one admin exists
    const adminEmail = 'admin@example.com';
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'System Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
          password: hashedPassword
        }
      });
      console.log('✔ Created default admin: admin@example.com / admin123');
    } else {
      // Also update existing admin password to be sure
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      });
      console.log('✔ Updated admin password: admin@example.com / admin123');
    }

    // 5. Delete and Create basic questions for testing if none exist
    const questionCount = await prisma.question.count();
    if (questionCount === 0) {
      await prisma.question.create({
        data: {
          title: 'Two Sum',
          topic: 'Array',
          category: 'DSA',
          type: 'TECHNICAL',
          domain: 'DSA',
          difficulty: 'EASY',
          problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          idealAnswer: 'Use a hash map to store the number and its index.',
          keyConcepts: 'Hash Map, Array, Time Complexity O(n)',
          rubric: 'Check for correctness and time complexity.',
          status: 'ACTIVE'
        }
      });
      console.log('✔ Created test question: Two Sum');
    }

    console.log('--- DATABASE RESET COMPLETE ---');
  } catch (error) {
    console.error('✘ Reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users...');

  // Hash password: "password123"
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      password: hashedPassword,
      name: 'Test Student',
      role: Role.STUDENT,
    },
  });
  console.log('✅ Created student:', student.email);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Test Admin',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Created admin:', admin.email);

  console.log('\n📝 Login credentials:');
  console.log('Student - Email: student@test.com | Password: password123');
  console.log('Admin   - Email: admin@test.com   | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

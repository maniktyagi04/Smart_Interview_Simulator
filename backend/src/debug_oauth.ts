
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGoogleStrategy() {
  console.log('Testing Google Strategy Logic...');
  
  const profile = {
    id: '1234567890',
    displayName: 'Debug User',
    emails: [{ value: 'debug_test_google@example.com' }],
    photos: [{ value: 'https://example.com/photo.jpg' }]
  };

  try {
    const email = profile.emails[0].value;
    console.log('Searching for user:', email);
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('User not found. Creating...');
      user = await prisma.user.create({
        data: {
          email,
          name: profile.displayName,
          googleId: profile.id,
          avatar: profile.photos[0].value,
          role: 'STUDENT', 
        },
      });
      console.log('User created:', user.id);
    } else {
      console.log('User found:', user.id);
      if (!(user as { googleId?: string | null }).googleId) {
          console.log('Updating googleId...');
          user = await prisma.user.update({
            where: { email },
            data: { googleId: profile.id, avatar: profile.photos[0].value },
          });
          console.log('User updated');
      }
    }
    
    console.log('Final User State:', user);
    console.log('SUCCESS: DB Logic works.');
  } catch (error) {
    console.error('FAILURE: DB Logic failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGoogleStrategy();

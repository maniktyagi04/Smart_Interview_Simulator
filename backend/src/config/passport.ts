
import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: 'http://localhost:5005/api/auth/google/callback',
      passReqToCallback: true,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (req: any, accessToken: string, refreshToken: string, params: any, profile: { id: string; displayName?: string; emails?: Array<{ value: string }>; photos?: Array<{ value: string }> }, done: (error: Error | null, user?: any) => void) => {
      console.log('Google Strategy Callback Started');
      console.log('Profile:', JSON.stringify(profile));
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
            console.error('No email found');
            return done(new Error('No email found in Google profile'), false);
        }

        let user = await prisma.user.findUnique({ where: { email } });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
          console.log('Creating new user...');
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || 'Google User',
              googleId: profile.id,
              avatar: profile.photos?.[0].value,
              role: 'STUDENT', // Default role
            },
          });
          console.log('User created:', user.id);
        } else if (!(user as { googleId?: string | null }).googleId) {
          console.log('Updating user with googleId...');
          user = await prisma.user.update({
            where: { email },
            data: { googleId: profile.id, avatar: profile.photos?.[0].value || (user as { avatar?: string | null }).avatar },
          });
          console.log('User updated');
        }

        return done(null, user);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error as Error, false);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'place-holder',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'place-holder',
      callbackURL: 'http://localhost:5005/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        // Facebook might not return email
        const facebookId = profile.id;

        if (email) {
          let user = await prisma.user.findUnique({ where: { email } });
          if (user) {
             if (!(user as { facebookId?: string | null }).facebookId) {
                user = await prisma.user.update({
                    where: { email },
                    data: { facebookId, avatar: profile.photos?.[0].value || (user as { avatar?: string | null }).avatar }
                })
             }
             return done(null, user);
          }
        }
        
        let user = await prisma.user.findUnique({ where: { facebookId } });
        
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: email || `fb_${facebookId}@example.com`,
                    name: profile.displayName,
                    facebookId,
                    avatar: profile.photos?.[0].value,
                    role: 'STUDENT'
                }
            })
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;

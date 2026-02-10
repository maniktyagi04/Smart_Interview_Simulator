
import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('[Passport] Registering Google Strategy');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
        passReqToCallback: true,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (req: any, accessToken: string, refreshToken: string, params: any, profile: { id: string; displayName?: string; emails?: Array<{ value: string }>; photos?: Array<{ value: string }> }, done: (error: Error | null, user?: any) => void) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
              return done(new Error('No email found in Google profile'), false);
          }

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || 'Google User',
                googleId: profile.id,
                avatar: profile.photos?.[0].value,
                role: 'STUDENT',
              },
            });
          } else if (!(user as { googleId?: string | null }).googleId) {
            user = await prisma.user.update({
              where: { email },
              data: { googleId: profile.id, avatar: profile.photos?.[0].value || (user as { avatar?: string | null }).avatar },
            });
          }

          return done(null, user);
        } catch (error) {
          console.error('Google Strategy Error:', error);
          return done(error as Error, false);
        }
      }
    )
  );
} else {
  console.warn('[Passport] Google credentials missing - Google Login disabled');
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  console.log('[Passport] Registering Facebook Strategy');
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
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
} else {
  console.warn('[Passport] Facebook credentials missing - Facebook Login disabled');
}

export default passport;

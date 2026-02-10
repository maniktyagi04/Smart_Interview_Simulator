import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.patch('/profile', authenticate, AuthController.updateProfile);

// DEBUG OAUTH
router.get('/debug', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strategies = Object.keys((passport as any)._strategies || {});
  console.log('[DEBUG] Registered Strategies:', strategies);
  console.log('[DEBUG] Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
  if (process.env.GOOGLE_CLIENT_ID) {
      console.log('[DEBUG] Client ID Length:', process.env.GOOGLE_CLIENT_ID.length);
      console.log('[DEBUG] Client ID Sample:', process.env.GOOGLE_CLIENT_ID.substring(0, 5) + '...');
  }
  res.json({ 
      strategies, 
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
      envKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('RAILWAY')) 
  });
});

// Google Auth
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false, state: false } as any));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  AuthController.socialCallback
);

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  AuthController.socialCallback
);

export default router;

import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.patch('/profile', authenticate, AuthController.updateProfile);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  AuthController.socialCallback
);

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  AuthController.socialCallback
);

export default router;

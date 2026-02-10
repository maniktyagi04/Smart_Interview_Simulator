
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as { userId: string }).userId;
      const result = await AuthService.updateProfile(userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async socialCallback(req: Request, res: Response, next: NextFunction) {
    console.log('Social Callback Hit');
    try {
        const user = (req.user as unknown) as { id: string, email: string, role: string };
       if (!user) {
         console.error('No user in req.user');
         return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=Authentication failed`);
       }

       console.log('User authenticated:', user.id);
       // Generate JWT
       const token = jwt.sign(
         { id: user.id, email: user.email, role: user.role },
         JWT_SECRET,
         { expiresIn: '30d' }
       );
       
       console.log('Redirecting to login with token');
       // Redirect to frontend login page to handle token storage
       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
    } catch (error) {
       console.error('Social Callback Error:', error);
       next(error);
    }
  }
}

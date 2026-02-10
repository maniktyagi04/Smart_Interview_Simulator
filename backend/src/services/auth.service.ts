import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { Role } from '@prisma/client';

export class AuthService {
  static async signup(data: Record<string, string>) {
    const { email, password, name, role } = data;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError(400, 'User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: (role as Role) || Role.STUDENT,
        },
      });

      return this.generateAuthResponse(user);
    } catch (error) {
      if ((error as { code?: string }).code === 'P1001' || (error as Error).message?.includes('Authentication failed')) {
        throw new AppError(500, 'Database connection failed. Please check your credentials in backend/.env');
      }
      throw error;
    }
  }

  static async login(data: Record<string, string>) {
    const { email, password } = data;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        throw new AppError(401, 'Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new AppError(401, 'Invalid credentials');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if ((error as { code?: string }).code === 'P1001' || (error as Error).message?.includes('Authentication failed')) {
        throw new AppError(500, 'Database connection failed. Please check your credentials in backend/.env');
      }
      throw error;
    }
  }

  static async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string; avatar?: string }) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          ...(data.avatar && { avatar: data.avatar }),
          // Phone is not in schema yet, ignoring for now or should add to schema?
          // For now let's just update what we can.
        },
      });

      return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar
        },
        message: "Profile updated successfully"
      };
    } catch {
      throw new AppError(500, 'Failed to update profile');
    }
  }

  private static generateAuthResponse(user: { id: string; email: string; name: string | null; role: Role }) {
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkey123',
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }
}

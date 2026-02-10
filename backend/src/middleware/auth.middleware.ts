import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized - No token provided'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123') as JwtPayload & { id?: string };
    req.user = {
      userId: decoded.id || decoded.userId, // Handle both cases for backward compatibility
      role: decoded.role
    };
    next();
  } catch {
    next(new AppError(401, 'Unauthorized - Invalid token'));
  }
};

export const authorize = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden - Insufficient permissions'));
    }

    next();
  };
};

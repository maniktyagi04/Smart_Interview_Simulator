import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';

export class UserController {
  static async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: 'BANNED' },
      });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async scheduleInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      const { date, time } = req.body;
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          scheduledInterview: { date, time }
        },
      });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../../services/analytics.service';

export class AnalyticsController {
  static async getStudentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await AnalyticsService.getStudentAnalytics(req.user!.userId);
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await AnalyticsService.getAdminAnalytics();
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  static async getAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await AnalyticsService.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  }

  static async getAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await AnalyticsService.getAllSessions();
      res.status(200).json(sessions);
    } catch (error) {
      next(error);
    }
  }
}

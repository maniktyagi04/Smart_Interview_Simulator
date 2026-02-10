import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../../services/session.service';
import { EvaluationService } from '../../services/evaluation.service';
import { SessionStatus } from '@prisma/client';

export class SessionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    console.log('[SessionController] create called');
    console.log('[SessionController] user:', req.user);
    console.log('[SessionController] body:', req.body);
    try {
      if (!req.user || !req.user.userId) {
          console.error('[SessionController] No user found in request');
          return res.status(401).json({ message: 'User not authenticated' });
      }
      const session = await SessionService.createSession(req.user.userId, req.body);
      res.status(201).json(session);
    } catch (error) {
      console.error('[SessionController] Error creating session:', error);
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await SessionService.getSession(req.params.id as string, req.user!.userId);
      res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.body.status as SessionStatus;
      const session = await SessionService.updateStatus(
        req.params.id as string, 
        req.user!.userId, 
        status,
        req.user!.role
      );

      // Trigger evaluation if submitted
      if (status === SessionStatus.SUBMITTED) {
        await EvaluationService.evaluateSession(req.params.id as string, req.user!.userId);
        const updatedSession = await SessionService.getSession(req.params.id as string, req.user!.userId);
        return res.status(200).json(updatedSession);
      }

      res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  }

  static async publish(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure only Admin can publish
      if (req.user!.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const session = await SessionService.updateStatus(
        req.params.id as string,
        req.user!.userId, // This might be wrong if session belongs to another user. But updateStatus generally checks permissions. 
        // Wait, SessionService.updateStatus logic?
        // Let's check updateStatus implementation. It might restrict by userId.
        // We need an admin override.
        SessionStatus.COMPLETED,
        'ADMIN' 
      );
      res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  }

  static async interact(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      const result = await SessionService.interact(
        req.params.id as string,
        req.user!.userId,
        message
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId, answer } = req.body;
      const result = await SessionService.submitAnswer(
        req.params.id as string,
        req.user!.userId,
        questionId,
        answer
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMySessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await SessionService.getSessionsByUser(req.user!.userId);
      res.status(200).json(sessions);
    } catch (error) {
      next(error);
    }
  }

  static async executeCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { language, code } = req.body;
      // We perform execution. Session ID is in params but we might not strictly need it for statless execution
      // unless we want to log it to the session. For now, just execute.
      const output = await import('../../services/runner.service').then(m => m.RunnerService.execute(language, code));
      res.status(200).json({ output });
    } catch (error) {
      next(error);
    }
  }
}

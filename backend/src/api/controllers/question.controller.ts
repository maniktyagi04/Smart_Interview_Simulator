import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../../services/question.service';

export class QuestionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await QuestionService.create(req.body);
      res.status(201).json(question);
    } catch (error) {
      next(error);
    }
  }

  static async importCodeforces(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, minRating, maxRating, tags } = req.body;
      const questions = await QuestionService.importCodeforcesQuestions(
        limit, 
        minRating, 
        maxRating, 
        tags
      );
      res.status(201).json({
        message: `Successfully imported ${questions.length} questions from Codeforces`,
        count: questions.length,
        questions
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await QuestionService.update(req.params.id as string, req.body);
      res.status(200).json(question);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await QuestionService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        domain: req.query.domain as string,
        difficulty: req.query.difficulty as string,
        type: req.query.type as string,
        category: req.query.category as string,
        topic: req.query.topic as string,
        status: req.query.status as string,
        search: req.query.search as string,
        source: req.query.source as string,
      };
      const questions = await QuestionService.getAll(filters);
      res.status(200).json(questions);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await QuestionService.getById(req.params.id as string);
      res.status(200).json(question);
    } catch (error) {
      next(error);
    }
  }
}

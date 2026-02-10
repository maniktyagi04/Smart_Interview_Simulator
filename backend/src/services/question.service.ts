import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { Domain, Difficulty, InterviewType, QuestionCategory, QuestionStatus, QuestionSource, Prisma } from '@prisma/client';
import { CodeforcesService } from './codeforcesService';

interface QuestionInput {
  title: string;
  topic: string;
  category: QuestionCategory;
  problemStatement: string;
  content?: string;
  idealAnswer: string;
  keyConcepts: string;
  rubric: string;
  evaluationNotes?: string;
  type: InterviewType;
  domain: Domain;
  difficulty: Difficulty;
  status?: QuestionStatus;
  source?: QuestionSource;
}

export class QuestionService {
  static async create(data: QuestionInput) {
    return prisma.question.create({
      data: {
        ...data,
        content: data.content || data.problemStatement,
        status: data.status || QuestionStatus.DRAFT,
        source: data.source || QuestionSource.ADMIN,
      },
    });
  }

  static async createMany(questions: Array<Record<string, unknown>>) {
    // Upsert to avoid duplicates based on externalId
    const results = [];
    for (const q of questions) {
      if (q.externalId && q.externalSource) {
        const existing = await prisma.question.findUnique({
          where: {
            externalSource_externalId: {
              externalSource: q.externalSource as string,
              externalId: q.externalId as string
            }
          }
        });

        if (!existing) {
          results.push(await prisma.question.create({ data: q as never }));
        }
      } else {
        results.push(await prisma.question.create({ data: q as never }));
      }
    }
    return results;
  }

  static async importCodeforcesQuestions(limit: number = 20, minRating?: number, maxRating?: number, tags: string[] = []) {
    const questions = await CodeforcesService.fetchProblems(tags, minRating, maxRating, limit);
    return this.createMany(questions);
  }

  static async update(id: string, data: Partial<QuestionInput>) {
    return prisma.question.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.question.delete({ where: { id } });
  }

  static async getAll(filters: { 
    domain?: string; 
    difficulty?: string; 
    type?: string;
    category?: string;
    topic?: string;
    status?: string;
    search?: string;
    source?: string;
  }) {
    const { domain, difficulty, type, category, topic, status, search, source } = filters;
    
    const where: Prisma.QuestionWhereInput = {
      domain: domain ? (domain as Domain) : undefined,
      difficulty: difficulty ? (difficulty as Difficulty) : undefined,
      type: type ? (type as InterviewType) : undefined,
      category: category ? (category as QuestionCategory) : undefined,
      topic: topic ? { contains: topic, mode: 'insensitive' } : undefined,
      status: status ? (status as QuestionStatus) : undefined,
      source: source ? (source as QuestionSource) : undefined,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problemStatement: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } }
      ];
    }

    return prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string) {
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) throw new AppError(404, 'Question not found');
    return question;
  }
}

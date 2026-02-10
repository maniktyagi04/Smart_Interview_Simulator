import prisma from '../lib/prisma';
import { InterviewerService } from './interviewer.service';
import { SessionStatus } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

export class EvaluationService {
  private static interviewer = new InterviewerService();

  static async evaluateSession(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new AppError(404, 'Session not found');
    if (session.userId !== userId) throw new AppError(403, 'Access denied');
    if (session.status !== SessionStatus.SUBMITTED) {
      throw new AppError(400, 'Session must be submitted before evaluation');
    }

    const transcript = JSON.stringify(session.messages);
    const context = {
        type: session.type as 'TECHNICAL' | 'HR',
        topics: session.topics as string[],
        difficulty: session.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
    };

    // Fetch relevant questions to use as context for evaluation
    // We fetch questions that match the session's domain and type to provide accurate rubrics
    const knownQuestions = await prisma.question.findMany({
        where: {
            domain: session.domain,
            type: session.type,
            status: 'ACTIVE',
            // Optional: match difficulty if needed, but broader context is better
        },
        take: 50,
        select: {
            title: true,
            problemStatement: true,
            rubric: true,
            idealAnswer: true
        }
    });

    const evaluation = await this.interviewer.evaluateFinalPerformance(transcript, context, knownQuestions);

    if (!evaluation) {
        throw new AppError(500, 'Failed to generate evaluation');
    }

    // Save individual question evaluations
    if (evaluation.questions && Array.isArray(evaluation.questions)) {
        for (const q of evaluation.questions) {
            // Create a dummy question record if needed or just link to session
            // Since we need a Question relation, we first create/find a Question or use a placeholder
            // For simplicity in this chat-flow, we create a new Question entry for each turn
            const questionRecord = await prisma.question.create({
                data: {
                    type: session.type,
                    domain: session.domain,
                    difficulty: session.difficulty,
                    category: session.domain as never,
                    title: q.question.substring(0, 100),
                    topic: 'General',
                    problemStatement: q.question,
                    content: q.question,
                    idealAnswer: q.idealAnswer || 'N/A',
                    keyConcepts: '',
                    rubric: '',
                }
            });

            await prisma.interviewQuestion.create({
                data: {
                    sessionId: sessionId,
                    questionId: questionRecord.id, // We need to link to the created question
                    userAnswer: q.userAnswer,
                    score: q.score,
                    evaluation: JSON.stringify(q.evaluation),
                    order: 0
                }
            });
        }
    }

    return prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        score: evaluation.score,
        status: SessionStatus.PENDING_REVIEW,
        feedback: JSON.stringify(evaluation),
      },
    });
  }
}

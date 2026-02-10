import prisma from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { SessionStatus, InterviewType, Domain, Difficulty } from '@prisma/client';
import { InterviewerService, InterviewContext } from './interviewer.service';

export class SessionService {
  private static interviewer = new InterviewerService();

  static async createSession(userId: string, data: { 
    type: string; 
    domain: string; 
    difficulty: string;
    topics: string[] 
  }) {
    console.log('[SessionService] createSession called with data:', JSON.stringify(data));
    const { type, domain, difficulty, topics } = data;

    // Verify user exists first to prevent 500 FK error if token is stale
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError(401, 'User not found. Please login again.');
    }

    const context: InterviewContext = {
      type: (type as 'TECHNICAL' | 'HR') || 'TECHNICAL',
      topics: Array.isArray(topics) ? topics : [],
      difficulty: (difficulty as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
    };

    try {
        await this.interviewer.generateInitialGreeting(context);
    } catch (error) {
        console.warn('Failed to generate initial greeting from AI, using default.', error);
    }

    // Filter valid domain for Prisma or use default
    // Using cast for now as schema was updated
    const prismaDomain = domain as Domain;

    // FIND MATCHING QUESTIONS FROM ADMIN POOL - ONE PER TOPIC
    const selectedQuestions = [];
    
    try {
        for (const topic of (topics || [])) {
          // 1. Try finding questions for specific topic
          let matchingQuestions = await prisma.question.findMany({
            where: {
              domain: (prismaDomain || 'DSA') as Domain,
              difficulty: (difficulty as Difficulty) || 'MEDIUM',
              status: 'ACTIVE',
              topic: topic
            }
          });

          // 2. Fallback: If no questions for topic, get random questions from same Domain
          if (matchingQuestions.length === 0) {
              matchingQuestions = await prisma.question.findMany({
                where: {
                    domain: (prismaDomain || 'DSA') as Domain,
                    difficulty: (difficulty as Difficulty) || 'MEDIUM',
                    status: 'ACTIVE'
                }
              });
          }

          if (matchingQuestions.length > 0) {
            const randomQuestion = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
            selectedQuestions.push({ question: randomQuestion, topic });
          }
        }
    } catch (error) {
        console.error('Error finding matching questions:', error);
    }



    try {
      console.log('Creating session for user:', userId);
      console.log(`Selected ${selectedQuestions.length} questions for ${topics.length} topics`);
      
      const initialQuestion = selectedQuestions[0]?.question; // The first question to be asked
      let initialGreeting = '';
      
      try {
        initialGreeting = await this.interviewer.generateInitialGreeting({
            type: type as 'TECHNICAL' | 'HR',
            topics: [initialQuestion ? initialQuestion.topic : (topics.length > 0 ? topics[0] : domain)],
            difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD',
            role: 'Candidate'
        }, initialQuestion ? {
             title: initialQuestion.title,
             problemStatement: initialQuestion.problemStatement
        } : undefined);
      } catch (error) {
        console.warn('⚠️ AI Greeting Failed. Using Fallback.', error);
        // Fallback greeting that includes the question if available
        if (initialQuestion) {
            initialGreeting = `Hello! I'm Sarah, your AI interviewer. Let's dive right in. \n\nI'd like you to solve the following problem on **${initialQuestion.topic}**:\n\n# ${initialQuestion.title}\n\n${initialQuestion.problemStatement}\n\nPlease share your initial thoughts or lead with your approach.`;
        } else {
            initialGreeting = "Hello! I'm Sarah. I'll be conducting your technical interview today. To start, could you please introduce yourself and tell me a bit about your background?";
        }
      }

      // 5. Create Session in DB
      const result = await prisma.interviewSession.create({
        data: {
          userId,
          domain: prismaDomain,
          type: type as InterviewType,
          difficulty: (difficulty as Difficulty) || 'MEDIUM',
          topics: [initialQuestion ? initialQuestion.topic : (topics.length > 0 ? topics[0] : domain)],
          status: SessionStatus.IN_PROGRESS,
          messages: [
            {
              role: 'model',
              parts: [{ text: initialGreeting }]
            }
          ],
          startedAt: new Date(),
          // Initialize tracking metadata for question flow
          metadata: {
            totalQuestions: selectedQuestions.length,
            currentQuestionIndex: 0,
            counterQuestionCount: 0,
            questionIds: selectedQuestions.map(q => q.question.id)
          },
          questions: {
            create: selectedQuestions.map((q, idx) => ({
              questionId: q.question.id,
              order: idx,
              status: idx === 0 ? 'ASKED' : 'PENDING'
            }))
          }
        },
        include: {
          questions: {
            include: {
              question: true
            }
          }
        }
      });
      console.log('Session created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Prisma Create Session Error:', error);
      throw error;
    }
  }

  static async interact(sessionId: string, userId: string, message: string) {
    const session = await this.getSession(sessionId, userId);
    
    if (session.status !== SessionStatus.IN_PROGRESS && session.status !== SessionStatus.CREATED) {
      throw new AppError(400, 'Session is not active');
    }

    if (session.status === SessionStatus.CREATED) {
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.IN_PROGRESS, startedAt: new Date() }
      });
    }

    const history = (session.messages as Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>) || [];
    
    // INTERVIEW FLOW LOGIC
    // 1. Get current progress from metadata
    const metadata: { currentQuestionIndex: number; counterQuestionCount: number; totalQuestions: number; questionIds?: string[] } = {
      currentQuestionIndex: ((session.metadata as { currentQuestionIndex?: number })?.currentQuestionIndex) ?? 0,
      counterQuestionCount: ((session.metadata as { counterQuestionCount?: number })?.counterQuestionCount) ?? 0,
      totalQuestions: ((session.metadata as { totalQuestions?: number })?.totalQuestions) ?? (session.questions?.length || 1),
      questionIds: ((session.metadata as { questionIds?: string[] })?.questionIds) ?? []
    };

    // 2. Increment counters
    metadata.counterQuestionCount++;

    // 3. Check for transitions
    const COUNTER_QUESTION_LIMIT = 10; // Main question + approx 4-5 turns of follow-ups
    const flowContext: { nextQuestion?: { title: string; problemStatement: string; topic: string }; isInterviewComplete?: boolean } = {};
    let shouldUpdateStatus = false;

    // Logic: If user has answered enough follow-ups, move to next question
    // Note: We check if count > limit because the current user message counts as one
    if (metadata.counterQuestionCount >= COUNTER_QUESTION_LIMIT) {
       // Move to next question
       metadata.currentQuestionIndex++;
       metadata.counterQuestionCount = 0;

       // Check if we have more questions
       if (metadata.currentQuestionIndex < (session.questions?.length || 0)) {
           // Get next question details
           const nextQ = session.questions?.[metadata.currentQuestionIndex]?.question;
           if (nextQ) {
               flowContext.nextQuestion = {
                   title: nextQ.title,
                   problemStatement: nextQ.problemStatement,
                   topic: nextQ.topic
               };
               console.log(`Flow: Moving to next question: ${nextQ.title}`);
           }
       } else {
           // Interview Complete
           flowContext.isInterviewComplete = true;
           console.log('Flow: Interview complete');
           shouldUpdateStatus = true;
       }
    }

    const response = await this.interviewer.processInteraction(history as Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>, message, flowContext);

    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: response }] }
    ];
    
    // Check if AI actually finished the interview (detected via special token or flow)
    if (response.includes("INTERVIEW_FINISHED") || flowContext.isInterviewComplete) {
        shouldUpdateStatus = true;
    }

    const updateData: { messages: Array<{ role: string; parts: Array<{ text: string }> }>; metadata: typeof metadata; status?: SessionStatus; completedAt?: Date } = { 
        messages: updatedHistory,
        metadata: metadata 
    };

    // If interview is complete, auto-submit and evaluate
    if (shouldUpdateStatus) {
        updateData.status = SessionStatus.SUBMITTED;
        updateData.completedAt = new Date();
        
        // Use a background call to evaluate to avoid blocking interaction response
        // But for consistency with controller, we update status and let controller or next turn handle it?
        // Actually, let's trigger it directly here to ensure it happens.
        setTimeout(async () => {
            try {
                const { EvaluationService } = await import('./evaluation.service');
                await EvaluationService.evaluateSession(sessionId, userId);
                console.log(`Auto-evaluation completed for session: ${sessionId}`);
            } catch (err) {
                console.error(`Auto-evaluation failed for session: ${sessionId}`, err);
            }
        }, 100);
    }

    const result = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: updateData
    });

    // Ensure messages is an array in the return
    if (typeof result.messages === 'string') {
        try { result.messages = JSON.parse(result.messages); } catch { result.messages = []; }
    }
    return result;
  }

  static async getSession(id: string, userId: string, role?: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!session) throw new AppError(404, 'Session not found');
    if (role !== 'ADMIN' && session.userId !== userId) throw new AppError(403, 'Access denied');

    return session;
  }

  static async updateStatus(id: string, userId: string, status: SessionStatus, role?: string) {
    const session = await this.getSession(id, userId, role);
    
    const validTransitions: Record<SessionStatus, SessionStatus[]> = {
      [SessionStatus.CREATED]: [SessionStatus.IN_PROGRESS, SessionStatus.SUBMITTED],
      [SessionStatus.IN_PROGRESS]: [SessionStatus.SUBMITTED],
      [SessionStatus.SUBMITTED]: [SessionStatus.EVALUATED, SessionStatus.PENDING_REVIEW],
      [SessionStatus.EVALUATED]: [SessionStatus.COMPLETED, SessionStatus.REPORTED],
      [SessionStatus.REPORTED]: [SessionStatus.COMPLETED],
      [SessionStatus.COMPLETED]: [],
      [SessionStatus.PENDING_REVIEW]: [SessionStatus.EVALUATED, SessionStatus.REPORTED],
    };

    if (!validTransitions[session.status].includes(status)) {
      throw new AppError(400, `Invalid state transition from ${session.status} to ${status}`);
    }

    const updateData: { status: SessionStatus; startedAt?: Date; completedAt?: Date } = { status };
    if (status === SessionStatus.IN_PROGRESS && !session.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === SessionStatus.SUBMITTED) {
      updateData.completedAt = new Date();
    }

    return prisma.interviewSession.update({
      where: { id },
      data: updateData,
    });
  }

  static async submitAnswer(sessionId: string, userId: string, questionId: string, answer: string) {
    // Legacy support or specific code snippet saving
    return prisma.interviewQuestion.create({
      data: {
        sessionId,
        questionId,
        userAnswer: answer
      }
    });
  }

  static async getSessionsByUser(userId: string) {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

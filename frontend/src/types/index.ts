export interface Question {
  id: string;
  content: string;
  idealAnswer: string;
  keyConcepts: string;
  rubric: string;
  type: string;
  domain: string;
  difficulty: string;
}

export interface DomainStat {
  domain: string;
  averageScore: number;
}

export interface AdminAnalytics {
  totalStudents: number;
  totalInterviews: number;
  domainStats: DomainStat[];
}

export interface SessionQuestion {
  id: string;
  questionId: string;
  question: Question;
  userAnswer?: string;
  score?: number;
  evaluation?: string; // JSON string
}

export interface Session {
  id: string;
  domain: string;
  difficulty: string;
  questions: SessionQuestion[];
  score?: number;
  feedback?: string;
  status: string;
}


export interface EvaluationData {
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
}

export interface PerformanceStats {
  totalInterviews: number;
  inProgressCount: number;
  averageScore: number;
  weakestDomain: string;
}

export interface Recommendation {
    domain: string;
    difficulty: string;
    reason: string;
}

export interface WeakConcept {
    concept: string;
    score: number;
}

export interface SessionHistory {
    id: string;
    date: string;
    type: string;
    domain: string;
    difficulty: string;
    score: number | null;
    status: string;
}

export interface StudentAnalytics {
    performance: PerformanceStats;
    recommendation: Recommendation;
    weakConcepts: WeakConcept[];
    history: SessionHistory[];
}

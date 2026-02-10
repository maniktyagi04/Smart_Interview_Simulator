import prisma from '../lib/prisma';


export class AnalyticsService {
  static async getStudentAnalytics(userId: string) {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId }, // Fetch all to show history
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Latest first
    });

    const evaluatedSessions = sessions.filter(s => s.status === 'EVALUATED' || s.status === 'COMPLETED');
    
    // 1. Performance Overview
    const totalInterviews = sessions.length;
    const averageScore = evaluatedSessions.length > 0
      ? evaluatedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / evaluatedSessions.length
      : 0;

    // 2. Domain Analysis
    const domainStats: Record<string, { total: number; count: number }> = {};
    evaluatedSessions.forEach(s => {
      if (!domainStats[s.domain]) domainStats[s.domain] = { total: 0, count: 0 };
      domainStats[s.domain].total += (s.score || 0);
      domainStats[s.domain].count += 1;
    });

    let bestDomain = { name: 'N/A', score: 0 };
    let weakestDomain = { name: 'N/A', score: 100 };

    Object.entries(domainStats).forEach(([domain, stats]) => {
      const avg = stats.total / stats.count;
      if (avg > bestDomain.score) bestDomain = { name: domain, score: avg };
      if (avg < weakestDomain.score) weakestDomain = { name: domain, score: avg };
    });
    
    if (Object.keys(domainStats).length === 0) weakestDomain = { name: 'N/A', score: 0 };

    // 3. Concept Analysis (Weak Concepts)
    const conceptStats: Record<string, { total: number; count: number }> = {};
    
    evaluatedSessions.forEach(session => {
        session.questions.forEach(iq => {
            if (iq.score !== null && iq.question.keyConcepts) {
                // keyConcepts might be comma-separated or JSON
                const concepts = iq.question.keyConcepts.split(',').map(c => c.trim());
                concepts.forEach(concept => {
                    if (!conceptStats[concept]) conceptStats[concept] = { total: 0, count: 0 };
                    conceptStats[concept].total += iq.score || 0;
                    conceptStats[concept].count += 1;
                });
            }
        });
    });

    const weakConcepts = Object.entries(conceptStats)
        .map(([concept, stats]) => ({ concept, score: stats.total / stats.count }))
        .sort((a, b) => a.score - b.score) // Ascending (weakest first)
        .slice(0, 5); // Bottom 5

    // 4. Score Trend (Last 10)
    const recentTrend = evaluatedSessions
        .slice(0, 10)
        .reverse() // Oldest to newest for graph
        .map(s => ({
            date: s.createdAt.toISOString().split('T')[0],
            score: Math.round(s.score || 0)
        }));

    // 5. Recent Interviews Table Data
    const history = sessions.slice(0, 10).map(s => ({
        id: s.id,
        date: s.createdAt,
        type: s.type,
        domain: s.domain,
        difficulty: s.difficulty,
        score: s.score,
        status: s.status,
    }));

    // 6. Recommendation Logic
    const topWeakConcept = weakConcepts.length > 0 ? weakConcepts[0].concept : null;
    let recommendationReason = 'Start your first interview to get a baseline.';
    
    if (topWeakConcept) {
        recommendationReason = `Recommended because you scored low in ${topWeakConcept} in recent sessions.`;
    } else if (weakestDomain.name !== 'N/A') {
        recommendationReason = `Improve your ${weakestDomain.name} skills to raise your average.`;
    }

    const inProgressCount = sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'CREATED').length;
    const completedCount = evaluatedSessions.length;

    // --- ADVANCED METRICS CALCULATION ---

    // 1. Success Rate
    const passingSessions = evaluatedSessions.filter(s => (s.score || 0) >= 70); // Assuming 70 is 'Hire' threshold
    const successRate = totalInterviews > 0 ? (passingSessions.length / totalInterviews) * 100 : 0;

    // 2. Readiness Growth (Simple linear regression slope or last vs avg)
    let growthRate = 0;
    if (evaluatedSessions.length >= 2) {
        // Simple comparison: Avg of last 3 vs Avg of first 3
        const sortedByDate = [...evaluatedSessions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const recent = sortedByDate.slice(-3);
        const initial = sortedByDate.slice(0, 3);
        
        const recentAvg = recent.reduce((sum, s) => sum + (s.score || 0), 0) / recent.length;
        const initialAvg = initial.reduce((sum, s) => sum + (s.score || 0), 0) / initial.length;
        
        growthRate = initialAvg > 0 ? ((recentAvg - initialAvg) / initialAvg) * 100 : 0;
    }

    // 3. Consistency Index (1 - normalized standard deviation)
    let consistencyIndex = 0; // Default to 0 for new students
    if (evaluatedSessions.length > 1) {
        const scores = evaluatedSessions.map(s => s.score || 0);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);
        // Normalize stdDev relative to mean (CV), capped at 1
        // Lower CV = Higher Consistency
        const cv = mean > 0 ? stdDev / mean : 0;
        consistencyIndex = Math.max(0, 1 - cv); // Simple index
    }

    // 4. Peer Percentile (Mocked/Estimated for now)
    // In real app, would fetch global distribution.
    // Logic: If avg > 80 => Top 10%, > 70 => Top 30%, etc.
    // Default to 0 for students with no evaluated sessions
    let peerPercentile = 0;
    if (evaluatedSessions.length > 0) {
        if (averageScore >= 90) peerPercentile = 95;
        else if (averageScore >= 80) peerPercentile = 85;
        else if (averageScore >= 70) peerPercentile = 70;
        else if (averageScore >= 60) peerPercentile = 50;
        else peerPercentile = 30;
    }

    // 5. Skill Breakdown (Aggregate from Feedback JSON if available)
    const skillStats: Record<string, { total: number, count: number, history: number[] }> = {};
    
    evaluatedSessions.forEach(session => {
        if (session.feedback) {
            try {
                const feedback = JSON.parse(session.feedback);
                if (feedback.skills) {
                    Object.entries(feedback.skills).forEach(([skill, data]) => {
                        const skillData = data as { score: number };
                        if (!skillStats[skill]) skillStats[skill] = { total: 0, count: 0, history: [] };
                        skillStats[skill].total += skillData.score;
                        skillStats[skill].count += 1;
                        skillStats[skill].history.push(skillData.score);
                    });
                }
            } catch {
                // Ignore parse errors
            }
        }
    });

    const skillBreakdown = Object.entries(skillStats).map(([skill, data]) => {
        const avg = data.total / data.count;
        
        // Trend
        const recent = data.history.slice(-3);
        const isImproving = recent.length > 1 && recent[recent.length - 1] > recent[0];
        
        // Stability
        const skillMean = avg;
        const skillVariance = data.history.reduce((a, b) => a + Math.pow(b - skillMean, 2), 0) / data.count;
        const skillStdDev = Math.sqrt(skillVariance);
        const stability = skillStdDev < 10 ? 'High' : skillStdDev < 20 ? 'Medium' : 'Low';

        return {
            skill: skill.replace(/([A-Z])/g, ' $1').trim(), // CamelCase to Title Case
            score: Math.round(avg),
            trend: isImproving ? 'Improving' : 'Stable',
            stability,
            insight: isImproving ? 'Consistent upward trajectory observed.' : 'Performance is stabilizing.',
        };
    });

    // 6. Performance Patterns
    const patterns = {
        consistentStrength: skillBreakdown.length > 0 ? skillBreakdown.reduce((prev, curr) => prev.score > curr.score ? prev : curr).skill : 'N/A',
        recurringWeakness: skillBreakdown.length > 0 ? skillBreakdown.reduce((prev, curr) => prev.score < curr.score ? prev : curr).skill : 'N/A',
        fastestImproving: 'Problem Solving', // Placeholder logic 
        highestRisk: weakestDomain.name // Using domain fallback
    };


    return {
      performance: {
          totalInterviews,
          averageScore: Math.round(averageScore),
          successRate: Math.round(successRate),
          growthRate: Math.round(growthRate),
          consistencyIndex: parseFloat(consistencyIndex.toFixed(2)),
          peerPercentile,
          inProgressCount,
          completedCount
      },
      skills: skillBreakdown,
      patterns,
      weakConcepts,
      trend: recentTrend,
      history,
      recommendation: {
          domain: weakestDomain.name !== 'N/A' ? weakestDomain.name : 'DSA',
          difficulty: 'MEDIUM',
          reason: recommendationReason,
      }
    };
  }

  static async getAdminAnalytics() {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalInterviews = await prisma.interviewSession.count();
    const domainStats = await prisma.interviewSession.groupBy({
      by: ['domain'],
      _count: { _all: true },
      _avg: { score: true },
    });

    const overallAvg = await prisma.interviewSession.aggregate({
      _avg: { score: true }
    });

    return {
      totalStudents,
      totalInterviews,
      averageScore: Math.round(overallAvg._avg.score || 0),
      domainStats: domainStats.map(s => ({
        domain: s.domain,
        count: s._count._all,
        averageScore: Math.round(s._avg.score || 0),
      })),
    };
  }

  static async getAllStudents() {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        scheduledInterview: true,
        createdAt: true,
        _count: {
          select: { sessions: true }
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    return students.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      interviews: s._count?.sessions || 0,
      studentId: s.id.substring(0, 5).toUpperCase(),
      status: (s.status || 'ACTIVE').toLowerCase(),
      scheduledInterview: s.scheduledInterview,
      lastActive: s.createdAt
    }));
  }

  static async getAllSessions() {
    const sessions = await prisma.interviewSession.findMany({
      include: {
        user: {
          select: { name: true }
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    return sessions.map(s => ({
      id: s.id,
      candidate: s.user.name,
      studentName: s.user.name, // Matches frontend
      evaluator: 'AI System',
      type: s.domain,
      domain: s.domain, // Matches frontend
      outcome: s.status === 'EVALUATED' || s.status === 'COMPLETED' ? (s.score && s.score >= 70 ? 'Pass' : 'Fail') : 'In Progress',
      difficulty: s.difficulty,
      result: {
        status: s.status === 'EVALUATED' || s.status === 'COMPLETED' ? (s.score && s.score >= 70 ? 'Pass' : 'Fail') : 'Pending',
        color: s.status === 'EVALUATED' || s.status === 'COMPLETED' ? (s.score && s.score >= 70 ? 'green' : 'red') : 'yellow'
      },
      duration: 'N/A',
      status: s.status,
      score: s.score,
      feedback: s.feedback,
      date: s.createdAt,
      createdAt: s.createdAt // Matches frontend
    }));
  }
}

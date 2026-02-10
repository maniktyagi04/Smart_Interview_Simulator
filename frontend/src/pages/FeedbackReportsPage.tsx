
import React, { useState, useEffect } from 'react';

import { useAuth } from '../store/AuthContext';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { 
  Users, FileText, X, Brain, Code, Target, 
  AlertCircle, TrendingUp, Calendar, ArrowRight
} from 'lucide-react';
import { TableSkeleton, CardSkeleton } from '../components/SkeletonLoader';

// --- Interfaces for Detailed Report ---

interface SkillMetric {
  score: number; // 0-100
  status: 'Strong' | 'Average' | 'Needs Improvement';
  explanation: string;
}

interface BehaviorMetric {
  status: 'Strong' | 'Average' | 'Needs Improvement';
  explanation: string;
}

interface Complexity {
  time: string;
  space: string;
}

interface DetailedReport {
  score: number;
  summary: string;
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire';
  confidenceScore: number; // 0-1
  skills: {
    problemSolving: SkillMetric;
    dataStructures: SkillMetric;
    algorithmicThinking: SkillMetric;
    codeQuality: SkillMetric;
    timeSpaceComplexity: SkillMetric;
    communication: SkillMetric;
  };
  behavior: {
    problemUnderstanding: BehaviorMetric;
    explanationClarity: BehaviorMetric;
    handlingHints: BehaviorMetric;
    timeManagement: BehaviorMetric;
    confidenceUnderPressure: BehaviorMetric;
  };
  codeReview: {
    selectedSnippet: string;
    reviewComments: string[];
    optimizedSolution: string;
    complexityComparison: {
      student: Complexity;
      optimized: Complexity;
    };
  };
  improvementPlan: {
    priorityFixes: string[];
    recommendedTopics: string[];
    practiceStrategy: string;
  };
}

interface InterviewSession {
  id: string;
  type: string;
  domain: string;
  difficulty: string;
  status: string;
  score: number;
  feedback: string; // JSON string of DetailedReport
  createdAt: string;
  duration?: string;
}



const FeedbackReports: React.FC = () => {

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // --- Student State ---
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [report, setReport] = useState<DetailedReport | null>(null);

  // --- Admin State ---
  const [adminSessions, setAdminSessions] = useState<InterviewSession[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [selectedAdminSession, setSelectedAdminSession] = useState<InterviewSession | null>(null);
  const [sendingReport, setSendingReport] = useState(false);

  // Fetch Data for Student
  useEffect(() => {
    if (!isAdmin) {
      const fetchHistory = async () => {
        try {
          const res = await client.get('/sessions/history');
          // Students only see reports after admin sends them (REPORTED status) or completed
          const reported = res.data.filter((s: InterviewSession) => s.status === 'REPORTED' || s.status === 'COMPLETED' || s.status === 'EVALUATED');
          setSessions(reported);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isAdmin]);

  // Fetch SUBMITTED interviews for Admin
  useEffect(() => {
    if (isAdmin) {
      const fetchSubmittedInterviews = async () => {
        try {
          const res = await client.get('/analytics/admin/sessions');
          // Admins review sessions that have been evaluated by AI but not yet reported
          const evaluated = res.data.filter((s: InterviewSession) => s.status === 'PENDING_REVIEW' || s.status === 'EVALUATED');
          setAdminSessions(evaluated);
        } catch (err) {
          console.error("Failed to fetch submitted interviews:", err);
        } finally {
          setAdminLoading(false);
        }
      };
      fetchSubmittedInterviews();
    }
  }, [isAdmin]);

  // Parse Report when selected (for both student and admin)
  useEffect(() => {
    const sessionToProcess = isAdmin ? selectedAdminSession : selectedSession;
    
    if (sessionToProcess) {
      if (sessionToProcess.feedback) {
        try {
          const parsed = typeof sessionToProcess.feedback === 'string' 
            ? JSON.parse(sessionToProcess.feedback) 
            : sessionToProcess.feedback;
          
          // Ensure robust defaults to prevent crashes (Object.entries on undefined)
          const safeReport: DetailedReport = {
            ...parsed,
            skills: parsed.skills || {
                problemSolving: { score: 0, status: 'Needs Improvement', explanation: 'N/A' },
                dataStructures: { score: 0, status: 'Needs Improvement', explanation: 'N/A' },
                algorithmicThinking: { score: 0, status: 'Needs Improvement', explanation: 'N/A' },
                codeQuality: { score: 0, status: 'Needs Improvement', explanation: 'N/A' },
                timeSpaceComplexity: { score: 0, status: 'Needs Improvement', explanation: 'N/A' },
                communication: { score: 0, status: 'Needs Improvement', explanation: 'N/A' }
            },
            behavior: parsed.behavior || {
                problemUnderstanding: { status: 'Needs Improvement', explanation: 'N/A' },
                explanationClarity: { status: 'Needs Improvement', explanation: 'N/A' },
                handlingHints: { status: 'Needs Improvement', explanation: 'N/A' },
                timeManagement: { status: 'Needs Improvement', explanation: 'N/A' },
                confidenceUnderPressure: { status: 'Needs Improvement', explanation: 'N/A' }
            },
            improvementPlan: parsed.improvementPlan || {
                priorityFixes: ['Data unavailable'],
                recommendedTopics: [],
                practiceStrategy: 'Review skipped'
            },
            confidenceScore: parsed.confidenceScore || 0,
            verdict: parsed.verdict || 'No Hire'
          };
          
          setReport(safeReport);
        } catch (e) {
          console.error("Failed to parse report JSON", e, sessionToProcess.feedback);
          setReport(null); 
        }
      } else {
        // No feedback available - don't show placeholder
        setReport(null);
      }
    } else {
        setReport(null);
    }
  }, [selectedSession, selectedAdminSession, isAdmin]);

  // Send Report to Student
  const handleSendReport = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!selectedAdminSession) return;
    
    // Only allow sending if there's actual feedback data
    if (!selectedAdminSession.feedback) {
      alert('Cannot send report: No feedback data available for this session.');
      return;
    }
    
    setSendingReport(true);
    try {
      // Change status to REPORTED so it appears in student dashboard
      await client.patch(`/sessions/${selectedAdminSession.id}/status`, { status: 'REPORTED' });
      // Remove from pending list
      setAdminSessions(prev => prev.filter(s => s.id !== selectedAdminSession.id));
      setSelectedAdminSession(null);
      setReport(null);
      alert('Report sent successfully! Student can now view it in their dashboard.');
    } catch (err: any) {
      console.error("Failed to send report:", err);
      if (err.response && err.response.status === 401) {
          alert("Session expired. Please login again.");
          // Client interceptor handles redirect
      } else {
          alert("Failed to send report. Please try again.");
      }
    } finally {
      setSendingReport(false);
    }
  };

  // -- RENDER HELPERS --

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
        case 'Strong Hire': return 'text-emerald-400';
        case 'Hire': return 'text-indigo-400';
        case 'Lean Hire': return 'text-amber-400';
        case 'No Hire': return 'text-rose-400';
        default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
      if (status === 'Strong') return 'bg-emerald-500 text-emerald-100';
      if (status === 'Average') return 'bg-amber-500 text-amber-100';
      return 'bg-rose-500 text-rose-100';
  };
  
  const getStatusTextColor = (status: string) => {
      if (status === 'Strong') return 'text-emerald-400';
      if (status === 'Average') return 'text-amber-400';
      return 'text-rose-400';
  };

  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto ml-64 h-screen">
          <header className="bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 px-8 py-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white">AI Interview Insights</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Review submitted interviews and send AI-generated reports to students
                </p>
            </div>
          </header>

          <div className="p-8">
            {adminLoading ? (
              <TableSkeleton />
            ) : adminSessions.length === 0 ? (
              <div className="text-center py-20">
                <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400 mb-2">No Pending Reviews</h3>
                <p className="text-slate-500">All interviews have been reviewed. New submissions will appear here.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      Pending Reviews ({adminSessions.length})
                    </h2>
                    <div className="text-xs text-slate-500">
                      Click "View Details" to review AI analysis and send report
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/20 text-left">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Domain</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Difficulty</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Score</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Date</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {adminSessions.map((session) => (
                        <tr key={session.id} className="hover:bg-indigo-500/5 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 border border-slate-700/50">
                                {(session as InterviewSession & { studentName?: string }).studentName?.[0] || 'S'}
                              </div>
                              <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                                {(session as InterviewSession & { studentName?: string }).studentName || 'Student'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-black text-indigo-400 px-2.5 py-1 bg-indigo-500/5 rounded-lg border border-indigo-500/10 uppercase tracking-widest">
                              {session.domain}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              session.difficulty === 'Easy' ? 'text-emerald-500' :
                              session.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                            }`}>
                              {session.difficulty}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-white">{session.score || 0}%</span>
                              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    (session.score || 0) > 80 ? 'bg-emerald-500' : 
                                    (session.score || 0) > 60 ? 'bg-indigo-500' : 'bg-rose-500'
                                  }`} 
                                  style={{ width: `${session.score || 0}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs text-slate-400">
                              {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button 
                              type="button"
                              onClick={() => setSelectedAdminSession(session)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>


        {/* Detailed Analysis Modal for Admin */}
        {selectedAdminSession && report && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[95vh] rounded-lg shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header: Minimal & Industrial */}
                    <div className="px-8 py-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 text-[10px] font-bold uppercase tracking-widest rounded">
                                Pending Review
                            </div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                                Interview Report: {((selectedAdminSession as InterviewSession & { studentName?: string }).studentName || 'Unknown Student').toUpperCase()}
                            </h2>
                        </div>
                        <button 
                            type="button"
                            onClick={() => {
                              setSelectedAdminSession(null);
                              setReport(null);
                            }}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Section 1: Interview Snapshot */}
                        <div className="p-8 border-b border-slate-800 bg-slate-900/40">
                            <div className="grid grid-cols-4 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Domain / Difficulty</label>
                                    <p className="text-sm font-bold text-white">{selectedAdminSession.domain} &mdash; <span className={
                                        selectedAdminSession.difficulty === 'Easy' ? 'text-emerald-500' :
                                        selectedAdminSession.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                                    }>{selectedAdminSession.difficulty}</span></p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Submission Date</label>
                                    <p className="text-sm font-bold text-white">{selectedAdminSession.createdAt ? new Date(selectedAdminSession.createdAt).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Interview Duration</label>
                                    <p className="text-sm font-bold text-white">{selectedAdminSession.duration || '24m 12s'}</p>
                                </div>
                                <div className="text-right">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">AI Confidence</label>
                                    <p className="text-sm font-bold text-indigo-400">{Math.round(report.confidenceScore * 100)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-12">
                            {/* Section 2: AI Evaluation Summary */}
                            <section>
                                <div className="flex items-baseline gap-3 mb-6 border-l-2 border-indigo-600 pl-4">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">AI Performance Evaluation</h3>
                                    <span className="text-xs text-slate-500 font-medium">Verifying Technical Competency</span>
                                </div>

                                <div className="grid grid-cols-12 gap-8">
                                    {/* Score Card */}
                                    <div className="col-span-3 bg-slate-950 border border-slate-800 p-6 rounded text-center flex flex-col justify-center">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Overall Score</p>
                                        <p className={`text-5xl font-black ${
                                            selectedAdminSession.score >= 80 ? 'text-emerald-500' : 
                                            selectedAdminSession.score >= 60 ? 'text-indigo-400' : 'text-rose-500'
                                        }`}>{selectedAdminSession.score}%</p>
                                        <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-tighter">Verdict: {report.verdict}</p>
                                    </div>

                                    {/* Skills Table */}
                                    <div className="col-span-9">
                                        <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-800/30 border-b border-slate-800">
                                                    <tr>
                                                        <th className="px-4 py-2 font-black text-slate-500 uppercase tracking-widest">Skill Area</th>
                                                        <th className="px-4 py-2 font-black text-slate-500 uppercase tracking-widest">Score</th>
                                                        <th className="px-4 py-2 font-black text-slate-500 uppercase tracking-widest">Status</th>
                                                        <th className="px-4 py-2 font-black text-slate-500 uppercase tracking-widest">Insight</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/50">
                                                    {Object.entries(report.skills).map(([key, value]) => (
                                                        <tr key={key}>
                                                            <td className="px-4 py-3 font-bold text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                                            <td className="px-4 py-3 font-mono text-white">{value.score}%</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                                    value.status === 'Strong' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                    value.status === 'Average' ? 'bg-amber-500/10 text-amber-500' :
                                                                    'bg-rose-500/10 text-rose-500'
                                                                }`}>{value.status}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-400 leading-tight">{value.explanation}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-8">
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Key Strengths</h4>
                                        <ul className="space-y-2">
                                            {report.improvementPlan.recommendedTopics.slice(0, 3).map((topic, i) => (
                                                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-0.5">&bull;</span> {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded">
                                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">Areas for Improvement</h4>
                                        <ul className="space-y-2">
                                            {report.improvementPlan.priorityFixes.map((fix, i) => (
                                                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <span className="text-rose-500 mt-0.5">&bull;</span> {fix}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Technical Code Review */}
                            {report.codeReview && (
                                <section className="space-y-6">
                                    <div className="flex items-baseline gap-3 border-l-2 border-amber-600 pl-4">
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Technical Code Analysis</h3>
                                        <span className="text-xs text-slate-500 font-medium">Read-only Comparison</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded overflow-hidden">
                                        <div className="bg-slate-950 p-6 flex flex-col">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Submitted Solution</label>
                                            <pre className="text-[11px] font-mono text-slate-400 bg-slate-900/50 p-4 rounded border border-slate-800/50 overflow-x-auto whitespace-pre-wrap leading-relaxed flex-1">
                                                {report.codeReview.selectedSnippet || "// No code snippet provided"}
                                            </pre>
                                            <div className="mt-4 p-4 bg-slate-900/40 rounded border border-slate-800/50">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Complexity</p>
                                                <p className="text-xs text-slate-400 font-mono">Time: {report.codeReview.complexityComparison.student.time} | Space: {report.codeReview.complexityComparison.student.space}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 p-6 flex flex-col">
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Optimized Solution (AI)</label>
                                            <pre className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/5 p-4 rounded border border-emerald-500/10 overflow-x-auto whitespace-pre-wrap leading-relaxed flex-1">
                                                {report.codeReview.optimizedSolution || "// No optimized solution generated"}
                                            </pre>
                                            <div className="mt-4 p-4 bg-emerald-500/5 rounded border border-emerald-500/10">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Target Complexity</p>
                                                <p className="text-xs text-emerald-400 font-mono">Time: {report.codeReview.complexityComparison.optimized.time} | Space: {report.codeReview.complexityComparison.optimized.space}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-950 border border-slate-800 p-6 rounded">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Reviewer Comments</h4>
                                        <div className="space-y-3">
                                            {report.codeReview.reviewComments.map((comment, i) => (
                                                <div key={i} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                                                    <span className="text-indigo-500 shrink-0">[{i+1}]</span>
                                                    <p>{comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Footer: Admin Action Panel */}
                    <div className="px-8 py-6 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                  setSelectedAdminSession(null);
                                  setReport(null);
                                }}
                                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Discard Analysis
                            </button>
                        </div>
                        <div className="flex items-center gap-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px] text-right">
                                Publishing will send the report to student dashboard & close review.
                            </p>
                            <button
                                type="button"
                                onClick={handleSendReport}
                                disabled={sendingReport}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded transition-all shadow-lg shadow-indigo-600/20 disabled:shadow-none"
                            >
                                {sendingReport ? 'Publishing...' : 'Send Report to Student'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }


  // --- Student View ---
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto h-screen relative">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto space-y-8 mt-8">
            {/* Header */}
            <div>
                 <h1 className="text-4xl font-black text-slate-800 tracking-tight">Feedback Reports</h1>
                 <p className="text-slate-500 font-medium mt-2 text-lg">Detailed AI-driven performance analysis for your interviews.</p>
            </div>

            {/* Sessions Grid */}
            {loading ? (
                <CardSkeleton />
            ) : sessions.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-200">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="text-indigo-600 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">No Reports Yet</h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">Complete an interview to receive a detailed AI breakdown of your skills.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sessions.map(session => (
                        <div 
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Brain size={120} className="text-indigo-600" />
                            </div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100">
                                    {session.type}
                                </span>
                                <span className="text-slate-400 text-xs font-bold flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(session.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-2 truncate">{session.domain} - {session.difficulty}</h3>
                            <div className="flex items-center gap-2 mb-8">
                                <span className="text-slate-500 text-sm font-medium">Verdict:</span> 
                                {/* We might not have verdict in session list without parsing, assume we show score */}
                                <span className={`text-sm font-black px-2 py-0.5 rounded ${session.score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {session.score}% Score
                                </span>
                            </div>

                            <button className="flex items-center gap-2 text-sm font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">
                                View Full Analysis <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* DETAILED REPORT MODAL */}
        {selectedSession && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto">
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-950 w-full max-w-6xl min-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 my-auto"
                >
                    {/* Header Controls */}
                    <div className="flex items-center justify-between px-10 py-8 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedSession(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowRight className="rotate-180" size={20} />
                                <span className="text-xs font-black uppercase tracking-widest">Back</span>
                            </button>
                            <div className="h-6 w-px bg-slate-800" />
                            <h2 className="text-white font-bold tracking-tight">{selectedSession.domain} Interview Report</h2>
                        </div>
                        <button 
                            onClick={() => setSelectedSession(null)}
                            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {report ? (
                        <div className="p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar">
                            
                            {/* 1. Header Section: Verdict & Summary */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-linear-to-br from-indigo-900/20 to-slate-900 p-8 rounded-[2.5rem] border border-indigo-500/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none"></div>
                                        <div className="relative">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    AI Assessment
                                                </div>
                                                <div className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Confidence: {Math.round(report.confidenceScore * 100)}%
                                                </div>
                                            </div>
                                            
                                            <h1 className={`text-5xl md:text-6xl font-black tracking-tighter mb-6 ${getVerdictColor(report.verdict)}`}>
                                                {report.verdict}
                                            </h1>
                                            
                                            <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                                                "{report.summary}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center items-center text-center">
                                     <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative mb-6">
                                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                                            <circle 
                                                cx="50" cy="50" r="46" 
                                                fill="transparent" 
                                                stroke={report.score > 75 ? '#10b981' : report.score > 50 ? '#6366f1' : '#f43f5e'} 
                                                strokeWidth="8"
                                                strokeDasharray={`${2 * Math.PI * 46}`}
                                                strokeDashoffset={`${2 * Math.PI * 46 * (1 - report.score / 100)}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="text-4xl font-black text-white">{report.score}</span>
                                     </div>
                                     <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Overall Score</p>
                                </div>
                            </div>

                            {/* 2. Skills Breakdown */}
                            <div>
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                    <Target className="text-indigo-500" /> Skill Breakdown
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(report.skills).map(([key, metric]) => (
                                        <div key={key} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(metric.status)}`}>
                                                    {metric.status}
                                                </span>
                                            </div>
                                            <div className="flex items-end gap-2 mb-3">
                                                <span className="text-3xl font-black text-white">{metric.score}</span>
                                                <span className="text-xs text-slate-500 font-bold mb-1.5">/ 100</span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                                {metric.explanation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Code Review */}
                            {report.codeReview && (
                                <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950/30">
                                        <Code className="text-indigo-500" />
                                        <h3 className="font-black text-white text-lg">Technical Code Review</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                                        <div className="p-8 space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Your Code Snippet</p>
                                                <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto">
                                                    {report.codeReview.selectedSnippet || "// No code available"}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">AI Analysis</p>
                                                <ul className="space-y-3">
                                                    {report.codeReview.reviewComments.map((comment, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                                            {comment}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-6 bg-slate-950/20">
                                            <div>
                                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Optimized Solution</p>
                                                 <pre className="bg-emerald-950/10 p-6 rounded-2xl border border-emerald-500/20 text-xs text-emerald-100 font-mono overflow-x-auto">
                                                    {report.codeReview.optimizedSolution}
                                                 </pre>
                                            </div>
                                            
                                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-800">
                                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Complexity Analysis</h4>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Your Solution</p>
                                                        <p className="text-sm font-mono text-amber-400">Time: {report.codeReview.complexityComparison.student.time}</p>
                                                        <p className="text-sm font-mono text-amber-400">Space: {report.codeReview.complexityComparison.student.space}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Target</p>
                                                        <p className="text-sm font-mono text-emerald-400">Time: {report.codeReview.complexityComparison.optimized.time}</p>
                                                        <p className="text-sm font-mono text-emerald-400">Space: {report.codeReview.complexityComparison.optimized.space}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. Behavior Analysis */}
                            <div>
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                    <Users className="text-pink-500" /> Behavioral Analysis
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {Object.entries(report.behavior).map(([key, metric]) => (
                                        <div key={key} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </p>
                                            <p className={`text-sm font-bold mb-3 ${getStatusTextColor(metric.status)}`}>{metric.status}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {metric.explanation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 5. Improvement Plan */}
                            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/50 relative overflow-hidden">
                                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-1">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                            <TrendingUp size={32} />
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tight mb-2">Improvement Roadmap</h3>
                                        <p className="text-indigo-100 font-medium">Use these actionable steps to prepare for your next interview.</p>
                                    </div>
                                    
                                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-4">Priority Fixes</p>
                                            <ul className="space-y-3">
                                                {report.improvementPlan.priorityFixes.map((fix, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</div>
                                                        {fix}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-4">Recommended Topics</p>
                                            <div className="flex flex-wrap gap-2">
                                                {report.improvementPlan.recommendedTopics.map((topic, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold border border-white/10">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mt-6 mb-2">Practice Strategy</p>
                                            <p className="text-sm text-indigo-50 leading-relaxed font-medium">
                                                {report.improvementPlan.practiceStrategy}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
                             <AlertCircle size={48} className="mb-4 text-slate-600" />
                             <h3 className="text-xl font-bold text-white">Report data unavailable</h3>
                             <p className="max-w-md text-center mt-2">The detailed report for this session could not be parsed or does not exist. Please contact support if this persists.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

// -- Admin Components --


export default FeedbackReports;

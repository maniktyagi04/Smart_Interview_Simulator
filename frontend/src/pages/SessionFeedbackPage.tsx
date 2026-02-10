import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Navbar from '../components/Navbar';
import { CheckCircle2, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import type { Session, SessionQuestion, EvaluationData } from '../types';

const SessionFeedbackPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await client.get(`/sessions/${id}`);
        setSession(res.data);
      } catch (error) {
        console.error('Failed to fetch session', error);
      }
    };

    if (id) {
        fetchSession();
    }
  }, [id]);

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Feedback...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Global Score Card */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-10 mb-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-40 h-40 text-indigo-500" />
          </div>
          
          <h1 className="text-slate-400 font-medium mb-4 uppercase tracking-widest text-sm">Overall Performance</h1>
          <div className="text-7xl font-black text-white mb-4">
            {Math.round(session.score || 0)}%
          </div>
          <p className="text-indigo-300 text-lg max-w-md mx-auto">
            {session.feedback}
          </p>
        </div>

        {/* Question Breakdown */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500 w-6 h-6" />
          Question Breakdown
        </h2>

        <div className="space-y-6">
          {session.questions.map((sq: SessionQuestion, idx: number) => {
            const evalData: EvaluationData | null = sq.evaluation ? JSON.parse(sq.evaluation) : null;
            return (
              <div key={sq.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1 block">Question {idx + 1}</span>
                    <h3 className="text-lg font-semibold text-white leading-tight">{sq.question.content}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-400">{sq.score || 0}%</div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/20 space-y-6">
                  {/* Answer Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Your Answer</h4>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed h-full">
                        {sq.userAnswer || <span className="italic opacity-50">No answer provided.</span>}
                      </p>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-emerald-500">Ideal Answer Guide</h4>
                      <p className="text-slate-300 text-sm italic leading-relaxed">
                        {sq.question.idealAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Feedback Details */}
                  {evalData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Strengths
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                          {evalData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                          {evalData.strengths.length === 0 && <li>Good attempt.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Weaknesses
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                          {evalData.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                          {evalData.weaknesses.length === 0 && <li>None significant identified.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Tips
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                          {evalData.improvementTips.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default SessionFeedbackPage;

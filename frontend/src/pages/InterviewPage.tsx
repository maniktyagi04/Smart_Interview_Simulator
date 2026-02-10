import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Navbar from '../components/Navbar';
import { Send, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import type { SessionQuestion } from '../types';

interface Session {
  id: string;
  domain: string;
  difficulty: string;
  questions: SessionQuestion[];
}

const InterviewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes total
  const [saving, setSaving] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await client.get(`/sessions/${id}`);
      setSession(res.data);
      // Initialize internal answers state
      const initialAnswers: Record<string, string> = {};
      res.data.questions.forEach((q: SessionQuestion) => {
        initialAnswers[q.questionId] = q.userAnswer || '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Failed to fetch session', error);
      navigate('/dashboard');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSession();
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [fetchSession]);

  const currentQuestion = session?.questions[currentIdx];

  const handleAnswerChange = (val: string) => {
    if (currentQuestion) {
      setAnswers({ ...answers, [currentQuestion.questionId]: val });
    }
  };

  const saveCurrentAnswer = async () => {
    if (!currentQuestion || !id) return;
    setSaving(true);
    try {
      await client.post(`/sessions/${id}/answer`, {
        questionId: currentQuestion.questionId,
        answer: answers[currentQuestion.questionId]
      });
    } catch {
      console.error('Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveCurrentAnswer();
    if (session && currentIdx < (session.questions.length - 1)) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIdx(currentIdx - 1);
  };

  const handleSubmit = async () => {
    await saveCurrentAnswer();
    if (confirm('Are you sure you want to submit your interview?')) {
      try {
        await client.patch(`/sessions/${id}/status`, { status: 'SUBMITTED' });
        // Redirect to dashboard instead of feedback page
        navigate('/dashboard');
      } catch {
        alert('Failed to submit interview');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Simulator...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col">
        {/* Header: Progress & Timer */}
        <div className="flex items-center justify-between mb-8 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-400">Question {currentIdx + 1} of {session.questions.length}</span>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${((currentIdx + 1) / session.questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-amber-500 font-mono font-bold">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {session.domain.replace('_', ' ')} • {session.difficulty}
            </span>
            <h2 className="text-2xl font-bold mt-4 leading-relaxed">
              {currentQuestion?.question.content}
            </h2>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-slate-400 mb-2">Your Answer</label>
            <textarea
              className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
              placeholder="Type your answer here... Be detailed and clear."
              value={currentQuestion ? (answers[currentQuestion.questionId] || '') : ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 italic">
                {saving ? 'Saving...' : 'Draft saved'}
              </span>
              
              {currentIdx < (session.questions.length - 1) ? (
                <button
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Next Question
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  Complete & Submit
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewPage;

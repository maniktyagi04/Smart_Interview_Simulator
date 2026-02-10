import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Send, Clock, Play, RotateCcw, Maximize2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Update interface
interface Session {
  id: string;
  type: string;
  domain: string;
  difficulty: string;
  topics: string[];
  messages: Message[];
  questions?: {
    question: {
      id: string;
      title: string;
      problemStatement: string; // Added problemStatement
      idealAnswer: string;
      keyConcepts: string; 
    }
  }[];
  status: string;
  metadata?: {
    currentQuestionIndex: number;
    totalQuestions: number;
    counterQuestionCount: number;
  };
}

const InterviewSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(1800); 
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>('// Write your code here\n');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [consoleError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'OUTPUT' | 'ERROR' | 'INPUT'>('OUTPUT');
  const [leftTab, setLeftTab] = useState<'QUESTION' | 'CHAT'>('QUESTION'); // Added Left Tab state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper function to clean LaTeX notation
  const cleanLatex = (text: string): string => {
    let cleaned = text;
    // Remove dollar signs
    cleaned = cleaned.split('$').join('');
    // Convert LaTeX operators to readable symbols
    cleaned = cleaned.split('\\ll').join('<<');
    cleaned = cleaned.split('\\gg').join('>>');
    cleaned = cleaned.split('\\le').join('<=');
    cleaned = cleaned.split('\\ge').join('>=');
    cleaned = cleaned.split('\\times').join('×');
    cleaned = cleaned.split('\\div').join('÷');
    cleaned = cleaned.split('\\ne').join('≠');
    cleaned = cleaned.split('\\approx').join('≈');
    cleaned = cleaned.split('\\sum').join('Σ');
    cleaned = cleaned.split('\\prod').join('Π');
    return cleaned.trim();
  };

  // ... fetchSession and existing hooks ... 

  const fetchSession = useCallback(async () => {
    try {
      const res = await client.get<Session>(`/sessions/${id}`);
      let messages = res.data.messages;
      if (typeof messages === 'string') {
          try {
              messages = JSON.parse(messages);
          } catch {
              messages = [];
          }
      }
      
      const sessionData = { ...res.data, messages };
      setSession(sessionData);
      
      const linkedQuestion = res.data.questions?.[0]?.question;
      if (linkedQuestion) {
          if (res.data.domain === 'DSA' && linkedQuestion.keyConcepts) {
              setConsoleInput(linkedQuestion.keyConcepts);
          }
      }
      
      // If we have messages, default to CHAT, else QUESTION
      if (res.data.messages.length > 1) {
          setLeftTab('CHAT');
      }
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

  useEffect(() => {
    if (leftTab === 'CHAT') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages, leftTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !id || loading) return;

    const currentInput = userInput;
    setUserInput('');
    setLoading(true);
    setLeftTab('CHAT');

    // Optimistic Update
    if (session) {
        const optimisticMessage: Message = {
            role: 'user',
            parts: [{ text: currentInput }]
        };
        setSession({
            ...session,
            messages: [...(session.messages || []), optimisticMessage]
        });
    }

    try {
      const res = await client.post<Session>(`/sessions/${id}/interact`, { message: currentInput });
      
      let messages = res.data.messages;
      if (typeof messages === 'string') {
          try { messages = JSON.parse(messages); } catch { messages = []; }
      }
      
      setSession({ ...res.data, messages });
      
      if (res.data.status === 'SUBMITTED' || res.data.status === 'COMPLETED') {
         navigate(`/feedback/${id}`);
      }
    } catch (error) {
       console.error('Failed to send message', error);
       // Rollback if needed or show error? For now, just log.
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleResetCode = () => {
    if (confirm('Are you sure you want to reset your code?')) {
        setCode('// Write your code here\n');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setLeftTab('QUESTION'); // Small trick to show output if editor is huge? No, stick to tabs
    setActiveTab('OUTPUT');
    setConsoleOutput('Running code...\n');
    
    // Simulate code run for now as no real execution backend is specified in this snippet
    setTimeout(() => {
        setConsoleOutput('Code execution successful.\n\nOutput: Hello World!');
        setIsRunning(false);
    }, 1500);
  };

  const handleSubmitInterview = async () => {
    if (!id || loading) return;
    setLoading(true);
    try {
        await client.patch(`/sessions/${id}/status`, { status: 'SUBMITTED' });
        // Redirect directly to dashboard instead of feedback page
        navigate('/dashboard');
    } catch (error) {
        console.error('Failed to submit interview', error);
        alert('Failed to submit interview. Please try again.');
    } finally {
        setLoading(false);
    }
  };
  
  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans tracking-tight">Loading Session...</div>;

  const currentQuestion = session.questions?.[session.metadata?.currentQuestionIndex || 0]?.question;

  return (
    <div className="h-screen w-screen bg-black text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Header same as before */}
      <header className="h-12 bg-[#0B0E14] border-b border-slate-800 flex items-center justify-between px-6 z-50 shrink-0">
         {/* ... header content ... */}
          <div className="flex items-center gap-4">
             <div className="text-white font-black text-lg tracking-tighter flex items-center gap-2">
                <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-[10px]">AI</div>
                SIS INTERVIEW
             </div>
             {/* ... */}
         </div>
         {/* ... right header ... */}
         <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 font-mono text-sm font-bold ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
            </div>
             <button 
                onClick={() => setShowFinishModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest px-6 py-1.5 rounded-lg transition-all shadow-lg shadow-indigo-600/10 active:scale-95"
            >
                Finish Interview
            </button>
         </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Question & Chat */}
        <div className="w-[40%] bg-[#0B0E14] border-r border-slate-800 flex flex-col relative">
           {/* Tab Header */}
          <div className="flex items-center bg-[#0B0E14] border-b border-slate-800">
             <button 
               onClick={() => setLeftTab('QUESTION')}
               className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-b-2 ${leftTab === 'QUESTION' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                Description
             </button>
             <button 
               onClick={() => setLeftTab('CHAT')}
               className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-b-2 ${leftTab === 'CHAT' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                Chat History
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar scroll-smooth relative">
            {leftTab === 'QUESTION' ? (
                <div className="p-8 prose prose-invert prose-slate max-w-none">
                    {(() => {
                        // Extract problem statement from Sarah's first message
                        const firstModelMessage = session.messages.find(msg => msg.role === 'model');
                        const problemText = firstModelMessage?.parts[0]?.text || currentQuestion?.problemStatement || "No problem statement available.";
                        const cleanedText = cleanLatex(problemText);
                        
                        return (
                            <div>
                                <h1 className="text-2xl font-bold mb-6 text-white">
                                    {currentQuestion?.title || "Coding Interview Question"}
                                </h1>
                                <div className="text-slate-300 leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {cleanedText}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            ) : (
                <div className="p-8 space-y-12 pb-32">
                     {session.messages.length > 0 ? (
                         session.messages
                             // Skip Sarah's first message (it's shown in Question panel)
                             .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
                             .map((msg, idx) => {
                             const isModel = msg.role === 'model';
                             return (
                                <div key={idx} className={`${isModel ? 'text-white' : 'text-indigo-400 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10'}`}>
                                    {isModel ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] font-black">AI</div>
                                                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Sarah (AI)</span>
                                            </div>
                                            <div className="prose prose-invert prose-slate max-w-none text-sm">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                                    code: ({ ...props }) => <code className="bg-slate-800 rounded px-1" {...props} />,
                                                    pre: ({ ...props }) => <pre className="bg-slate-900 p-3 rounded-lg my-2 overflow-x-auto border border-slate-700 text-xs" {...props} />
                                                }}>
                                                    {cleanLatex(msg.parts[0].text)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-4">
                                            <div className="text-xs font-black uppercase tracking-widest text-indigo-500 shrink-0 mt-1">You</div>
                                            <p className="text-sm font-medium leading-relaxed">{msg.parts[0].text}</p>
                                        </div>
                                    )}
                                </div>
                             );
                         })
                     ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 italic">
                            Initializing interview...
                        </div>
                     )}
                     
                     {loading && (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Thinking...</span>
                        </div>
                     )}
                     <div ref={chatEndRef} />
                </div>
            )}
          </div>

          {/* Interactive Chat Input - Always Visible */}
          <div className="p-4 bg-[#0B0E14] border-t border-slate-800">
             {/* ... input ... */}
            <div className="relative group">
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="Type your response or ask for clarification..."
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 pr-14 text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 transition-all resize-none h-16"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={loading || !userInput.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
                >
                    <Send size={14} className="stroke-[2.5]" />
                </button>
            </div>
          </div>
        </div>


        {/* Right Pane: Editor & Console */}
        <div className="flex-1 flex flex-col bg-[#0B0E14]">
          {/* Editor Header */}
          <div className="h-12 bg-[#0B0E14] border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
                <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-colors group">
                    <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                        {language === 'javascript' ? 'JavaScript (Node.js 20.9.0)' : 'Python (v3.10)'}
                    </span>
                    <div className="w-4 h-4 flex flex-col items-center justify-center animate-in rotate-in-180 duration-500">
                        <div className="w-0.5 h-0.5 bg-slate-500 mb-0.5 rounded-full" />
                        <div className="w-0.5 h-0.5 bg-slate-500 mb-0.5 rounded-full" />
                        <div className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
                    </div>
                </div>
                <button 
                    onClick={() => setLanguage(language === 'javascript' ? 'python' : 'javascript')}
                    className="text-[10px] font-black uppercase text-indigo-400 px-2 py-1 hover:bg-indigo-500/10 rounded transition-all"
                >
                    Switch to {language === 'javascript' ? 'Python' : 'JS'}
                </button>
            </div>
            
            <div className="flex items-center gap-4">
                <RotateCcw 
                    size={16} 
                    className="text-slate-500 hover:text-white cursor-pointer transition-all active:rotate-180" 
                    onClick={handleResetCode}
                />
                <Maximize2 size={16} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <button 
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-6 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 active:scale-95"
                >
                    <Play size={12} className="fill-current" />
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden bg-[#0B0E14]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 16,
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                lineHeight: 1.6,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'all',
                scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden'
                }
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('custom-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#0B0E14',
                  }
                });
              }}
              onMount={(_editor, monaco) => {
                monaco.editor.setTheme('custom-dark');
              }}
            />
          </div>

          {/* Console / Footer Section */}
          <div className="h-[30%] bg-[#0B0E14] border-t border-slate-800 flex flex-col shrink-0">
            <div className="flex items-center px-6 border-b border-slate-800 shrink-0">
                {(['INPUT', 'OUTPUT', 'ERROR'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-[10px] font-black tracking-[0.2em] relative transition-colors ${
                            activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_-4px_10px_rgba(99,102,241,0.5)]" />
                        )}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-auto p-6 font-mono text-sm">
                {activeTab === 'INPUT' && (
                    <textarea 
                        value={consoleInput}
                        onChange={(e) => setConsoleInput(e.target.value)}
                        placeholder="Enter program input here..."
                        className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-300 placeholder:text-slate-700 resize-none font-mono"
                    />
                )}
                {activeTab === 'OUTPUT' && (
                    <div className="flex gap-4">
                        <span className="text-slate-700 select-none">1</span>
                        <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {consoleOutput || <span className="text-slate-700 italic">No output yet. Click 'Run Code' to execute.</span>}
                        </pre>
                    </div>
                )}
                {activeTab === 'ERROR' && (
                    <div className="flex gap-4">
                         <span className="text-rose-900/50 select-none">1</span>
                         <pre className="text-rose-400 whitespace-pre-wrap font-bold leading-relaxed">
                            {consoleError || <span className="text-slate-700 italic">Clean execution. No errors found.</span>}
                         </pre>
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Finish Interview Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Finish Interview?</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Are you sure you want to finish this interview? Your responses will be submitted for evaluation and you'll return to your dashboard.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700"
                >
                  No, Continue
                </button>
                <button
                  onClick={handleSubmitInterview}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Finish Interview'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #334155;
        }
      `}</style>
    </div>
  );
};

export default InterviewSessionPage;

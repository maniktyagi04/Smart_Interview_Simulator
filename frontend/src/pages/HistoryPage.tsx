
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Search, Clock, Award, Filter, ChevronRight } from 'lucide-react';

interface HistoryRecord {
    id: string;
    date: string;
    type: string;
    domain: string;
    difficulty: string;
    score: number | null;
    status: string;
}

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await client.get('/analytics/student');
                setHistory(res.data.history || []);
            } catch (err) {
                console.error('Failed to fetch history', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <Sidebar />
            
            <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
                <DashboardHeader />

                <div className="max-w-6xl mx-auto space-y-10">
                    {/* Header with Search/Filter */}
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Interview History</h1>
                            <p className="text-slate-500 mt-1">Review your past performances and feedback.</p>
                        </div>
                        <div className="flex gap-4">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search history..." 
                                    className="pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 min-w-[240px]"
                                />
                             </div>
                             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                <Filter size={16} /> Filter
                             </button>
                        </div>
                    </div>

                    {/* Section 1: Completed Interviews */}
                    <section>
                         <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Recent Sessions</h3>
                            </div>
                            
                            <div className="divide-y divide-slate-100">
                                {loading ? (
                                    <div className="p-10 text-center text-slate-400">Loading history...</div>
                                ) : history.filter(s => s.status === 'EVALUATED' || s.status === 'COMPLETED').length === 0 ? (
                                    <div className="p-10 text-center text-slate-400">No completed interviews yet.</div>
                                ) : (
                                    history.filter(s => s.status === 'EVALUATED' || s.status === 'COMPLETED').map((session) => (
                                        <HistoryRow key={session.id} session={session} />
                                    ))
                                )}
                            </div>
                         </div>
                    </section>

                    {/* Section 2: In-Progress / Status */}
                    <section>
                         <h2 className="text-xl font-bold text-slate-800 mb-6">In-Progress & Upcoming</h2>
                         <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {loading ? (
                                    <div className="p-10 text-center text-slate-400">Loading...</div>
                                ) : history.filter(s => s.status !== 'EVALUATED' && s.status !== 'COMPLETED').length === 0 ? (
                                    <div className="p-10 text-center text-slate-400">No active sessions.</div>
                                ) : (
                                    history.filter(s => s.status !== 'EVALUATED' && s.status !== 'COMPLETED').map((session) => (
                                        <HistoryRow key={session.id} session={session} />
                                    ))
                                )}
                            </div>
                         </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

const HistoryRow = ({ session }: { session: HistoryRecord }) => {
    const navigate = useNavigate();
    
    return (
        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group">
            <div className="flex items-center gap-6 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    session.status === 'EVALUATED' || session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                     {session.status === 'EVALUATED' || session.status === 'COMPLETED' ? <Award size={24} /> : <Clock size={24} />}
                </div>
                
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{session.domain.replace('_', ' ')}</h4>
                    <div className="flex gap-4 mt-1">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {session.type}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {new Date(session.date).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-12 px-6">
                <div className="text-right min-w-[100px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score</p>
                    <p className={`text-lg font-bold ${session.score !== null ? 'text-slate-800' : 'text-slate-300'}`}>
                        {session.score !== null ? `${Math.round(session.score)}%` : '---'}
                    </p>
                </div>
                
                <div className="text-right min-w-[120px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <div className={`flex items-center justify-end gap-2 text-sm font-bold ${
                        session.status === 'EVALUATED' || session.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                        {session.status}
                        <div className={`w-2 h-2 rounded-full ${
                            session.status === 'EVALUATED' || session.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></div>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => navigate(`/feedback/${session.id}`)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
                 View Report <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default HistoryPage;

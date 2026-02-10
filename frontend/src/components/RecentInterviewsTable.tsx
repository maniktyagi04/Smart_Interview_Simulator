
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Session {
    id: string;
    date: string;
    type: string;
    domain: string;
    difficulty: string;
    score: number | null;
    status: string;
}

const RecentInterviewsTable: React.FC<{ sessions: Session[] }> = ({ sessions }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Recent Inteviews</h3>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    View All <ArrowUpRight size={14} />
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Domain</th>
                            <th className="px-6 py-4">Difficulty</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                        {sessions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No recent interviews found.</td>
                            </tr>
                        ) : (
                            sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">{new Date(session.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-800">{session.type}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-xs font-bold">{session.domain.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                            session.difficulty === 'HARD' ? 'bg-red-50 text-red-600' : 
                                            session.difficulty === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {session.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">
                                        {session.score !== null ? `${Math.round(session.score)}%` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-2 text-xs font-bold ${
                                            session.status === 'COMPLETED' || session.status === 'EVALUATED' ? 'text-emerald-500' : 
                                            session.status === 'PENDING_REVIEW' ? 'text-purple-500' : 'text-amber-500'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full ${
                                                session.status === 'COMPLETED' || session.status === 'EVALUATED' ? 'bg-emerald-500' : 
                                                session.status === 'PENDING_REVIEW' ? 'bg-purple-500' : 'bg-amber-500'
                                            }`}></span>
                                            {session.status === 'PENDING_REVIEW' ? 'Under Review' : session.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentInterviewsTable;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Users, TrendingUp, Search, HelpCircle, CheckCircle, Share2, FileCheck, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface InterviewRecord {
  id: string;
  candidate: string;
  evaluator: string;
  type: string;
  outcome: string;
  difficulty: string;
  result: {
    status: string;
    color: string;
  };
  duration: string;
  status: string;
  score: number | null;
  date: string;
}

const InterviewHistory: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);


  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await client.get('/analytics/admin/sessions');
        setInterviews(res.data);
      } catch (error) {
        console.error('Failed to fetch interviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const getResultColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30';
      case 'red': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'yellow': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'teal': return 'bg-teal-600/20 text-teal-400 border-teal-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white font-sans">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8">
           <div className="animate-pulse space-y-8">
              <div className="h-10 w-48 bg-slate-800 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl" />
                ))}
              </div>
              <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl" />
           </div>
        </main>
      </div>
    );
  }

  const handlePublish = async (id: string) => {
    if (!window.confirm('Are you sure you want to publish this interview result to the student?')) return;
    try {
      await client.patch(`/sessions/${id}/publish`);
      // Refresh list
      const res = await client.get('/analytics/admin/sessions');
      setInterviews(res.data);
    } catch (error) {
      console.error('Failed to publish session', error);
      alert('Failed to publish session');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-64">
        {/* Header */}
        <header className="bg-slate-900/50 border-b border-slate-800 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Interview Sessions</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-5 h-5" />
              <span className="text-sm">Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-600/30">
                  <FileCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Interviews</p>
                  <p className="text-3xl font-bold">{interviews.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-600/30">
                  <Share2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pending Review</p>
                  <p className="text-3xl font-bold">{interviews.filter(i => i.status === 'PENDING_REVIEW').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-600/20 rounded-xl flex items-center justify-center border border-teal-600/30">
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pass Rate</p>
                  <p className="text-3xl font-bold">
                    {interviews.length > 0 
                      ? Math.round((interviews.filter(i => i.outcome === 'Pass').length / interviews.length) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-600/30">
                  <HelpCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Successful Interviews</p>
                  <p className="text-3xl font-bold">
                    {interviews.filter(i => i.outcome === 'Pass').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Interview History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Filters */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-4 flex-wrap">
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors">
                <option>Interview Type</option>
                <option>DSA</option>
                <option>System Design</option>
                <option>Behavioral</option>
              </select>

              <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors">
                <option>Session Status</option>
                <option>Completed</option>
                <option>Failed</option>
                <option>Abandoned</option>
              </select>

              <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors">
                <option>Outcome</option>
                <option>Pass</option>
                <option>Fail</option>
                <option>Review Needed</option>
              </select>
              
               <div className="relative">
                  <input 
                    type="date" 
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors"
                  />
               </div>

              <button className="ml-auto p-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                <Search className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Outcome</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Result</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400">Loading interviews...</td>
                    </tr>
                  ) : interviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400">No interviews found.</td>
                    </tr>
                  ) : (
                    interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium">{interview.candidate}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-md text-xs font-bold border border-indigo-600/30">
                          {interview.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         {interview.status === 'PENDING_REVIEW' ? (
                            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-md text-xs font-bold border border-purple-600/30">Pending Review</span>
                         ) : (
                            <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-md text-xs font-bold border border-emerald-600/30">{interview.status}</span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{interview.outcome}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                            interview.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400' :
                            interview.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                        }`}>
                          {interview.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getResultColor(interview.result.color)}`}>
                          {interview.result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end relative action-menu-container">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === interview.id ? null : interview.id);
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === interview.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 font-sans text-left">
                                {interview.status === 'PENDING_REVIEW' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePublish(interview.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-indigo-400 hover:bg-slate-700 transition-colors flex items-center gap-2 font-bold"
                                  >
                                    <FileCheck className="w-4 h-4" />
                                    Send Report
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/admin/feedback');
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                  View Insights
                                </button>
                                <button
                                  onClick={(e) => e.stopPropagation()} // Placeholder for standard session view
                                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium"
                                >
                                  <Users className="w-4 h-4" />
                                  View Session
                                </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <p className="text-sm text-slate-400">Showing <span className="text-white font-bold">{interviews.length}</span> of <span className="text-white font-bold">{interviews.length}</span> results</p>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
                <span className="px-3 py-1 text-sm text-slate-300">Page</span>
                <span className="px-3 py-1 text-sm text-white font-bold">1</span>
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewHistory;

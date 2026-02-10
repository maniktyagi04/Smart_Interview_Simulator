
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import PerformanceCard from '../components/PerformanceCard';
import WeakConcepts from '../components/WeakConcepts';
import RecentInterviewsTable from '../components/RecentInterviewsTable';
import RecommendationBox from '../components/RecommendationBox';
import StatChart from '../components/StatChart';
import { TrendingUp, AlertTriangle, Play, History, Clock } from 'lucide-react';

import type { StudentAnalytics } from '../types';

const StudentDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await client.get('/analytics/student');
      setAnalytics(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
        <DashboardHeader />

        {loading ? (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        ) : (
            <div className="space-y-8">
                {/* 1. Performance Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PerformanceCard 
                        title="Total Interviews" 
                        value={analytics?.performance?.totalInterviews || 0} 
                        icon={<History size={20} />} 
                        color="bg-indigo-500" 
                    />
                     <PerformanceCard 
                        title="In Progress" 
                        value={analytics?.performance?.inProgressCount || 0}
                        subtext="Pending Completion"
                        icon={<Clock size={20} />} 
                        color="bg-orange-500" 
                    />
                    <PerformanceCard 
                        title="Avg Score" 
                        value={`${analytics?.performance?.averageScore || 0}%`} 
                        icon={<TrendingUp size={20} />} 
                        color="bg-emerald-500" 
                    />
                    <PerformanceCard 
                        title="Weakest Domain" 
                        value={analytics?.performance?.weakestDomain || 'N/A'} 
                        icon={<AlertTriangle size={20} />} 
                        color="bg-red-500" 
                    />
                </div>

                {/* 2. Recommendation & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-64">
                    <div className="lg:col-span-1 h-full">
                        {analytics?.recommendation && (
                            <RecommendationBox recommendation={analytics.recommendation} />
                        )}
                    </div>
                    <div className="lg:col-span-2 h-full flex flex-col justify-between">
                        <div 
                            onClick={() => navigate('/interview/new')}
                            className="flex-1 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between mb-4 relative overflow-hidden"
                        >
                            <div className="absolute left-0 top-0 h-full w-2 bg-indigo-600"></div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">Start New Interview</h3>
                                <p className="text-slate-500">Test your skills with a fresh simulation.</p>
                            </div>
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                <Play size={32} className="text-indigo-600 group-hover:text-white transition-colors ml-1" />
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                              <button 
                                onClick={() => {
                                    const latestActive = analytics?.history?.find(s => s.status === 'IN_PROGRESS' || s.status === 'CREATED');
                                    if (latestActive) {
                                        navigate(`/interview/${latestActive.id}`);
                                    } else {
                                        navigate('/interview/new');
                                    }
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-xl py-4 font-bold text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all"
                              >
                                 Resume Incomplete
                              </button>
                             <button className="flex-1 bg-white border border-slate-200 rounded-xl py-4 font-bold text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all">
                                View Solutions
                             </button>
                        </div>
                    </div>
                </div>

                {/* 3. Analytics Detail Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96">
                        <StatChart />
                    </div>
                    <div className="lg:col-span-1 h-96">
                        <WeakConcepts concepts={analytics?.weakConcepts || []} />
                    </div>
                </div>

                {/* 4. Recent History */}
                <RecentInterviewsTable sessions={analytics?.history || []} />
            </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;

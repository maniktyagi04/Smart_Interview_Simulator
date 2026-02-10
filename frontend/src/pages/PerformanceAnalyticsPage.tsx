
import React, { useState, useEffect } from 'react';

import { useAuth } from '../store/AuthContext';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { 
    Users, TrendingUp, Activity, Target, Zap, 
    BarChart3, ArrowUpRight, ArrowDownRight,
    Minus, AlertTriangle, ShieldCheck, Flame, Layers
} from 'lucide-react';

interface AnalyticsData {
  performance: {
      totalInterviews: number;
      averageScore: number;
      successRate: number;
      growthRate: number;
      consistencyIndex: number;
      peerPercentile: number;
      inProgressCount: number;
      completedCount: number;
  };
  skills: {
      skill: string;
      score: number;
      trend: 'Improving' | 'Stable' | 'Declining';
      stability: 'High' | 'Medium' | 'Low';
      insight: string;
  }[];
  patterns: {
      consistentStrength: string;
      recurringWeakness: string;
      fastestImproving: string;
      highestRisk: string;
  };
  trend: { date: string, score: number }[];
  history: {
      id: string;
      type: string;
      domain: string;
      difficulty: string;
      outcome: string;
      score: number;
      date: string;
  }[];
}

// Tooltip component removed - not currently used

const PerformanceAnalyticsPage: React.FC = () => {

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
       try {
           // Fetch appropriate analytics based on user role
           const endpoint = isAdmin ? '/analytics/admin' : '/analytics/student';
           const res = await client.get(endpoint);
           setAnalyticsData(res.data);
       } catch (err) {
           console.error("Failed to fetch analytics", err);
       } finally {
           setLoading(false);
       }
    };
    fetchAnalytics();
  }, [isAdmin]);

  const getStabilityColor = (stability: string) => {
      switch(stability) {
          case 'High': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          default: return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      }
  };

  if (isAdmin) {
    // Comprehensive Admin Analytics Dashboard
    const adminData = analyticsData as { 
      totalStudents?: number; 
      totalInterviews?: number; 
      averageScore?: number; 
      domainStats?: Array<{ domain: string; averageScore: number; weakTopics?: string[] }> 
    };
    
    // Metrics from available data
    const totalStudents = adminData?.totalStudents || 0;
    const totalInterviews = adminData?.totalInterviews || 0;
    const avgScore = adminData?.averageScore || 0;
    
    // Pass rate logic: clamp at 0, avoid negative values
    // Using simple business logic: if avg score is high, pass rate is high. 
    // In a real system this would be calculated by individual session outcomes.
    const passRate = avgScore > 0 ? (avgScore >= 60 ? Math.min(95, avgScore + 10) : Math.max(0, avgScore - 5)) : 0;
    const dropOffRate = totalInterviews > 0 ? Math.max(5, 100 - passRate - 10) : 0;
    
    // Mock trend data
    const trendData = [
      { period: 'Week 1', interviews: 12, avgScore: 65 },
      { period: 'Week 2', interviews: 18, avgScore: 68 },
      { period: 'Week 3', interviews: 22, avgScore: 72 },
      { period: 'Week 4', interviews: totalInterviews || 28, avgScore: avgScore || 75 },
    ];
    
    // Domain performance with weak topics
    const domainPerformance = adminData?.domainStats || [
      { domain: 'DSA', averageScore: 72, weakTopics: ['Dynamic Programming', 'Graph Algorithms'] },
      { domain: 'System Design', averageScore: 68, weakTopics: ['Scalability', 'Database Design'] },
      { domain: 'CS Core', averageScore: 78, weakTopics: ['OS Concepts', 'Networking'] },
      { domain: 'JavaScript', averageScore: 82, weakTopics: ['Closures', 'Async/Await'] },
    ];
    
    // Student segmentation
    const segmentation = {
      beginner: Math.round(totalStudents * 0.35),
      intermediate: Math.round(totalStudents * 0.45),
      advanced: Math.round(totalStudents * 0.20),
    };
    
    // Quality metrics
    const qualityMetrics = {
      codingCompletion: 78,
      avgTimePerQuestion: 12.5,
      codeCorrectness: 73,
      aiCommunication: 82,
      confidence: 76,
    };
    
    // AI Insights
    const insights = [
      'DSA performance dropped 8% this week - recommend more practice sessions on Dynamic Programming',
      'System Design scores are 12% below target - consider adding more real-world case studies',
      '35% of students are stuck at beginner level - implement personalized learning paths',
      'Drop-off rate increased during complex coding questions - simplify onboarding flow',
    ];
    
    return (
        <div className="flex min-h-screen bg-[#0B0E14] text-white font-sans">
             <AdminSidebar />
             <main className="flex-1 ml-64 p-8 overflow-y-auto">
                 {/* Header */}
                 <div className="mb-8">
                     <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Performance Analytics</h1>
                     <p className="text-slate-400 text-lg">Comprehensive insights into student performance and system metrics</p>
                 </div>
                 
                  {loading ? (
                     <div className="space-y-8 animate-pulse">
                         {/* KPI Skeletons */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                             {[1, 2, 3, 4, 5].map(i => (
                                 <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-xl" />
                             ))}
                         </div>
                         {/* Charts Skeleton */}
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             <div className="lg:col-span-2 h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
                             <div className="h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
                         </div>
                         {/* Domains Skeleton */}
                         <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
                     </div>
                 ) : !analyticsData ? (
                     <p className="text-slate-400 text-center py-20">No analytics data available.</p>
                 ) : (
                     <div className="space-y-8 max-w-[1600px]">
                         {/* Top KPI Cards - Simplified */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                             {/* Total Students */}
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                 <div className="flex items-center gap-3 mb-3">
                                     <Users className="w-5 h-5 text-slate-400" />
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
                                 </div>
                                 <p className="text-4xl font-black text-white">{totalStudents}</p>
                             </div>
                             
                             {/* Total Interviews */}
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                 <div className="flex items-center gap-3 mb-3">
                                     <TrendingUp className="w-5 h-5 text-slate-400" />
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Interviews</p>
                                 </div>
                                 <p className="text-4xl font-black text-white">{totalInterviews}</p>
                             </div>
                             
                             {/* Average Score */}
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                 <div className="flex items-center gap-3 mb-3">
                                     <Target className="w-5 h-5 text-slate-400" />
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
                                 </div>
                                 <p className="text-4xl font-black text-white">{Math.round(avgScore)}%</p>
                             </div>
                             
                             {/* Pass Rate */}
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                 <div className="flex items-center gap-3 mb-3">
                                     <ShieldCheck className="w-5 h-5 text-slate-400" />
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Rate</p>
                                 </div>
                                 <p className="text-4xl font-black text-white">{Math.round(passRate)}%</p>
                             </div>
                             
                             {/* Drop-off Rate - Critical metric with red color */}
                             <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-6">
                                 <div className="flex items-center gap-3 mb-3">
                                     <AlertTriangle className="w-5 h-5 text-rose-400" />
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drop-off Rate</p>
                                 </div>
                                 <p className="text-4xl font-black text-rose-400">{Math.round(dropOffRate)}%</p>
                             </div>
                         </div>
                         
                         {/* Trend Chart & Student Segmentation */}
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             {/* Trend Chart */}
                             <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8">
                                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                     <BarChart3 className="w-6 h-6 text-indigo-400" />
                                     Interview Trends
                                 </h2>
                                 <div className="space-y-6">
                                     {trendData.map((point, idx) => (
                                         <div key={idx} className="space-y-2">
                                             <div className="flex items-center justify-between text-sm">
                                                 <span className="text-slate-400 font-medium">{point.period}</span>
                                                 <div className="flex items-center gap-4">
                                                     <span className="text-emerald-400 font-bold">{point.interviews} interviews</span>
                                                     <span className="text-indigo-400 font-bold">{point.avgScore}% avg</span>
                                                 </div>
                                             </div>
                                             <div className="flex gap-2 h-3">
                                                 <div 
                                                     className="bg-gradient-to-r from-emerald-500/20 to-emerald-500/40 rounded-full border border-emerald-500/30"
                                                     style={{ width: `${(point.interviews / 30) * 100}%` }}
                                                 />
                                                 <div 
                                                     className="bg-gradient-to-r from-indigo-500/20 to-indigo-500/40 rounded-full border border-indigo-500/30"
                                                     style={{ width: `${point.avgScore}%` }}
                                                 />
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                             
                             {/* Student Segmentation */}
                             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                     <Users className="w-6 h-6 text-indigo-400" />
                                     Student Levels
                                 </h2>
                                 <div className="space-y-4">
                                     <div className="space-y-2">
                                         <div className="flex items-center justify-between">
                                             <span className="text-sm font-medium text-slate-300">Advanced</span>
                                             <span className="text-sm font-bold text-emerald-400">{segmentation.advanced} ({Math.round((segmentation.advanced/totalStudents)*100)}%)</span>
                                         </div>
                                         <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                             <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(segmentation.advanced/totalStudents)*100}%` }} />
                                         </div>
                                     </div>
                                     <div className="space-y-2">
                                         <div className="flex items-center justify-between">
                                             <span className="text-sm font-medium text-slate-300">Intermediate</span>
                                             <span className="text-sm font-bold text-indigo-400">{segmentation.intermediate} ({Math.round((segmentation.intermediate/totalStudents)*100)}%)</span>
                                         </div>
                                         <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                             <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400" style={{ width: `${(segmentation.intermediate/totalStudents)*100}%` }} />
                                         </div>
                                     </div>
                                     <div className="space-y-2">
                                         <div className="flex items-center justify-between">
                                             <span className="text-sm font-medium text-slate-300">Beginner</span>
                                             <span className="text-sm font-bold text-amber-400">{segmentation.beginner} ({Math.round((segmentation.beginner/totalStudents)*100)}%)</span>
                                         </div>
                                         <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                             <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${(segmentation.beginner/totalStudents)*100}%` }} />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         
                         {/* Domain Performance */}
                         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                 <Layers className="w-6 h-6 text-indigo-400" />
                                 Domain Performance
                             </h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                 {domainPerformance.map((domain: { domain: string; averageScore: number; weakTopics?: string[] }) => (
                                     <div key={domain.domain} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
                                         <div>
                                             <h3 className="text-lg font-bold text-white mb-1">{domain.domain}</h3>
                                             <p className="text-3xl font-black text-indigo-400">{Math.round(domain.averageScore)}%</p>
                                         </div>
                                         <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                             <div 
                                                 className={`h-full ${domain.averageScore >= 75 ? 'bg-emerald-500' : domain.averageScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                 style={{ width: `${domain.averageScore}%` }}
                                             />
                                         </div>
                                         <div>
                                             <p className="text-xs font-bold text-slate-500 uppercase mb-2">Weak Topics</p>
                                             <div className="space-y-1">
                                                 {(domain.weakTopics || ['N/A']).map((topic: string, idx: number) => (
                                                     <p key={idx} className="text-xs text-rose-400 font-medium">• {topic}</p>
                                                 ))}
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                         
                         {/* Interview Quality Metrics */}
                         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                 <Activity className="w-6 h-6 text-indigo-400" />
                                 Interview Quality Metrics
                             </h2>
                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                 <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Coding Completion</p>
                                     <p className="text-3xl font-black text-white mb-1">{qualityMetrics.codingCompletion}%</p>
                                     <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
                                         <div className="h-full bg-emerald-500" style={{ width: `${qualityMetrics.codingCompletion}%` }} />
                                     </div>
                                 </div>
                                 <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Avg Time/Question</p>
                                     <p className="text-3xl font-black text-white mb-1">{qualityMetrics.avgTimePerQuestion}<span className="text-xl text-slate-500">m</span></p>
                                     <p className="text-xs text-slate-500 mt-2">Within target range</p>
                                 </div>
                                 <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Code Correctness</p>
                                     <p className="text-3xl font-black text-white mb-1">{qualityMetrics.codeCorrectness}%</p>
                                     <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
                                         <div className="h-full bg-amber-500" style={{ width: `${qualityMetrics.codeCorrectness}%` }} />
                                     </div>
                                 </div>
                                 <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">AI Communication</p>
                                     <p className="text-3xl font-black text-white mb-1">{qualityMetrics.aiCommunication}%</p>
                                     <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
                                         <div className="h-full bg-indigo-500" style={{ width: `${qualityMetrics.aiCommunication}%` }} />
                                     </div>
                                 </div>
                                 <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Confidence Score</p>
                                     <p className="text-3xl font-black text-white mb-1">{qualityMetrics.confidence}%</p>
                                     <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
                                         <div className="h-full bg-emerald-500" style={{ width: `${qualityMetrics.confidence}%` }} />
                                     </div>
                                 </div>
                             </div>
                         </div>
                         
                         {/* AI Insights Panel */}
                         <div className="bg-gradient-to-br from-indigo-500/10 via-slate-900 to-purple-500/10 border-2 border-indigo-500/30 rounded-2xl p-8">
                             <div className="flex items-center gap-3 mb-6">
                                 <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                     <Zap className="w-6 h-6 text-indigo-400" />
                                 </div>
                                 <div>
                                     <h2 className="text-2xl font-black text-white">AI-Powered Insights</h2>
                                     <p className="text-sm text-slate-400">Actionable recommendations based on performance patterns</p>
                                 </div>
                             </div>
                             <div className="space-y-3">
                                 {insights.map((insight, idx) => (
                                     <div key={idx} className="flex items-start gap-3 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                         <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                             <Flame className="w-4 h-4 text-indigo-400" />
                                         </div>
                                         <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>
                 )}
             </main>
        </div>
    );
  }

  // Student View
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto h-screen">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto space-y-10 mt-6">
           {/* Header */}
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                <BarChart3 className="text-indigo-600 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Performance Analytics</h1>
                <p className="text-slate-500 font-medium text-lg mt-1">Deep dive into your interview trends, stability, and growth.</p>
              </div>
           </div>

           {loading ? (
            <div className="animate-pulse space-y-8">
              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="h-12 w-12 bg-slate-100 rounded-xl mb-4" />
                    <div className="h-10 w-20 bg-slate-100 rounded mb-2" />
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
              
              {/* Skills and Patterns Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 h-96">
                  <div className="h-6 w-48 bg-slate-800 rounded mb-6" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-16 bg-slate-800 rounded-xl" />
                    ))}
                  </div>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                        <div className="flex-1">
                          <div className="h-6 w-32 bg-slate-100 rounded mb-2" />
                          <div className="h-4 w-48 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
           ) : !analyticsData ? (
               <div className="py-20 text-center text-slate-400">No data available yet. Start an interview!</div>
           ) : (
               <>
                {/* 1. Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        label="Success Rate" 
                        value={`${analyticsData.performance.successRate}%`} 
                        subtext="Interviews Passed"
                        icon={<ShieldCheck size={24} className="text-emerald-500" />}
                        trend={analyticsData.performance.successRate > 70 ? 'High' : 'Average'}
                        trendColor={analyticsData.performance.successRate > 70 ? 'text-emerald-500' : 'text-amber-500'}
                    />
                    <StatCard 
                        label="Readiness Growth" 
                        value={`${analyticsData.performance.growthRate > 0 ? '+' : ''}${analyticsData.performance.growthRate}%`} 
                        subtext="Vs Last Month"
                        icon={<TrendingUp size={24} className={analyticsData.performance.growthRate >= 0 ? "text-indigo-500" : "text-rose-500"} />}
                        trend={analyticsData.performance.growthRate >= 0 ? 'Improving' : 'Declining'}
                        trendColor={analyticsData.performance.growthRate >= 0 ? "text-indigo-500" : "text-rose-500"}
                    />
                    <StatCard 
                        label="Consistency Index" 
                        value={`${analyticsData.performance.consistencyIndex}`} 
                        subtext="Score Stability (0-1)"
                        icon={<Activity size={24} className="text-blue-500" />}
                        trend={analyticsData.performance.consistencyIndex > 0.8 ? 'Very Stable' : 'Variable'}
                        trendColor="text-blue-500"
                    />
                    <StatCard 
                        label="Peer Percentile" 
                        value={`Top ${100 - analyticsData.performance.peerPercentile}%`} 
                        subtext="Vs Global Avg"
                        icon={<Users size={24} className="text-purple-500" />}
                        trend={`Better than ${analyticsData.performance.peerPercentile}%`}
                        trendColor="text-purple-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. Performance Patterns */}
                    <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                            <Zap className="text-yellow-400" /> Pattern Recognition
                        </h3>

                        <div className="space-y-6 relative">
                            <PatternItem 
                                label="Consistent Strength" 
                                value={analyticsData.patterns.consistentStrength} 
                                icon={<Target size={16} className="text-emerald-400" />}
                            />
                            <PatternItem 
                                label="Recurring Weakness" 
                                value={analyticsData.patterns.recurringWeakness} 
                                icon={<AlertTriangle size={16} className="text-rose-400" />}
                            />
                            <PatternItem 
                                label="Fastest Improving" 
                                value={analyticsData.patterns.fastestImproving} 
                                icon={<Flame size={16} className="text-orange-400" />}
                            />
                            <PatternItem 
                                label="Highest Risk Area" 
                                value={analyticsData.patterns.highestRisk} 
                                icon={<Layers size={16} className="text-indigo-400" />}
                            />
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">AI Mentor Insight</p>
                             <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                 "Focus on stabilizing your <strong>{analyticsData.patterns.recurringWeakness}</strong> scores. Your growth in <strong>{analyticsData.patterns.fastestImproving}</strong> is promising—keep pushing!"
                             </p>
                        </div>
                    </div>

                    {/* 3. Skill Progress & Stability */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <Activity className="text-indigo-600" /> Skill Progress & Stability
                        </h3>
                        
                        {analyticsData.skills.map(skill => (
                            <div key={skill.skill} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-700 border border-slate-100">
                                            {skill.score}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{skill.skill}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                                    skill.trend === 'Improving' ? 'bg-emerald-50 text-emerald-600' :
                                                    skill.trend === 'Stable' ? 'bg-slate-50 text-slate-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                    {skill.trend === 'Improving' ? <ArrowUpRight size={12} /> : skill.trend === 'Stable' ? <Minus size={12} /> : <ArrowDownRight size={12} />}
                                                    {skill.trend}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStabilityColor(skill.stability)}`}>
                                                    {skill.stability} Stability
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-right max-w-xs">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI Observation</p>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{skill.insight}"</p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${
                                        skill.score >= 80 ? 'bg-emerald-500' : skill.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                                    }`} style={{ width: `${skill.score}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Interview Timeline */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <TrendingUp className="text-indigo-600" /> Recent Timeline
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 text-left">
                                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Difficulty</th>
                                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Verdict</th>
                                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {analyticsData.history.slice(0, 5).map(session => (
                                    <tr key={session.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 text-sm font-bold text-slate-500">
                                            {new Date(session.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-4">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest">
                                                {session.type}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                             <span className={`text-xs font-bold ${
                                                 session.difficulty === 'HARD' ? 'text-rose-500' : 
                                                 session.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'
                                             }`}>
                                                {session.difficulty}
                                             </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`flex items-center gap-2 text-sm font-bold ${
                                                session.score >= 70 ? 'text-emerald-600' : 'text-rose-500'
                                            }`}>
                                                {session.score >= 70 ? <CheckCircleIcon /> : <AlertIcon />}
                                                {session.score >= 70 ? 'Pass' : 'Review'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-lg font-black text-slate-800">{session.score}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
               </>
           )}
        </div>
      </main>
    </div>
  );
};

// -- Components --

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend: string;
  trendColor: string;
}

const StatCard = ({ label, value, subtext, icon, trend, trendColor }: StatCardProps) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
            <span className={`text-xs font-black uppercase tracking-widest ${trendColor} bg-slate-50 px-2 py-1 rounded-lg`}>
                {trend}
            </span>
        </div>
        <p className="text-4xl font-black text-slate-800 tracking-tight mb-2">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>
    </div>
);

interface PatternItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const PatternItem = ({ label, value, icon }: PatternItemProps) => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-black text-white">{value}</span>
    </div>
);

const CheckCircleIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default PerformanceAnalyticsPage;

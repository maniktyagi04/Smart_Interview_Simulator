import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../store/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { Plus, Users, FileText, TrendingUp, Activity, Settings, LogOut, Camera, ChevronRight } from 'lucide-react';
import type { AdminAnalytics } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Logic would go here to upload the image
      console.log("Uploading image...", e.target.files?.[0]);
      setShowProfileMenu(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes] = await Promise.all([
          client.get('/analytics/admin'),
        ]);
        setAnalytics(aRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      }
    };

    fetchData();
  }, []);

  const questionDistribution = [
    { difficulty: 'Easy', count: 30, color: '#10b981' },
    { difficulty: 'Medium', count: 63, color: '#f59e0b' },
    { difficulty: 'Hard', count: 43, color: '#ef4444' },
  ];

  const totalQuestions = questionDistribution.reduce((sum, item) => sum + item.count, 0);
  const mediumPercentage = Math.round((questionDistribution[1].count / totalQuestions) * 100);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-64">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
              <Users className="w-4 h-4" />
              <span className="font-medium">Admin Portal</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-[2px] cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
              >
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                   {user?.avatar ? (
                     <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <span className="font-bold text-sm text-white">{user?.name?.charAt(0) || 'A'}</span>
                   )}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 z-50">
                   <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-bold text-slate-800">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@sis.com'}</p>
                   </div>
                   
                   <div className="p-2 space-y-1">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-left"
                      >
                         <Camera className="w-4 h-4" />
                         Change Photo
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                      />

                      <button 
                        onClick={() => navigate('/admin/profile')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-left"
                      >
                         <Settings className="w-4 h-4" />
                         Settings
                      </button>
                      
                      <div className="h-px bg-slate-100 my-1" />
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                         <LogOut className="w-4 h-4" />
                         Logout
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>


        </header>

        <div className="p-8">
          {/* Add New Question Button */}
          <div className="flex justify-end mb-6">
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-all shadow-lg">
              <Plus className="w-5 h-5" />
              Add New Question
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Students</p>
                  <p className="text-3xl font-bold mt-1">
                    {analytics ? analytics.totalStudents : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Interviews</p>
                  <p className="text-3xl font-bold mt-1">
                    {analytics ? analytics.totalInterviews : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Average Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold">
                        {analytics?.domainStats ? Math.round(analytics.domainStats.reduce((acc: number, curr: { averageScore: number }) => acc + curr.averageScore, 0) / (analytics.domainStats.length || 1)) + '%' : '-'}
                    </p>
                    {analytics && <span className="text-emerald-400 text-sm">↑</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">System Health</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-400">98%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Interview Performance Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Interview Performance</h3>
                  <p className="text-sm text-slate-400 mt-1">Rating Average (Last 6 Months)</p>
                </div>
                <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                  <option>Monthly</option>
                  <option>Weekly</option>
                </select>
              </div>

              {/* Simple Line Chart */}
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 600 200">
                  {/* Grid lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="4" />

                  {/* Success Rate Line (Purple) */}
                  <polyline
                    points="50,140 150,130 250,100 350,80 450,60 550,40"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                  />
                  {/* Success Rate Points */}
                  <circle cx="50" cy="140" r="4" fill="#8b5cf6" />
                  <circle cx="150" cy="130" r="4" fill="#8b5cf6" />
                  <circle cx="250" cy="100" r="4" fill="#8b5cf6" />
                  <circle cx="350" cy="80" r="4" fill="#8b5cf6" />
                  <circle cx="450" cy="60" r="4" fill="#8b5cf6" />
                  <circle cx="550" cy="40" r="4" fill="#8b5cf6" />

                  {/* Failure Rate Line (Red) */}
                  <polyline
                    points="50,120 150,125 250,135 350,145 450,155 550,160"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                  />
                  {/* Failure Rate Points */}
                  <circle cx="50" cy="120" r="4" fill="#ef4444" />
                  <circle cx="150" cy="125" r="4" fill="#ef4444" />
                  <circle cx="250" cy="135" r="4" fill="#ef4444" />
                  <circle cx="350" cy="145" r="4" fill="#ef4444" />
                  <circle cx="450" cy="155" r="4" fill="#ef4444" />
                  <circle cx="550" cy="160" r="4" fill="#ef4444" />

                  {/* X-axis labels */}
                  <text x="50" y="190" fill="#94a3b8" fontSize="12" textAnchor="middle">JAN</text>
                  <text x="150" y="190" fill="#94a3b8" fontSize="12" textAnchor="middle">FEB</text>
                  <text x="250" y="190" fill="#94a3b8" fontSize="12" textAnchor="middle">MAR</text>
                  <text x="350" y="190" fill="#94a3b8" fontSize="12" textAnchor="middle">APR</text>
                  <text x="450" y="190" fill="#94a3b8" fontSize="12" textAnchor="middle">MAY</text>
                  <text x="550" y="190" fill="#94a3b8" fontSize="12" textAnchor="middle">JUN</text>
                </svg>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-slate-400">Success Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-slate-400">Failure Rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold">Question Distribution</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-400">Weakest Domain:</span>
                  <span className="text-sm text-red-400 font-bold">DSA</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-500">82 Concept Gaps</span>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="relative flex items-center justify-center mb-6">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40" strokeDasharray="150 350" transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray="200 300" strokeDashoffset="-150" transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="40" strokeDasharray="135 365" strokeDashoffset="-350" transform="rotate(-90 100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{mediumPercentage}%</p>
                  </div>
                </div>
              </div>

              {/* Recently Added */}
              <div className="mb-4">
                <h4 className="text-sm font-bold mb-3">Recently Added</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    <span className="text-slate-300">Find the Duplicate Number</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    <span className="text-slate-300">Implement LRU Cache</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    <span className="text-slate-300">Reverse a Linked List</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-400">Easy</span>
                  </div>
                  <span className="text-slate-300">30 questions</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-slate-400">Medium</span>
                  </div>
                  <span className="text-slate-300">63 questions</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-400">Hard</span>
                  </div>
                  <span className="text-slate-300">43 questions</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-indigo-400">4 Total</span>
                    <span className="text-emerald-400">↑ 52.7%</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

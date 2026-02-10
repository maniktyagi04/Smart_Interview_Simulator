import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Users, Activity, UserX, ChevronDown, MoreVertical, Calendar, Ban, UserCheck, X, Filter, AlertCircle } from 'lucide-react';
import { TableSkeleton } from '../components/SkeletonLoader';
import AdminSidebar from '../components/AdminSidebar';

interface Student {
  id: string;
  name: string;
  email: string;
  interviews: number;
  studentId: string;
  status: 'active' | 'banned';
  lastActive?: string;
  scheduledInterview?: {
    date: string;
    time: string;
  };
}

const ManageStudents: React.FC = () => {

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await client.get('/analytics/admin/students');
        const studentsWithActivity = (res.data || []).map((s: Student) => ({
          ...s,
          lastActive: s.lastActive || new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
        }));
        setStudents(studentsWithActivity);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch students', error);
        setError('Failed to load students. Please check if the backend server is running.');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu-container') && !target.closest('.filter-container')) {
        setOpenMenuId(null);
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white font-sans">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8">
           <div className="animate-pulse space-y-8">
              <div className="h-10 w-64 bg-slate-800 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl" />
                ))}
              </div>
              <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl" />
           </div>
        </main>
      </div>
    );
  }


  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const flaggedStudents = students.filter(s => s.status === 'banned').length;

  // Filter students based on active filter
  const filteredStudents = students.filter(student => {
    if (activeFilter === 'nearest') {
      return student.scheduledInterview !== undefined;
    }
    if (activeFilter === 'never') {
      return student.interviews === 0;
    }
    if (activeFilter === 'banned') {
      return student.status === 'banned';
    }
    return true; // 'all' filter
  });

  const handleBanStudent = async (studentId: string) => {
    try {
      await client.patch(`/users/${studentId}/ban`);
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, status: 'banned' as const } : s
      ));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to ban student', error);
      alert('Failed to ban student. Please try again.');
    }
  };

  const handleUnbanStudent = async (studentId: string) => {
    try {
      await client.patch(`/users/${studentId}/unban`);
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, status: 'active' as const } : s
      ));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to unban student', error);
      alert('Failed to unban student. Please try again.');
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedStudent || !scheduleDate || !scheduleTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      await client.post(`/users/${selectedStudent.id}/schedule-interview`, {
        date: scheduleDate,
        time: scheduleTime
      });
      
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, scheduledInterview: { date: scheduleDate, time: scheduleTime } } 
          : s
      ));
      
      setScheduleModalOpen(false);
      setSelectedStudent(null);
      setScheduleDate('');
      setScheduleTime('');
    } catch (error) {
      console.error('Failed to schedule interview', error);
      alert('Failed to schedule interview. Please try again.');
    }
  };

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto ml-64">
        {/* Header */}
        <header className="bg-slate-900/50 border-b border-slate-800 px-8 py-6">
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage student access, interviews, and permissions</p>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Students */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Total Students</p>
                  <p className="text-4xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </div>

            {/* Active Students */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Active Students</p>
                  <p className="text-4xl font-bold">{activeStudents}</p>
                </div>
              </div>
            </div>

            {/* Banned Students */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <UserX className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Banned Students</p>
                  <p className="text-4xl font-bold">{flaggedStudents}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-rose-900/20 border border-rose-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-400">Error Loading Students</h3>
                  <p className="text-slate-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            {/* Single Filter Button */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                All Students ({filteredStudents.length})
              </h2>
              
              <div className="relative filter-container">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10 py-2">
                    <button
                      onClick={() => { setActiveFilter('all'); setFilterOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        activeFilter === 'all' 
                          ? 'bg-indigo-600/20 text-indigo-400 font-bold' 
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      All Students
                    </button>
                    <button
                      onClick={() => { setActiveFilter('nearest'); setFilterOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        activeFilter === 'nearest' 
                          ? 'bg-indigo-600/20 text-indigo-400 font-bold' 
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Nearest Interview Students
                    </button>
                    <button
                      onClick={() => { setActiveFilter('never'); setFilterOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        activeFilter === 'never' 
                          ? 'bg-indigo-600/20 text-indigo-400 font-bold' 
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Never Interviewed Students
                    </button>
                    <button
                      onClick={() => { setActiveFilter('banned'); setFilterOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        activeFilter === 'banned' 
                          ? 'bg-indigo-600/20 text-indigo-400 font-bold' 
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Banned Students
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Interviews</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4">
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No students found.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => {
                      const isLastItems = filteredStudents.length > 2 && index >= filteredStudents.length - 1;
                      return (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold border border-indigo-600/30">
                            {student.name ? student.name[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{student.name}</div>
                            {student.status === 'banned' && (
                              <span className="text-xs text-rose-400 font-medium">Banned</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{student.email}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{student.interviews}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatLastActive(student.lastActive)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center relative action-menu-container">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === student.id ? null : student.id);
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === student.id && (
                            <div className={`absolute right-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 ${
                                isLastItems ? 'bottom-full mb-2' : 'top-full mt-1'
                            }`}>
                              {student.status === 'active' ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedStudent(student);
                                      setScheduleModalOpen(true);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Set Interview
                                  </button>
                                  <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBanStudent(student.id);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                  >
                                    <Ban className="w-4 h-4" />
                                    Ban Student
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnbanStudent(student.id);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Unban Student
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }))}

                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {filteredStudents.length} of {totalStudents} students
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Set Interview Modal */}
      {scheduleModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Schedule Interview</h3>
                <p className="text-sm text-slate-400 mt-1">{selectedStudent.name}</p>
              </div>
              <button
                onClick={() => {
                  setScheduleModalOpen(false);
                  setSelectedStudent(null);
                  setScheduleDate('');
                  setScheduleTime('');
                }}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Interview Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Interview Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setScheduleModalOpen(false);
                  setSelectedStudent(null);
                  setScheduleDate('');
                  setScheduleTime('');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-600/20"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;


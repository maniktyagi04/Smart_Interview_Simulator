import React, { useState, useEffect } from 'react';

import { useAuth } from '../store/AuthContext';
import { 
  Search, Filter, Plus, Edit2, Trash2, 
  Database, Code, Layout, Users, ChevronDown, CheckCircle, 
  AlertCircle, Download, Globe
} from 'lucide-react';
import QuestionModal from '../components/QuestionModal';
import ImportQuestionsModal from '../components/ImportQuestionsModal';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';

interface Question {
  id: string;
  title: string;
  type: string;
  domain: string;
  difficulty: string;
  status: string;
  source: string;
  category?: string;
  topic?: string;
  problemStatement?: string;
  externalSource?: string;
  createdAt: string;
}

const ManageQuestions: React.FC = () => {
  const { token } = useAuth();
  
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5005/api/questions', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          category: filterCategory !== 'ALL' ? filterCategory : undefined,
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
          search: searchQuery || undefined
        }
      });
        
      if (Array.isArray(response.data)) {
         setQuestions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterStatus, searchQuery]);



  const handleCreateQuestion = async (data: Partial<Question>) => {
    try {
      await axios.post('http://localhost:5005/api/questions', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions();
    } catch (error) {
      console.error('Failed to create question:', error);
      alert('Failed to create question');
    }
  };

  const handleUpdateQuestion = async (data: Partial<Question>) => {
    if (!selectedQuestion) return;
    try {
      await axios.put(`http://localhost:5005/api/questions/${selectedQuestion.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions();
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axios.delete(`http://localhost:5005/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const openEditModal = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'HARD': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'DSA': return <Code className="w-4 h-4" />;
      case 'SYSTEM_DESIGN': return <Layout className="w-4 h-4" />;
      case 'BEHAVIORAL': return <Users className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <AdminSidebar />


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
            <p className="text-slate-400">Manage interview questions and import from external sources.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 transition-colors bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20"
            >
              <Download className="w-4 h-4" />
              Import Questions
            </button>
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, topic or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="DSA">DSA</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="BEHAVIORAL">Behavioral</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
            </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          /* Table */
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <tr key={q.id} className="group hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white mb-0.5">{q.title || 'Untitled Question'}</div>
                        <div className="text-xs text-slate-500">{q.topic || 'General'}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-sm text-slate-300">
                            {getCategoryIcon(q.category)}
                            <span>{q.category || 'N/A'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {q.source === 'IMPORTED' ? (
                           <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                             <Globe className="w-3 h-3" />
                             {q.externalSource || 'Public'}
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                             <Users className="w-3 h-3" />
                             Admin
                           </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         {q.status === 'ACTIVE' ? (
                           <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                             Active
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                             Draft
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(q)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                           <AlertCircle className="w-6 h-6 text-slate-600" />
                        </div>
                        <p>No questions found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSubmit={selectedQuestion ? handleUpdateQuestion : handleCreateQuestion}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={(selectedQuestion as any) || undefined}
      />
      
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchQuestions}
      />
    </div>
  );
};

export default ManageQuestions;

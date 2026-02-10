import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle } from 'lucide-react';

interface QuestionFormData {
  title: string;
  category: string;
  topic: string;
  domain: string;
  difficulty: string;
  problemStatement: string;
  idealAnswer: string;
  rubric: string;
  keyConcepts: string;
  evaluationNotes: string;
  status: string;
  type: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  initialData?: Partial<QuestionFormData>;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    category: 'DSA',
    topic: '',
    domain: 'DSA',
    difficulty: 'MEDIUM',
    problemStatement: '',
    idealAnswer: '',
    rubric: '',
    keyConcepts: '',
    evaluationNotes: '',
    status: 'ACTIVE',
    type: 'TECHNICAL'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'DSA',
        topic: initialData.topic || '',
        domain: initialData.domain || 'DSA',
        difficulty: initialData.difficulty || 'MEDIUM',
        problemStatement: initialData.problemStatement || '',
        idealAnswer: initialData.idealAnswer || '',
        rubric: initialData.rubric || '',
        keyConcepts: initialData.keyConcepts || '',
        evaluationNotes: initialData.evaluationNotes || '',
        status: initialData.status || 'ACTIVE',
        type: initialData.type || 'TECHNICAL'
      });
    } else {
      setFormData({
        title: '',
        category: 'DSA',
        topic: '',
        domain: 'DSA',
        difficulty: 'MEDIUM',
        problemStatement: '',
        idealAnswer: '',
        rubric: '',
        keyConcepts: '',
        evaluationNotes: '',
        status: 'ACTIVE',
        type: 'TECHNICAL'
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button onClick={onClose} className="p-2 transition-colors rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="DSA">DSA</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="BEHAVIORAL">Behavioral</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Domain</label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="DSA">DSA</option>
                <option value="WEB_DEV">Web Development</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="ML">Machine Learning</option>
                <option value="DATA_ANALYST">Data Analyst</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="DATABASE">Database</option>
                <option value="CORE_CS">Core CS</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g. Dynamic Programming"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Question Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Interview Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="TECHNICAL">Technical</option>
                <option value="HR">HR</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Problem Statement</label>
            <textarea
              name="problemStatement"
              value={formData.problemStatement}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the problem in detail. Supports Markdown."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Key Concepts (Comma separated)</label>
              <input
                type="text"
                name="keyConcepts"
                value={formData.keyConcepts}
                onChange={handleChange}
                placeholder="e.g. Arrays, Recursion, Time Complexity"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Ideal Answer / Solution Approach</label>
            <textarea
              name="idealAnswer"
              value={formData.idealAnswer}
              onChange={handleChange}
              rows={4}
              placeholder="Outline the expected solution or key points to cover."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Rubric / Evaluation Criteria</label>
              <textarea
                name="rubric"
                value={formData.rubric}
                onChange={handleChange}
                rows={3}
                placeholder="Criteria for scoring the candidate."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-indigo-400">
                <CheckCircle className="w-4 h-4" />
                Evaluation Notes (Admin Only)
              </label>
              <textarea
                name="evaluationNotes"
                value={formData.evaluationNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Private notes for interviewers/admins."
                className="w-full px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y text-sm"
              />
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 -mx-6 -mb-6 border-t bg-slate-900 border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;

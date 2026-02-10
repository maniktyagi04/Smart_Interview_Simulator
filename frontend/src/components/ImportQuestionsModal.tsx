import React, { useState } from 'react';
import { X, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import client from '../api/client';
// import { useAuth } from '../store/AuthContext';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Removed unused useAuth hook after client migration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    limit: 20,
    minRating: 800,
    maxRating: 2000,
    tags: 'two pointers, dp, greedy'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Parse tags
      const tagsArray = filters.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

      const response = await client.post(
        '/questions/import/codeforces',
        {
          limit: Number(filters.limit),
          minRating: Number(filters.minRating),
          maxRating: Number(filters.maxRating),
          tags: tagsArray
        }
      );

      setSuccessMsg(`Successfully imported ${response.data.count} questions!`);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccessMsg(null);
      }, 2000);
      
    } catch (err: unknown) {
      console.error('Import failed:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (err as any).response?.data?.message || 'Failed to import questions. Please check the backend connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-400" />
             </div>
             <h2 className="text-lg font-bold text-white">Import from Codeforces</h2>
          </div>
          <button onClick={onClose} className="p-2 transition-colors rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-900/30">
            <p className="text-sm text-blue-300">
              Bulk import DSA questions directly from Codeforces public usage API. No API key required.
            </p>
          </div>

           <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Limit (Max Questions)</label>
            <input
              type="number"
              name="limit"
              value={filters.limit}
              onChange={handleChange}
              min={1}
              max={100}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Min Rating</label>
              <input
                type="number"
                name="minRating"
                value={filters.minRating}
                onChange={handleChange}
                step={100}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Max Rating</label>
              <input
                type="number"
                name="maxRating"
                value={filters.maxRating}
                onChange={handleChange}
                step={100}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

           <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tags (Comma Separated)</label>
            <input
              type="text"
              name="tags"
              value={filters.tags}
              onChange={handleChange}
              placeholder="dp, graphs, greedy..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-400 border rounded-lg bg-red-900/10 border-red-900/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-400 border rounded-lg bg-emerald-900/10 border-emerald-900/30">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-900 border-t border-slate-800">
           <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportQuestionsModal;

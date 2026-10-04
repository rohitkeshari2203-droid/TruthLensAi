import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkX, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { analyzeApi } from '../services/api';
import { Analysis } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { useAuth } from '../context/AuthContext';

export const SavedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedAnalyses, setSavedAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, [user]);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await analyzeApi.getSavedAnalyses();
      setSavedAnalyses(data);
    } catch {
      // Fallback
      setSavedAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await analyzeApi.removeSavedAnalysis(id);
      setSavedAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Bookmark className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view saved items</h2>
        <p className="text-xs text-slate-500">
          Bookmarking enables you to organize, reference, and export critical verification reports.
        </p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Analyses</h1>
        <p className="text-xs text-slate-500 mt-1">
          Your bookmarked reports and fact-checking dossiers.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading saved items...</p>
        </div>
      ) : savedAnalyses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">No saved analyses yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When reviewing verification results, click the "Bookmark" button to save reports here.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
          >
            Start Verifying Claims <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedAnalyses.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider">
                    {item.input_type}
                  </span>
                  <span>·</span>
                  <span>{item.detected_language.name}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {item.claims[0]?.claim_text || item.original_text}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-1 italic">
                  "{item.explanation}"
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <VerdictBadge verdict={item.prediction} size="sm" />

                <div className="flex items-center gap-2">
                  <Link
                    to={`/analysis/${item.id}`}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded transition-colors"
                  >
                    View Report
                  </Link>

                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    title="Remove from saved"
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <BookmarkX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

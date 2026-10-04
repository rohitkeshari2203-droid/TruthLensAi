import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { analyzeApi } from '../services/api';
import { Analysis } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { useAuth } from '../context/AuthContext';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, [verdictFilter, languageFilter]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await analyzeApi.getAnalyses({
        verdict: verdictFilter || undefined,
        language: languageFilter || undefined,
        search: search || undefined,
      });
      setAnalyses(res.analyses);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalyses();
  };

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await analyzeApi.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setFeedbackMsg('Analysis deleted successfully.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Failed to delete analysis');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Verification History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and filter all previously evaluated statements and news articles.
          </p>
        </div>

        <Link
          to="/analyze"
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
        >
          Verify New Claim
        </Link>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-lg animate-in fade-in">
          {feedbackMsg}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, headlines, or claims..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="text-xs py-2 px-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="">All Verdicts</option>
            <option value="Likely True">Likely True</option>
            <option value="Likely False">Likely False</option>
            <option value="Misleading">Misleading</option>
            <option value="Partially Supported">Partially Supported</option>
            <option value="Unverified">Unverified</option>
            <option value="Insufficient Evidence">Insufficient Evidence</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="text-xs py-2 px-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>

          {(search || verdictFilter || languageFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setVerdictFilter('');
                setLanguageFilter('');
              }}
              className="text-xs text-indigo-600 hover:underline px-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading history records...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No analyses matched your filters.</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or verify a new claim.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((item) => (
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
                <div className="text-right">
                  <VerdictBadge verdict={item.prediction} size="sm" />
                  <span className="block text-[11px] text-slate-400 mt-1">
                    Score: <strong>{item.credibility_score}/100</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/analysis/${item.id}`}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded transition-colors"
                  >
                    View
                  </Link>

                  {user && (item.user_id === user.id || user.role === 'ADMIN') && (
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete record"
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

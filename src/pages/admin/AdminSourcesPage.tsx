import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { adminApi, analyzeApi } from '../../services/api';
import { Source, SourceCategory, VerificationStatus } from '../../types';
import { Globe2, Plus, ShieldCheck, Check, Search } from 'lucide-react';

export const AdminSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New source form state
  const [domain, setDomain] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [reputationScore, setReputationScore] = useState(85);
  const [category, setCategory] = useState<SourceCategory>('MAINSTREAM_NEWS');
  const [status, setStatus] = useState<VerificationStatus>('VERIFIED');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await analyzeApi.getSources();
      setSources(data);
    } catch (err) {
      console.error('Failed to load sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !sourceName) return;

    setSubmitting(true);
    try {
      const saved = await adminApi.upsertSource({
        domain,
        source_name: sourceName,
        reputation_score: reputationScore,
        category,
        verification_status: status,
        description,
      });

      setSources((prev) => {
        const idx = prev.findIndex((s) => s.domain.toLowerCase() === saved.domain.toLowerCase());
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });

      setModalOpen(false);
      setDomain('');
      setSourceName('');
      setDescription('');
      setSourceMsg({ text: 'Source reputation saved successfully.' });
      setTimeout(() => setSourceMsg(null), 3000);
    } catch (err: any) {
      setSourceMsg({ text: err.message || 'Failed to save source', error: true });
      setTimeout(() => setSourceMsg(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const [sourceMsg, setSourceMsg] = useState<{ text: string; error?: boolean } | null>(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Source Reputation Registry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Curate domain authority ratings, official status, and historical credibility weighting.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Trusted Source
          </button>
        </div>

        {sourceMsg && (
          <div
            className={`p-3 rounded-md text-xs font-medium animate-in fade-in ${
              sourceMsg.error ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {sourceMsg.text}
          </div>
        )}

        {/* Source Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Source Name</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reputation Score</th>
                  <th className="px-4 py-3 text-right">Last Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{src.source_name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{src.domain}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-600 font-medium">
                        {src.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          src.verification_status === 'OFFICIAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : src.verification_status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {src.verification_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              src.reputation_score >= 80
                                ? 'bg-emerald-500'
                                : src.reputation_score >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${src.reputation_score}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{src.reputation_score}/100</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-[11px]">
                      {new Date(src.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal to add/update source */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Add / Update Source Reputation</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSource} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Domain (e.g. apnews.com)
                  </label>
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source Name
                  </label>
                  <input
                    type="text"
                    required
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reputation Score (0-100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={reputationScore}
                      onChange={(e) => setReputationScore(parseInt(e.target.value, 10))}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="MAINSTREAM_NEWS">Mainstream News</option>
                      <option value="OFFICIAL">Official / Govt</option>
                      <option value="FACT_CHECK">Fact Checking</option>
                      <option value="ACADEMIC">Academic / Research</option>
                      <option value="USER_CONTENT">User Content</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="OFFICIAL">OFFICIAL</option>
                    <option value="QUESTIONABLE">QUESTIONABLE</option>
                    <option value="UNVERIFIED">UNVERIFIED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Editorial Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
                  >
                    {submitting ? 'Saving...' : 'Save Source'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

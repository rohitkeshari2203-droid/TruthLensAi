import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { adminApi } from '../../services/api';
import { Report } from '../../types';
import { Flag, Check, X, Calendar, ExternalLink } from 'lucide-react';
import { VerdictBadge } from '../../components/VerdictBadge';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const [reportMsg, setReportMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handleUpdateStatus = async (id: string, status: 'REVIEWED' | 'DISMISSED') => {
    try {
      const updated = await adminApi.updateReportStatus(id, status);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      );
      setReportMsg({ text: `Report status updated to ${status}.` });
      setTimeout(() => setReportMsg(null), 3000);
    } catch (err: any) {
      setReportMsg({ text: err.message || 'Failed to update report status', error: true });
      setTimeout(() => setReportMsg(null), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            User Disputes & Flagged Analyses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review user-submitted disputes regarding analysis accuracy, stance classifications, or new evidence.
          </p>
        </div>

        {reportMsg && (
          <div
            className={`p-3 rounded-md text-xs font-medium animate-in fade-in ${
              reportMsg.error ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {reportMsg.text}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No active user disputes.</p>
            <p className="text-xs text-slate-500">All submitted reports have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        report.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : report.status === 'REVIEWED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      Reason: {report.reason}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>

                {report.analysis && (
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target Analysis:</span>
                      <VerdictBadge verdict={report.analysis.prediction} size="sm" />
                    </div>
                    <p className="text-slate-800 font-medium line-clamp-2">
                      "{report.analysis.original_text}"
                    </p>
                    <Link
                      to={`/analysis/${report.analysis.id}`}
                      target="_blank"
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1 text-[11px] font-semibold mt-1"
                    >
                      Inspect Report in New Tab <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {report.details && (
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-700 block mb-0.5">User Feedback:</strong>
                    <p className="bg-white p-2.5 rounded border border-slate-200 italic">
                      "{report.details}"
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded cursor-pointer transition-colors"
                      >
                        Dismiss Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

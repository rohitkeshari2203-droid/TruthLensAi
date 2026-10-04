import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { adminApi } from '../../services/api';
import {
  Users,
  FileCheck,
  Flag,
  Globe2,
  Server,
  Activity,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System & AI Health Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational status of verification pipeline, user sessions, and model latency.
          </p>
        </div>

        {loading || !stats ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading system metrics...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Registered Users</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Total Analyses Run</span>
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.totalAnalyses}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>User Disputes / Reports</span>
                  <Flag className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold text-rose-600">{stats.pendingReports}</div>
                <span className="text-[10px] text-slate-400">pending review</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Tracked News Sources</span>
                  <Globe2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.totalSourcesTracked}</div>
              </div>
            </div>

            {/* Model & Architecture Stats */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  AI & RAG Pipeline Configuration
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  HEALTHY / OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Primary Inference Engine</span>
                  <strong className="text-slate-800">gemini-3.8-flash (via @google/genai)</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Grounding Capability</span>
                  <strong className="text-slate-800">Google Search Live Grounding RAG</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Average Credibility Score</span>
                  <strong className="text-slate-800">{stats.avgCredibilityScore}/100</strong>
                </div>
              </div>
            </div>

            {/* Breakdown Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Verdict Breakdown
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(stats.verdictCounts || {}).map(([verdict, count]: any) => (
                    <div key={verdict} className="flex items-center justify-between">
                      <span className="text-slate-700">{verdict}</span>
                      <strong className="text-slate-900">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Ingested Language Distribution
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(stats.languageCounts || {}).map(([lang, count]: any) => (
                    <div key={lang} className="flex items-center justify-between">
                      <span className="text-slate-700">{lang}</span>
                      <strong className="text-slate-900">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

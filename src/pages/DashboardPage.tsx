import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Activity,
  Globe2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { analyzeApi } from '../services/api';
import { Analysis } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';

export const DashboardPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const analysesRes = await analyzeApi.getAnalyses();
      setAnalyses(analysesRes.analyses);

      try {
        const savedRes = await analyzeApi.getSavedAnalyses();
        setSavedCount(savedRes.length);
      } catch {
        // Not logged in or no saved items yet
        setSavedCount(1);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics computation
  const totalAnalyses = analyses.length;
  const likelyTrueCount = analyses.filter((a) => a.prediction === 'Likely True').length;
  const likelyFalseCount = analyses.filter((a) => a.prediction === 'Likely False').length;
  const misleadingCount = analyses.filter((a) => a.prediction === 'Misleading').length;
  const partiallySupportedCount = analyses.filter((a) => a.prediction === 'Partially Supported').length;
  const unverifiedCount = analyses.filter(
    (a) => a.prediction === 'Unverified' || a.prediction === 'Insufficient Evidence'
  ).length;

  // Verdict distribution for PieChart
  const verdictDistributionData = [
    { name: 'Likely True', value: likelyTrueCount, color: '#10b981' },
    { name: 'Likely False', value: likelyFalseCount, color: '#f43f5e' },
    { name: 'Misleading', value: misleadingCount, color: '#f59e0b' },
    { name: 'Partially Supported', value: partiallySupportedCount, color: '#0ea5e9' },
    { name: 'Unverified / Insufficient', value: unverifiedCount, color: '#94a3b8' },
  ].filter((item) => item.value > 0);

  // Language breakdown data
  const languageMap: Record<string, number> = {};
  for (const a of analyses) {
    const lang = a.detected_language?.name || 'English';
    languageMap[lang] = (languageMap[lang] || 0) + 1;
  }
  const languageData = Object.entries(languageMap).map(([name, count]) => ({
    language: name,
    count,
  }));

  // Timeline / Trend data
  const dateMap: Record<string, { total: number; likelyFalse: number; likelyTrue: number }> = {};
  for (const a of analyses) {
    const dateStr = new Date(a.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (!dateMap[dateStr]) {
      dateMap[dateStr] = { total: 0, likelyFalse: 0, likelyTrue: 0 };
    }
    dateMap[dateStr].total += 1;
    if (a.prediction === 'Likely False') dateMap[dateStr].likelyFalse += 1;
    if (a.prediction === 'Likely True') dateMap[dateStr].likelyTrue += 1;
  }
  const trendData = Object.entries(dateMap).map(([date, d]) => ({
    date,
    total: d.total,
    likelyFalse: d.likelyFalse,
    likelyTrue: d.likelyTrue,
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics, verification breakdown, and recent claim evaluations.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
        >
          Verify New Claim
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Analyses</span>
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalAnalyses}</div>
          <span className="text-[11px] text-slate-400">Claims ingested to date</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Likely True</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{likelyTrueCount}</div>
          <span className="text-[11px] text-slate-400">
            {totalAnalyses ? Math.round((likelyTrueCount / totalAnalyses) * 100) : 0}% of total
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Likely False / Hoaxes</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{likelyFalseCount}</div>
          <span className="text-[11px] text-slate-400">
            {totalAnalyses ? Math.round((likelyFalseCount / totalAnalyses) * 100) : 0}% of total
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Unverified / Uncertain</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-700">{unverifiedCount}</div>
          <span className="text-[11px] text-slate-400">Lacking conclusive proof</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Saved Items</span>
            <Bookmark className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{savedCount}</div>
          <span className="text-[11px] text-slate-400">Bookmarked reports</span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Verdict Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verdict Distribution</h3>
              <p className="text-xs text-slate-500">Credibility verdicts across evaluated claims</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verdictDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {verdictDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} analyses`, 'Count']}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Multilingual Language Breakdown Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multilingual Ingestion Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution by detected language</p>
            </div>
            <Globe2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="language" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} analyses`, 'Count']}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Verification Trend Over Time */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Analysis Volume & Trend Over Time</h3>
              <p className="text-xs text-slate-500">Total claims submitted and falsehood detection rates</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4f46e5"
                  fill="#e0e7ff"
                  name="Total Claims"
                />
                <Area
                  type="monotone"
                  dataKey="likelyFalse"
                  stroke="#f43f5e"
                  fill="#ffe4e6"
                  name="Likely False"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Claim Evaluations</h3>
            <p className="text-xs text-slate-500">Latest analyses processed by TruthLens AI</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View Full History →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Claim Assertion</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {analyses.slice(0, 5).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 max-w-sm truncate font-medium text-slate-900">
                    {a.claims[0]?.claim_text || a.original_text}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{a.input_type}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.detected_language?.name || 'English'}
                  </td>
                  <td className="px-4 py-3">
                    <VerdictBadge verdict={a.prediction} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{a.confidence}%</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/analysis/${a.id}`}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

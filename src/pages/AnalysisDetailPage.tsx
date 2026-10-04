import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  Flag,
  Download,
  ExternalLink,
  Calendar,
  Languages,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Check,
  Copy,
  Info,
  Layers,
} from 'lucide-react';
import { analyzeApi } from '../services/api';
import { Analysis } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { EvidenceCard } from '../components/EvidenceCard';
import { useAuth } from '../context/AuthContext';

export const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('CONTRADICTORY_EVIDENCE');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Copy feedback state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadAnalysis(id);
  }, [id]);

  const loadAnalysis = async (analysisId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeApi.getAnalysisById(analysisId);
      setAnalysis(data.analysis);
      setIsSaved(data.isSaved);
    } catch (err: any) {
      setError(err.message || 'Analysis record could not be found.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!analysis) return;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await analyzeApi.removeSavedAnalysis(analysis.id);
        setIsSaved(false);
      } else {
        await analyzeApi.saveAnalysis(analysis.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error updating bookmark:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis) return;
    setReportSubmitting(true);
    try {
      await analyzeApi.reportAnalysis(analysis.id, reportReason, reportDetails);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
        setReportDetails('');
      }, 1800);
    } catch (err) {
      console.error('Report submission failed:', err);
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Retrieving verification report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analysis Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'The requested analysis does not exist.'}</p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Verify Another Claim
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 print:p-0 print:m-0">
      {/* Action Bar (Back, Save, Share, Export, Report) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Verify Another Claim
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSaved
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                Bookmark
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied Link' : 'Share'}
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Print / PDF
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-rose-600" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Main Verdict Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Automated Credibility Verdict
            </span>
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={analysis.prediction} size="lg" />
              <span className="text-xs text-slate-500 font-medium">
                Confidence: <strong className="text-slate-800">{analysis.confidence}%</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Credibility Score
              </span>
              <div className="text-2xl font-black text-indigo-700">
                {analysis.credibility_score}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-slate-200" />

            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Language:{' '}
                  <strong className="text-slate-700 font-semibold">
                    {analysis.detected_language.name} ({analysis.detected_language.code.toUpperCase()})
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Original Content & Claims */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Original Input ({analysis.input_type})
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed font-serif">
            "{analysis.original_text}"
          </div>
          {analysis.source_url && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              Source URL:
              <a
                href={analysis.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-mono truncate max-w-md"
              >
                {analysis.source_url}
              </a>
            </p>
          )}
        </div>

        {/* Isolated Factual Claims */}
        {analysis.claims && analysis.claims.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Extracted Factual Claims ({analysis.claims.length})
            </h4>
            <div className="space-y-2">
              {analysis.claims.map((claim, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-md p-3 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900 block">{claim.claim_text}</span>
                    <span className="text-[10px] text-slate-400">
                      Type: {claim.claim_type} · Confidence: {claim.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explainable AI (XAI) Synthesis */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Why was this assessment generated?</h3>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
            {analysis.explanation}
          </p>

          {/* Key Reasoning Factors */}
          {analysis.xai_factors && analysis.xai_factors.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {analysis.xai_factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex items-start gap-2.5"
                >
                  {factor.impact === 'POSITIVE' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : factor.impact === 'NEGATIVE' ? (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                      {factor.category} Factor
                    </span>
                    <p className="text-slate-600 mt-0.5 leading-snug">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verified Evidence Section (Section 13) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Retrieved Evidence & Verified Citations
            </h3>
            <p className="text-xs text-slate-500">
              Cross-referenced from registered news agencies, fact-checkers, and government databases.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            {analysis.evidence.length} Sources Found
          </span>
        </div>

        {analysis.evidence.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center space-y-2">
            <Info className="w-6 h-6 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No Evidence Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No reliable evidence was found to confidently verify this claim. This statement may be
              too recent, hyper-localized, or unsupported by public reporting.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {analysis.evidence.map((ev, idx) => (
              <EvidenceCard key={idx} evidence={ev} />
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Academic Disclaimer */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
        <strong>Academic & Transparency Notice:</strong> Credibility score represents an engineering
        confidence indicator synthesized from ML linguistic analysis and retrieved external evidence.
        TruthLens AI does not claim infallible truth determination. Always verify critical decisions with
        primary legal, medical, or regulatory authorities.
      </div>

      {/* Report Issue Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                Report Analysis Issue
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs text-center font-medium">
                Thank you. Your dispute report has been registered for editorial review.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispute Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="CONTRADICTORY_EVIDENCE">Contradictory evidence was ignored</option>
                    <option value="MISINTERPRETED_CLAIM">The claim text was parsed incorrectly</option>
                    <option value="WRONG_STANCE">Evidence stance was incorrectly classified</option>
                    <option value="OUTDATED_INFORMATION">Reporting has changed since publication</option>
                    <option value="OTHER">Other editorial discrepancy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Details or Source URLs (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional context or links to counter-evidence..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

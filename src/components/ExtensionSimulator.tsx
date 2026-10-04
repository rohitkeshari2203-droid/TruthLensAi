import React, { useState } from 'react';
import { VerdictBadge } from './VerdictBadge';
import {
  Puzzle,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Download,
  Globe,
  Loader2,
  FileCode,
} from 'lucide-react';
import { analyzeApi } from '../services/api';
import { Analysis } from '../types';

interface ExtensionSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
}

export const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({
  isOpen,
  onClose,
  initialUrl = 'https://reuters.com/world/india-renewable-energy-record',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [selectedText, setSelectedText] = useState(
    'Government officials announced nationwide renewable energy capacity exceeded 30% during the latest fiscal evaluation.'
  );
  const [activeTab, setActiveTab] = useState<'POPUP' | 'CODE'>('POPUP');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyCurrentPage = async () => {
    setLoading(true);
    setError(null);
    try {
      // Analyze the selected text or page URL
      const res = await analyzeApi.analyzeText(selectedText, 'TEXT');
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Extension could not connect to TruthLens background verification worker.');
    } finally {
      setLoading(false);
    }
  };

  const [downloadNotice, setDownloadNotice] = useState(false);

  const downloadExtensionZip = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-500 flex items-center justify-center text-white">
              <Puzzle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">TruthLens Chrome Extension (Manifest V3)</h3>
              <p className="text-[11px] text-slate-300">Live Browser Integration & Popup Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadExtensionZip}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install / Load Extension
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('POPUP')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'POPUP'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Popup UI Preview
          </button>
          <button
            onClick={() => setActiveTab('CODE')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'CODE'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Manifest V3 Code Structure
          </button>
        </div>

        {downloadNotice && (
          <div className="bg-indigo-50 border-b border-indigo-200 text-indigo-900 p-3 text-xs leading-relaxed animate-in fade-in">
            <strong>Extension Package:</strong> Located in the <code>/extension</code> directory, complete with <code>manifest.json</code>, <code>background/background.js</code>, <code>content/content.js</code>, <code>popup/popup.html</code>, and <code>options/options.html</code>. In Chrome or Brave, navigate to <code>chrome://extensions</code>, turn on <strong>Developer Mode</strong>, and click <strong>Load unpacked</strong>.
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
          {activeTab === 'POPUP' ? (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
              {/* Chrome Mock Browser Top bar */}
              <div className="bg-slate-200 px-3 py-2 border-b border-slate-300 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded text-[11px] text-slate-600 px-2 py-0.5 truncate flex items-center gap-1 border border-slate-300">
                  <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{url}</span>
                </div>
              </div>

              {/* The Actual Extension Popup Box (360px wide) */}
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      TL
                    </div>
                    <span className="font-bold text-xs text-slate-900">TruthLens QuickVerify</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">v1.2.0</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Highlighted Claim on Current Page:
                  </label>
                  <textarea
                    value={selectedText}
                    onChange={(e) => setSelectedText(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-indigo-600"
                    placeholder="Select text on article to verify..."
                  />
                </div>

                <button
                  onClick={handleVerifyCurrentPage}
                  disabled={loading || !selectedText.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Retrieving Evidence & Cross-Checking...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify with TruthLens
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                    {error}
                  </div>
                )}

                {result && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Verdict:</span>
                      <VerdictBadge verdict={result.prediction} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confidence:</span>
                      <span className="font-bold text-slate-800">{result.confidence}%</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Credibility Score:</span>
                      <span className="font-bold text-indigo-600">{result.credibility_score}/100</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Verified Evidence:</span>
                      <span className="font-semibold text-slate-700">{result.evidence.length} sources</span>
                    </div>

                    <p className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 line-clamp-3">
                      {result.explanation}
                    </p>

                    <a
                      href={`/analysis/${result.id}`}
                      className="block text-center w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-indigo-600 text-xs font-semibold rounded transition-colors"
                    >
                      Open Full Analysis Report →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto space-y-4">
              <div>
                <p className="text-indigo-400 font-bold mb-1">// extension/manifest.json (Manifest V3)</p>
                <pre className="text-slate-300 bg-slate-950 p-3 rounded leading-relaxed">
{`{
  "manifest_version": 3,
  "name": "TruthLens AI - Fake News & Misinformation Detector",
  "version": "1.0.0",
  "description": "Verify suspicious claims and news articles directly from your browser.",
  "permissions": ["activeTab", "contextMenus", "storage"],
  "host_permissions": ["http://localhost:3000/*", "https://*.run.app/*"],
  "background": {
    "service_worker": "background/background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js"]
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "Verify with TruthLens"
  }
}`}
                </pre>
              </div>

              <div>
                <p className="text-indigo-400 font-bold mb-1">// Context Menu Right-Click Action</p>
                <pre className="text-slate-300 bg-slate-950 p-3 rounded">
{`chrome.contextMenus.create({
  id: "verify-with-truthlens",
  title: "Verify claim with TruthLens AI",
  contexts: ["selection"]
});`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

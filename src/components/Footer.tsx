import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ExternalLink, GitBranch, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      {/* High-Stakes Advisory Banner */}
      <div className="bg-amber-50/60 border-b border-amber-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Important Academic & Verification Advisory:</strong> TruthLens AI provides an
            automated credibility assessment based on machine-learning predictions and retrieved evidence.
            No automated system can determine truth with 100% accuracy. Results should be independently
            verified for high-stakes decisions—especially regarding medical, financial, legal, political,
            or emergency information.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">TruthLens AI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multilingual AI-Powered Fake News & Misinformation Detection Platform with
              Retrieval-Augmented Verification (RAG) and explainable multi-factor credibility scoring.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                MCA Major Project Architecture
              </span>
              <p className="text-xs text-slate-600">Enterprise AI & Cybersecurity Engineering</p>
            </div>
          </div>

          {/* Col 2: Platform Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  URL Article Scraper
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  Text & Social Claim Analysis
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  Multimodal OCR Vision
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
                  Analytics & Trends Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-indigo-600 transition-colors">
                  Verification History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Transparency */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Methodology & Standards
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/about" className="hover:text-indigo-600 transition-colors">
                  Evidence-First Pipeline
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-600 transition-colors">
                  Multilingual NLP (10+ Languages)
                </Link>
              </li>
              <li>
                <a
                  href="/api/openapi.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                >
                  OpenAPI 3.0 Documentation
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-indigo-600 transition-colors">
                  Privacy & Data Security
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Project Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Engineering Specs
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1.5 font-mono">
              <div>
                <span className="text-slate-400">Model:</span> gemini-3.8-flash + RAG Grounding
              </div>
              <div>
                <span className="text-slate-400">Runtime:</span> TypeScript Full-Stack / Node.js
              </div>
              <div>
                <span className="text-slate-400">Database:</span> Acid Persistent JSON Store
              </div>
              <div>
                <span className="text-slate-400">Extension:</span> Chrome Manifest V3
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 TruthLens AI. Built for Academic Demonstration & Real-World Misinformation Defense.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="hover:underline">
              Terms of Use
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/about" className="hover:underline">
              System Architecture
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

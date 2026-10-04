import React from 'react';
import { AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500 mt-1">
          Last updated: March 2026 · Academic and Practical Usage Guidelines
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
        {/* Core Disclaimer Callout */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Critical Verification Disclaimer</h4>
            <p>
              TruthLens AI provides an automated credibility assessment based on machine-learning
              predictions and retrieved evidence. This system does NOT guarantee 100% accuracy.
              Results should be independently verified for high-stakes decisions, including medical,
              financial, legal, political, or emergency matters.
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">1. Acceptable Use</h3>
          <p>
            You agree to use TruthLens AI only for lawful fact-checking, academic research, journalistic
            verification, and media literacy purposes. You agree not to submit malicious URLs designed to
            exploit denial-of-service vulnerabilities or attempt SSRF penetration testing against our
            infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">2. Intellectual Property and Citations</h3>
          <p>
            When TruthLens retrieves external news reports, snippets are displayed under the fair-use doctrine
            for the purpose of commentary, criticism, and verification. Full credit and direct hyperlinks
            are provided to the original publishers.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">3. Limitation of Liability</h3>
          <p>
            TruthLens AI and its developers assume no liability for actions taken based on automated
            credibility scores. Users are encouraged to click through and inspect primary sources directly.
          </p>
        </section>
      </div>
    </div>
  );
};

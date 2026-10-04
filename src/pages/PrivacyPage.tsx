import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-1">
          Last revised: March 2026 · TruthLens AI Data Protection Principles
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
          <p>
            TruthLens AI collects user information strictly necessary for verification operations, account
            maintenance, and security auditing. When an analysis is performed, the submitted text, URL, or
            image screenshot is processed by our verification pipeline to extract factual claims and retrieve
            evidence.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">2. No Scraping of Private User Feeds</h3>
          <p>
            TruthLens AI does not access, scrape, or store private social media communications, direct
            messages, or restricted profiles. Users submit public statements or text excerpts willingly for
            independent evaluation.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">3. Safe URL Ingestion & Ephemeral Scraping</h3>
          <p>
            When a user provides an article URL, our backend performs a safe, server-side fetch with
            strict Server-Side Request Forgery (SSRF) defenses. Fetched HTML content is processed in memory to
            extract article text and is not resold to third-party data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">4. Passwords and Authentication Security</h3>
          <p>
            Passwords are encrypted using industry-standard bcrypt hashing with a salt factor of 10. Plaintext
            passwords are never logged, stored, or exposed across any API endpoints. Sessions use secure,
            HTTP-only JWT cookies to defend against Cross-Site Scripting (XSS).
          </p>
        </section>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Globe,
  FileText,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Scale,
  Database,
  Languages,
} from 'lucide-react';
import { VerdictBadge } from '../components/VerdictBadge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate('/analyze', { state: { prefilledText: quickInput } });
  };

  const sampleClaims = [
    'The Reserve Bank of India has announced that all 500 rupee notes will be decommissioned by midnight today.',
    'Solar and wind energy accounted for over 30% of global electricity generation milestone.',
    'Drinking boiled garlic water cures viral infections within 3 hours according to doctors.',
  ];

  const faqs = [
    {
      q: 'How does TruthLens AI determine credibility?',
      a: 'TruthLens uses a hybrid pipeline combining multilingual natural language processing (NLP), factual claim extraction, Retrieval-Augmented Verification (RAG) against verified news and fact-checking archives, and stance detection. It calculates a multi-factor engineering credibility score rather than relying on a standalone AI prediction.',
    },
    {
      q: 'Does TruthLens claim to determine the absolute truth?',
      a: 'No. As a core principle, TruthLens never claims that an AI model can determine absolute truth with 100% accuracy. We provide structured engineering indicators (Likely True, Likely False, Misleading, Partially Supported, Unverified, Insufficient Evidence) paired with transparent source citations so users can independently assess the evidence.',
    },
    {
      q: 'Which languages are supported?',
      a: 'TruthLens natively detects and analyzes claims in English and Hindi, with architectural support for major Indic languages including Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Urdu.',
    },
    {
      q: 'Can I upload screenshots or images?',
      a: 'Yes! Our multimodal OCR pipeline extracts text from newspaper clippings, social media screenshots, and images, automatically isolates headlines and dates, and lets you verify them directly.',
    },
    {
      q: 'How does TruthLens protect against malicious links (SSRF)?',
      a: 'When you submit a URL, TruthLens uses a multi-layered server-side defense that resolves DNS and strictly blocks localhost, private IPv4/IPv6 subnets (RFC 1918), and cloud provider metadata endpoints (169.254.169.254).',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/70 via-white to-white border-b border-slate-200/80 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/70 border border-indigo-200 text-indigo-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            MCA Major Project · Production-Grade Verification Engine
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Don't just read the news.{' '}
            <span className="text-indigo-600 underline decoration-indigo-300 decoration-wavy decoration-2">
              Verify it.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            TruthLens AI uses AI, evidence retrieval, and trusted sources to help you evaluate
            suspicious claims, viral posts, and news articles across multiple languages.
          </p>

          {/* Quick Verification Form */}
          <div className="max-w-2xl mx-auto mt-8">
            <form
              onSubmit={handleQuickSubmit}
              className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex-1 w-full flex items-center px-3 gap-2">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Paste a headline, article text, or statement..."
                  className="w-full py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                Verify Claim
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Sample Chips */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Try sample claims:</span>
              {sampleClaims.map((claim, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuickInput(claim)}
                  className="text-left text-indigo-600 hover:underline max-w-[280px] truncate cursor-pointer"
                >
                  "{claim}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Verification Methodology & 6-Step Pipeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Automated Pipeline
          </h2>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
            How TruthLens Evaluates Information
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every submission undergoes a multi-stage verification workflow grounded in evidence,
            linguistic analysis, and source reputation scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              01
            </div>
            <h4 className="text-base font-semibold text-slate-900">Content Ingestion & Safe Parsing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accepts URLs, direct text, social media snippets, or screenshot OCR. Incorporates strict
              SSRF validation to block internal IP vectors.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              02
            </div>
            <h4 className="text-base font-semibold text-slate-900">Multilingual Claim Extraction</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects language (English, Hindi, etc.) and segments text into verifiable factual claims,
              separating factual assertions from rhetorical opinions.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              03
            </div>
            <h4 className="text-base font-semibold text-slate-900">RAG Evidence Retrieval</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Searches live news registries, official government portals, academic databases, and
              certified fact-checking repositories for direct corroboration.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              04
            </div>
            <h4 className="text-base font-semibold text-slate-900">Stance & Semantic Similarity</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates whether each retrieved citation supports, contradicts, or remains neutral,
              measuring semantic relevance against each claim.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              05
            </div>
            <h4 className="text-base font-semibold text-slate-900">Multi-Factor Credibility Scoring</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applies a weighted formula combining ML linguistic patterns, evidence support/contradiction
              weights, and source authority ratings.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              06
            </div>
            <h4 className="text-base font-semibold text-slate-900">Explainable AI (XAI) Synthesis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produces a transparent explanation detailing key corroborating or contradictory facts,
              source reliability ratings, and complete audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Inputs Grid */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-slate-900">Supported Input Modalities</h3>
            <p className="text-slate-600 text-sm mt-2">
              Verify claims from any media source without breaking your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">News Article URL</h4>
              <p className="text-xs text-slate-600">
                Safely downloads web articles, removes ads and tracking scripts, and extracts titles and body content.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Raw Text & Headlines</h4>
              <p className="text-xs text-slate-600">
                Paste copied statements, press releases, or forwarded messages in English, Hindi, or regional languages.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Screenshots & Image OCR</h4>
              <p className="text-xs text-slate-600">
                Upload image clippings or screenshots. Our vision model parses visible headlines, dates, and claims.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Share2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Social Media Claims</h4>
              <p className="text-xs text-slate-600">
                Evaluate viral social media posts, checking against known hoaxes and official government bulletins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Highlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-indigo-800/60 px-3 py-1 rounded-full text-xs font-medium text-indigo-200">
              <Languages className="w-3.5 h-3.5" />
              Multilingual Indian & Global Coverage
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Misinformation knows no language barriers. Neither do we.
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Designed from the ground up to verify English, Hindi (हिंदी), and extensible to
              regional scripts including Bengali, Tamil, Telugu, and Marathi with script detection and
              localized fact-checking repositories.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['English', 'हिन्दी (Hindi)', 'বাংলা (Bengali)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'मराठी (Marathi)'].map(
                (lang, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded text-slate-300"
                  >
                    {lang}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 w-full md:w-auto md:min-w-[320px] space-y-3">
            <div className="text-xs font-semibold text-indigo-300 uppercase">Live Detection Sample</div>
            <p className="text-sm text-slate-200 italic font-serif">
              "नासा ने जेम्स वेब टेलीस्कोप द्वारा एक्सोप्लैनेट पर जल वाष्प की पुष्टि की।"
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Likely True (91% Conf.)
              </span>
              <span className="text-[10px] text-slate-400">Devanagari Script</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
          <p className="text-slate-600 text-xs mt-1">
            Understanding TruthLens AI's verification logic and standards
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

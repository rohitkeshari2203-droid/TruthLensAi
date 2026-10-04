import React from 'react';
import { ShieldCheck, BookOpen, Layers, Cpu, Scale, AlertTriangle, FileCode } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          Master of Computer Applications (MCA) Major Project Specification
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About TruthLens AI
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          TruthLens AI is an enterprise-grade, multilingual fake news and misinformation detection
          platform developed to address the escalating challenges of viral digital deception, deepfake
          disinformation, and unverified social media claims.
        </p>
      </div>

      {/* Problem Statement & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            The Problem
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Misinformation spreads 6 times faster than factual news online. Existing automated systems
            often rely on black-box classification models without providing verifiable external evidence,
            fail on regional languages (such as Hindi or Bengali), and lack transparent credibility
            scoring.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            The TruthLens Solution
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            TruthLens couples advanced language models with Retrieval-Augmented Verification (RAG).
            Instead of hallucinating truth, the platform retrieves real-time reporting from accredited
            news registries, analyzes evidence stance (supports vs. contradicts), and transparently
            explains its reasoning factors.
          </p>
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Verification Architecture & Pipeline Flow
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The processing pipeline follows a 6-phase engineering architecture:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <strong>1. Input Ingestion & SSRF Defense:</strong> Sanitizes payloads and blocks malicious IP
            ranges (127.0.0.1, 169.254.169.254, RFC 1918) when downloading articles via URL.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <strong>2. Multilingual Claim Extraction:</strong> Detects language script, cleans noise, and
            segments text into discrete factual assertions.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <strong>3. RAG Grounding Search:</strong> Connects to live registries and archives to locate
            verifiable third-party articles and official press releases.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <strong>4. Stance & Semantic Similarity:</strong> Determines whether external reporting
            SUPPORTS, CONTRADICTS, or is NEUTRAL towards the assertion.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <strong>5. Credibility Formula:</strong> Weights source reputation, evidence volume, and
            linguistic sensationalism into a transparent 0-100 score.
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <strong>6. Explainable AI (XAI):</strong> Exposes primary factors and external citations so
            users are never forced to trust an opaque score.
          </div>
        </div>
      </div>

      {/* Engineering Philosophy Notice */}
      <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs text-amber-900 leading-relaxed">
        <div className="flex items-center gap-2 font-bold">
          <Scale className="w-4 h-4 text-amber-700" />
          Core Engineering Philosophy
        </div>
        <p>
          TruthLens AI strictly rejects the notion that an AI model can act as an arbiter of absolute
          truth. Claims are evaluated through observable evidence, verified citations, and domain
          reputation metrics. High-stakes political, financial, or medical decisions should always be
          cross-examined with accredited primary sources.
        </p>
      </div>
    </div>
  );
};

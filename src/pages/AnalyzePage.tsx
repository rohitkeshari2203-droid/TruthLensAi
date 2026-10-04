import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Globe,
  FileText,
  Image as ImageIcon,
  Share2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle,
  FileSearch,
  Sparkles,
  Info,
} from 'lucide-react';
import { analyzeApi } from '../services/api';
import { InputType } from '../types';

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<InputType>('TEXT');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [socialInput, setSocialInput] = useState('');

  // Image & OCR state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [extractedOcrText, setExtractedOcrText] = useState('');
  const [ocrCompleted, setOcrCompleted] = useState(false);

  // Workflow progress state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const workflowSteps = [
    'Extracting content and sanitizing payload',
    'Detecting language and linguistic markers',
    'Identifying and isolating factual claims',
    'Searching evidence archives and live registries',
    'Comparing evidence stance and relevance',
    'Calculating multi-factor credibility score',
    'Generating Explainable AI synthesis',
  ];

  // Prefill if redirected from landing page
  useEffect(() => {
    if (location.state && (location.state as any).prefilledText) {
      setTextInput((location.state as any).prefilledText);
      setActiveTab('TEXT');
    }
  }, [location.state]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    // Validate format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are supported.');
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      // Run OCR extraction automatically
      runOcr(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runOcr = async (base64: string, mime: string) => {
    setOcrLoading(true);
    setOcrCompleted(false);
    setError(null);
    try {
      const result = await analyzeApi.parseOcr(base64, mime);
      setExtractedOcrText(result.extracted_text);
      setOcrCompleted(true);
    } catch (err: any) {
      setError(err.message || 'OCR text extraction failed. You can type the text manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  const executeAnalysis = async () => {
    setError(null);
    setIsAnalyzing(true);
    setActiveStep(0);

    // Simulate progress tick aligned with real backend latency
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < workflowSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      let analysisResult;

      if (activeTab === 'URL') {
        if (!urlInput.trim()) throw new Error('Please enter a valid news article URL.');
        const res = await analyzeApi.analyzeUrl(urlInput.trim());
        analysisResult = res.analysis;
      } else if (activeTab === 'TEXT') {
        if (textInput.trim().length < 10) throw new Error('Please provide at least 10 characters of text.');
        analysisResult = await analyzeApi.analyzeText(textInput.trim(), 'TEXT');
      } else if (activeTab === 'SOCIAL') {
        if (socialInput.trim().length < 10) throw new Error('Please enter the social media post or viral claim.');
        analysisResult = await analyzeApi.analyzeText(socialInput.trim(), 'SOCIAL');
      } else if (activeTab === 'IMAGE') {
        if (!imagePreview) throw new Error('Please upload an image screenshot first.');
        if (!extractedOcrText.trim()) throw new Error('Please provide or confirm extracted text from image.');
        analysisResult = await analyzeApi.analyzeImage(imagePreview, imageFile?.type || 'image/png', extractedOcrText.trim());
      }

      clearInterval(interval);
      setActiveStep(workflowSteps.length);

      if (analysisResult?.id) {
        navigate(`/analysis/${analysisResult.id}`);
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setError(err.message || 'Verification workflow could not complete.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify a Claim
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Paste a news article URL, headline, social media post, or upload a screenshot to
          extract factual claims and retrieve verified corroborating evidence.
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Input Modality Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('URL');
              setError(null);
            }}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'URL'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            Article URL
          </button>

          <button
            onClick={() => {
              setActiveTab('TEXT');
              setError(null);
            }}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'TEXT'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            Text / Headline
          </button>

          <button
            onClick={() => {
              setActiveTab('IMAGE');
              setError(null);
            }}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'IMAGE'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-purple-600" />
            Screenshot / OCR
          </button>

          <button
            onClick={() => {
              setActiveTab('SOCIAL');
              setError(null);
            }}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'SOCIAL'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-4 h-4 text-amber-600" />
            Social Media Claim
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. URL Tab */}
          {activeTab === 'URL' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Web Article URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isAnalyzing}
                    placeholder="https://example.com/news/article-headline"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Protected with Server-Side Request Forgery (SSRF) filters. Resolves official domains and extracts core text safely.
                </p>
              </div>

              {/* Sample URLs */}
              <div className="pt-2">
                <span className="text-xs text-slate-500 font-medium">Test sample articles:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setUrlInput('https://reuters.com/world/india/renewable-milestone-review')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 border border-indigo-100 px-2 py-1 rounded cursor-pointer"
                  >
                    Reuters: Renewable Energy Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrlInput('https://pib.gov.in/FactCheck/500note-clarification')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 border border-indigo-100 px-2 py-1 rounded cursor-pointer"
                  >
                    PIB: RBI Currency Advisory
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Text Tab */}
          {activeTab === 'TEXT' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Claim or Article Text (English, Hindi, or Regional)
                  </label>
                  <span className="text-xs text-slate-400 font-mono">
                    {textInput.length} characters
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isAnalyzing}
                  placeholder="Paste article excerpt, political speech quotation, or headline here (e.g. 'Government X announced a blanket ban on all AI systems in public universities')..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              {/* Sample Texts */}
              <div className="pt-2">
                <span className="text-xs text-slate-500 font-medium">Quick sample statements:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setTextInput(
                        'The Reserve Bank of India has announced that all 500 rupee notes will be decommissioned by midnight today.'
                      )
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded cursor-pointer text-left"
                  >
                    RBI Currency Rumor (Fake)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTextInput(
                        'नासा ने घोषणा की है कि जेम्स वेब स्पेस टेलीस्कोप ने सौर मंडल के बाहर एक नए एक्सोप्लैनेट पर पानी के वाष्प का पता लगाया है।'
                      )
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded cursor-pointer text-left"
                  >
                    Hindi Exoplanet Claim (True)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTextInput(
                        'Drinking boiled garlic water cures 100% of viral infections within 3 hours according to doctors.'
                      )
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded cursor-pointer text-left"
                  >
                    Garlic Water Health Myth (False)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Image OCR Tab */}
          {activeTab === 'IMAGE' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageSelect}
                  disabled={isAnalyzing}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-indigo-600 hover:underline">
                      Click to upload image
                    </span>
                    <span className="text-xs text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports PNG, JPG, WebP up to 5MB (Newspaper clippings, WhatsApp screenshots, Twitter posts)
                  </p>
                </label>
              </div>

              {/* Image Preview & OCR Editable Box */}
              {imagePreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Uploaded Screenshot:
                    </label>
                    <div className="max-h-48 overflow-hidden rounded border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Screenshot preview"
                        className="max-h-48 object-contain"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Text extracted from image:
                      </label>
                      {ocrLoading && (
                        <span className="text-xs text-indigo-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Running OCR...
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={5}
                      value={extractedOcrText}
                      onChange={(e) => setExtractedOcrText(e.target.value)}
                      placeholder={
                        ocrLoading
                          ? 'Extracting multilingual text via Gemini 3.8 Flash vision...'
                          : 'Extracted text will appear here. You can edit or refine it before submitting.'
                      }
                      className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded bg-white focus:outline-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Section 16 requirement: You can edit or correct the OCR transcription before launching verification.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Social Post Tab */}
          {activeTab === 'SOCIAL' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Copied Social Media Post / Viral Forward
                </label>
                <textarea
                  rows={4}
                  value={socialInput}
                  onChange={(e) => setSocialInput(e.target.value)}
                  disabled={isAnalyzing}
                  placeholder="Paste message copied from Twitter/X, WhatsApp, Telegram, Facebook, or Instagram..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  TruthLens does not scrape private user feeds. We inspect the copied claim, extract
                  verifiable factual assertions, and cross-reference them with authoritative reporting.
                </span>
              </div>
            </div>
          )}

          {/* Workflow Progress (when analyzing) */}
          {isAnalyzing && (
            <div className="mt-6 p-5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  Verification Pipeline in Progress
                </span>
                <span className="text-xs font-semibold text-indigo-700">
                  Step {activeStep + 1} of {workflowSteps.length}
                </span>
              </div>

              {/* Multi-step progress list */}
              <div className="space-y-2">
                {workflowSteps.map((step, idx) => {
                  const isDone = idx < activeStep;
                  const isCurrent = idx === activeStep;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-xs transition-colors ${
                        isDone
                          ? 'text-emerald-700 font-medium'
                          : isCurrent
                          ? 'text-indigo-900 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              ⚡ Grounded in real-world news registries & fact-checking archives
            </span>

            <button
              type="button"
              onClick={executeAnalysis}
              disabled={isAnalyzing || ocrLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluating Claim...
                </>
              ) : (
                <>
                  Analyze Claim
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

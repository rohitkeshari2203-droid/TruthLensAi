import { Router } from 'express';
import { z } from 'zod';
import {
  AnalysisRepository,
  SavedItemRepository,
  ReportRepository,
  SourceRepository,
  AuditLogRepository,
} from '../db/index.js';
import { safelyFetchArticle } from '../services/scraper.js';
import { analyzeContentWithGemini, extractTextFromImage } from '../services/ai.js';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../security/auth.js';
import { Analysis, InputType } from '../types.js';

export const analyzeRouter = Router();

const TextAnalysisSchema = z.object({
  text: z.string().min(10, 'Submitted text must contain at least 10 characters for verification.'),
  inputType: z.enum(['TEXT', 'SOCIAL']).default('TEXT'),
});

const UrlAnalysisSchema = z.object({
  url: z.string().url('Must provide a valid HTTP or HTTPS article URL.'),
});

const OcrSchema = z.object({
  imageBase64: z.string().min(20, 'Image data is required.'),
  mimeType: z.string().default('image/png'),
});

const ImageAnalysisSchema = z.object({
  imageBase64: z.string().min(20, 'Image data is required.'),
  mimeType: z.string().default('image/png'),
  editedText: z.string().optional(),
});

const ReportSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters.'),
  details: z.string().optional(),
});

// In-memory async jobs store (Step 17 requirement)
const jobsStore = new Map<string, {
  id: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  input_type: InputType;
  created_at: string;
  analysis_id?: string;
  error?: string;
}>();

const AsyncAnalyzeSchema = z.object({
  type: z.enum(['TEXT', 'URL', 'IMAGE', 'SOCIAL']).default('TEXT'),
  content: z.string().min(5, 'Content is required for analysis.'),
  mimeType: z.string().optional(),
});

// Asynchronous verification job submission (POST /api/analyze)
analyzeRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parse = AsyncAnalyzeSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parse.error.issues[0]?.message },
      });
      return;
    }

    const { type, content, mimeType } = parse.data;
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const userId = req.user?.id;

    jobsStore.set(jobId, {
      id: jobId,
      status: 'QUEUED',
      input_type: type as InputType,
      created_at: new Date().toISOString(),
    });

    // Run async in background without blocking response
    (async () => {
      try {
        const job = jobsStore.get(jobId);
        if (job) job.status = 'PROCESSING';

        let analysisResult;
        let originalText = content;
        let sourceUrl: string | undefined;

        if (type === 'URL') {
          sourceUrl = content;
          const article = await safelyFetchArticle(content);
          originalText = article.content;
          analysisResult = await analyzeContentWithGemini(`${article.title}\n\n${article.content}`, 'URL', content);
        } else if (type === 'IMAGE') {
          const ocr = await extractTextFromImage(content, mimeType || 'image/png');
          originalText = ocr.extracted_text;
          analysisResult = await analyzeContentWithGemini(originalText, 'IMAGE');
        } else {
          analysisResult = await analyzeContentWithGemini(content, type as InputType);
        }

        const analysis: Analysis = {
          id: `ana-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: userId,
          input_type: type as InputType,
          original_text: originalText,
          source_url: sourceUrl,
          detected_language: analysisResult.detected_language,
          normalized_text: analysisResult.normalized_text,
          prediction: analysisResult.prediction,
          confidence: analysisResult.confidence,
          credibility_score: analysisResult.credibility_score,
          explanation: analysisResult.explanation,
          xai_factors: analysisResult.xai_factors,
          claims: analysisResult.claims,
          evidence: analysisResult.evidence,
          status: 'COMPLETED',
          created_at: new Date().toISOString(),
        };

        AnalysisRepository.create(analysis);

        const updatedJob = jobsStore.get(jobId);
        if (updatedJob) {
          updatedJob.status = 'COMPLETED';
          updatedJob.analysis_id = analysis.id;
        }
      } catch (err: any) {
        const failedJob = jobsStore.get(jobId);
        if (failedJob) {
          failedJob.status = 'FAILED';
          failedJob.error = err.message || 'Background verification job failed.';
        }
      }
    })();

    res.status(202).json({
      success: true,
      data: {
        job_id: jobId,
        status: 'QUEUED',
        message: 'Analysis job queued successfully.',
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'QUEUE_ERROR', message: err.message },
    });
  }
});

// Poll async job status (GET /api/analyze/jobs/:id)
analyzeRouter.get('/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = jobsStore.get(id);

  if (!job) {
    res.status(404).json({
      success: false,
      error: { code: 'JOB_NOT_FOUND', message: 'Job ID does not exist or has expired.' },
    });
    return;
  }

  let analysis = null;
  if (job.status === 'COMPLETED' && job.analysis_id) {
    analysis = AnalysisRepository.findById(job.analysis_id);
  }

  res.json({
    success: true,
    data: {
      job_id: job.id,
      status: job.status,
      analysis_id: job.analysis_id,
      error: job.error,
      analysis,
    },
  });
});

// Analyze direct text or social media post
analyzeRouter.post('/text', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parse = TextAnalysisSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parse.error.issues[0]?.message },
      });
      return;
    }

    const { text, inputType } = parse.data;
    const userId = req.user?.id;

    const result = await analyzeContentWithGemini(text, inputType as InputType);

    const analysis: Analysis = {
      id: `ana-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      input_type: inputType as InputType,
      original_text: text,
      detected_language: result.detected_language,
      normalized_text: result.normalized_text,
      prediction: result.prediction,
      confidence: result.confidence,
      credibility_score: result.credibility_score,
      explanation: result.explanation,
      xai_factors: result.xai_factors,
      claims: result.claims,
      evidence: result.evidence,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    };

    AnalysisRepository.create(analysis);
    AuditLogRepository.log('ANALYSIS_CREATED', userId, { inputType, analysisId: analysis.id, verdict: analysis.prediction }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      data: { analysis },
    });
  } catch (err: any) {
    console.error('Text analysis error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'ANALYSIS_FAILED', message: err.message || 'Verification process encountered an unexpected error.' },
    });
  }
});

// Analyze news article via URL with SSRF protection
analyzeRouter.post('/url', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parse = UrlAnalysisSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_URL', message: parse.error.issues[0]?.message },
      });
      return;
    }

    const { url } = parse.data;
    const userId = req.user?.id;

    // Safely fetch and extract article text
    const article = await safelyFetchArticle(url);

    // Analyze extracted text
    const contentToAnalyze = `${article.title}\n\n${article.content}`;
    const result = await analyzeContentWithGemini(contentToAnalyze, 'URL', url);

    const analysis: Analysis = {
      id: `ana-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      input_type: 'URL',
      original_text: article.content,
      source_url: url,
      detected_language: result.detected_language,
      normalized_text: result.normalized_text,
      prediction: result.prediction,
      confidence: result.confidence,
      credibility_score: result.credibility_score,
      explanation: result.explanation,
      xai_factors: result.xai_factors,
      claims: result.claims,
      evidence: result.evidence,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    };

    AnalysisRepository.create(analysis);
    AuditLogRepository.log('ANALYSIS_URL_CREATED', userId, { url, domain: article.domain, analysisId: analysis.id }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      data: {
        analysis,
        articleMeta: {
          title: article.title,
          author: article.author,
          publicationDate: article.publication_date,
          domain: article.domain,
        },
      },
    });
  } catch (err: any) {
    console.error('URL analysis error:', err);
    res.status(400).json({
      success: false,
      error: { code: 'SCRAPER_ERROR', message: err.message || 'Failed to safely download or verify content from the provided URL.' },
    });
  }
});

// Run OCR text extraction on image (allows user to preview/edit text before final analysis)
analyzeRouter.post('/ocr', optionalAuth, async (req, res) => {
  try {
    const parse = OcrSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_IMAGE', message: parse.error.issues[0]?.message },
      });
      return;
    }

    const { imageBase64, mimeType } = parse.data;
    const ocrResult = await extractTextFromImage(imageBase64, mimeType);

    res.json({
      success: true,
      data: ocrResult,
    });
  } catch (err: any) {
    console.error('OCR route error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'OCR_FAILED', message: err.message || 'Failed to extract text from image.' },
    });
  }
});

// Analyze image / screenshot (either directly or with user-verified OCR text)
analyzeRouter.post('/image', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parse = ImageAnalysisSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_IMAGE_PAYLOAD', message: parse.error.issues[0]?.message },
      });
      return;
    }

    const { imageBase64, mimeType, editedText } = parse.data;
    const userId = req.user?.id;

    let targetText = editedText;
    if (!targetText) {
      const ocr = await extractTextFromImage(imageBase64, mimeType);
      targetText = ocr.extracted_text;
    }

    if (!targetText || targetText.length < 10) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_TEXT_FOUND', message: 'No legible text was found in the image to analyze.' },
      });
      return;
    }

    const result = await analyzeContentWithGemini(targetText, 'IMAGE');

    const analysis: Analysis = {
      id: `ana-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      input_type: 'IMAGE',
      original_text: targetText,
      detected_language: result.detected_language,
      normalized_text: result.normalized_text,
      prediction: result.prediction,
      confidence: result.confidence,
      credibility_score: result.credibility_score,
      explanation: result.explanation,
      xai_factors: result.xai_factors,
      claims: result.claims,
      evidence: result.evidence,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    };

    AnalysisRepository.create(analysis);
    AuditLogRepository.log('ANALYSIS_IMAGE_CREATED', userId, { analysisId: analysis.id }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      data: { analysis },
    });
  } catch (err: any) {
    console.error('Image analysis error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'ANALYSIS_FAILED', message: err.message || 'Failed to analyze screenshot.' },
    });
  }
});

// List all analyses with filters
analyzeRouter.get('/analyses', optionalAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  let analyses = AnalysisRepository.getAll();

  const { verdict, language, search, userOnly } = req.query;

  if (userOnly === 'true' && userId) {
    analyses = analyses.filter((a) => a.user_id === userId);
  }

  if (verdict && typeof verdict === 'string') {
    analyses = analyses.filter((a) => a.prediction.toLowerCase() === verdict.toLowerCase());
  }

  if (language && typeof language === 'string') {
    analyses = analyses.filter((a) => a.detected_language?.code === language);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    analyses = analyses.filter(
      (a) =>
        a.original_text.toLowerCase().includes(q) ||
        a.explanation.toLowerCase().includes(q) ||
        a.claims.some((c) => c.claim_text.toLowerCase().includes(q))
    );
  }

  const total = analyses.length;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const paginated = analyses.slice((page - 1) * limit, page * limit);

  res.json({
    success: true,
    data: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      analyses: paginated,
    },
  });
});

// Get single analysis details
analyzeRouter.get('/analyses/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const analysis = AnalysisRepository.findById(id);

  if (!analysis) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Analysis record not found.' },
    });
    return;
  }

  const isSaved = req.user ? SavedItemRepository.isSaved(req.user.id, id) : false;

  res.json({
    success: true,
    data: {
      analysis,
      isSaved,
    },
  });
});

// Delete analysis
analyzeRouter.delete('/analyses/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const analysis = AnalysisRepository.findById(id);

  if (!analysis) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Analysis not found.' },
    });
    return;
  }

  // Can only delete if owner or admin
  if (analysis.user_id !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this analysis.' },
    });
    return;
  }

  AnalysisRepository.delete(id);
  AuditLogRepository.log('ANALYSIS_DELETED', req.user!.id, { analysisId: id }, req.ip, req.headers['user-agent']);

  res.json({
    success: true,
    data: { message: 'Analysis deleted successfully.' },
  });
});

// Bookmark / Save analysis
analyzeRouter.post('/analyses/:id/save', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const analysis = AnalysisRepository.findById(id);

  if (!analysis) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Analysis not found.' },
    });
    return;
  }

  const saved = SavedItemRepository.save(req.user!.id, id);
  res.json({
    success: true,
    data: { saved, isSaved: true },
  });
});

// Remove bookmark
analyzeRouter.delete('/analyses/:id/save', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const removed = SavedItemRepository.remove(req.user!.id, id);
  res.json({
    success: true,
    data: { isSaved: false, removed },
  });
});

// Get user saved items
analyzeRouter.get('/saved', requireAuth, (req: AuthenticatedRequest, res) => {
  const savedItems = SavedItemRepository.getUserSaved(req.user!.id);
  const analyses = savedItems
    .map((s) => AnalysisRepository.findById(s.analysis_id))
    .filter((a): a is Analysis => a !== undefined);

  res.json({
    success: true,
    data: { analyses },
  });
});

// Report dispute or issue with an analysis
analyzeRouter.post('/analyses/:id/report', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const analysis = AnalysisRepository.findById(id);

    if (!analysis) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found.' },
      });
      return;
    }

    const parse = ReportSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REPORT', message: parse.error.issues[0]?.message },
      });
      return;
    }

    const { reason, details } = parse.data;

    const report = ReportRepository.create({
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: req.user?.id,
      analysis_id: id,
      reason,
      details,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    });

    AuditLogRepository.log('ANALYSIS_REPORTED', req.user?.id, { analysisId: id, reason }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      data: {
        message: 'Thank you for your report. Our fact-checking team will review this analysis.',
        report,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'REPORT_FAILED', message: err.message },
    });
  }
});

// Get source reputation database
analyzeRouter.get('/sources', (_req, res) => {
  const sources = SourceRepository.getAll();
  res.json({
    success: true,
    data: { sources },
  });
});

// Get reputation for a single domain
analyzeRouter.get('/sources/:domain', (req, res) => {
  const { domain } = req.params;
  const source = SourceRepository.findByDomain(domain);

  if (!source) {
    res.json({
      success: true,
      data: {
        source: {
          domain,
          source_name: domain,
          reputation_score: 50,
          category: 'UNKNOWN',
          verification_status: 'UNVERIFIED',
          description: 'No prior historical editorial audit records on file for this domain.',
        },
      },
    });
    return;
  }

  res.json({
    success: true,
    data: { source },
  });
});

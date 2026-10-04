import { Router } from 'express';
import { z } from 'zod';
import {
  UserRepository,
  AnalysisRepository,
  ReportRepository,
  SourceRepository,
  AuditLogRepository,
} from '../db/index.js';
import { requireAdmin, AuthenticatedRequest } from '../security/auth.js';

export const adminRouter = Router();

// Apply admin guard to all routes in this router
adminRouter.use(requireAdmin);

// Admin dashboard statistics
adminRouter.get('/stats', (_req, res) => {
  const users = UserRepository.getAll();
  const analyses = AnalysisRepository.getAll();
  const reports = ReportRepository.getAll();
  const sources = SourceRepository.getAll();
  const auditLogs = AuditLogRepository.getAll();

  const verdictCounts: Record<string, number> = {
    'Likely True': 0,
    'Likely False': 0,
    'Misleading': 0,
    'Partially Supported': 0,
    'Unverified': 0,
    'Insufficient Evidence': 0,
  };

  const languageCounts: Record<string, number> = {};
  let totalCredibility = 0;

  for (const a of analyses) {
    if (verdictCounts[a.prediction] !== undefined) {
      verdictCounts[a.prediction] += 1;
    } else {
      verdictCounts[a.prediction] = 1;
    }

    const lang = a.detected_language?.name || 'Unknown';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    totalCredibility += a.credibility_score || 50;
  }

  const avgCredibility = analyses.length > 0 ? Math.round(totalCredibility / analyses.length) : 50;

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers: users.length,
        totalAnalyses: analyses.length,
        totalReports: reports.length,
        pendingReports: reports.filter((r) => r.status === 'PENDING').length,
        totalSourcesTracked: sources.length,
        avgCredibilityScore: avgCredibility,
        verdictCounts,
        languageCounts,
        recentAuditLogsCount: auditLogs.length,
      },
    },
  });
});

// Users management
adminRouter.get('/users', (_req, res) => {
  const users = UserRepository.getAll().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    preferred_language: u.preferred_language,
    is_active: u.is_active,
    created_at: u.created_at,
    last_login: u.last_login,
  }));

  res.json({
    success: true,
    data: { users },
  });
});

const UpdateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  is_active: z.boolean().optional(),
});

adminRouter.put('/users/:id', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const parse = UpdateUserSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: parse.error.issues[0]?.message },
    });
    return;
  }

  const updated = UserRepository.update(id, parse.data);
  if (!updated) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
    return;
  }

  AuditLogRepository.log('ADMIN_USER_UPDATED', req.user!.id, { targetUserId: id, changes: parse.data });

  res.json({
    success: true,
    data: {
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        is_active: updated.is_active,
      },
    },
  });
});

// Reports management
adminRouter.get('/reports', (_req, res) => {
  const reports = ReportRepository.getAll().map((r) => {
    const analysis = AnalysisRepository.findById(r.analysis_id);
    return {
      ...r,
      analysis: analysis
        ? {
            id: analysis.id,
            prediction: analysis.prediction,
            confidence: analysis.confidence,
            original_text: analysis.original_text.slice(0, 120),
          }
        : null,
    };
  });

  res.json({
    success: true,
    data: { reports },
  });
});

adminRouter.put('/reports/:id/status', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PENDING', 'REVIEWED', 'DISMISSED'].includes(status)) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: 'Status must be PENDING, REVIEWED, or DISMISSED.' },
    });
    return;
  }

  const updated = ReportRepository.updateStatus(id, status);
  if (!updated) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Report not found.' },
    });
    return;
  }

  AuditLogRepository.log('ADMIN_REPORT_STATUS_CHANGED', req.user!.id, { reportId: id, status });

  res.json({
    success: true,
    data: { report: updated },
  });
});

// Sources reputation management
const UpsertSourceSchema = z.object({
  domain: z.string().min(3),
  source_name: z.string().min(2),
  reputation_score: z.number().min(0).max(100),
  category: z.enum(['OFFICIAL', 'FACT_CHECK', 'MAINSTREAM_NEWS', 'ACADEMIC', 'USER_CONTENT', 'UNKNOWN']),
  verification_status: z.enum(['VERIFIED', 'QUESTIONABLE', 'UNVERIFIED', 'OFFICIAL']),
  description: z.string().optional(),
});

adminRouter.post('/sources', (req: AuthenticatedRequest, res) => {
  const parse = UpsertSourceSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: parse.error.issues[0]?.message },
    });
    return;
  }

  const domain = parse.data.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const source = SourceRepository.upsert({
    id: `src-${Date.now()}`,
    domain,
    source_name: parse.data.source_name,
    reputation_score: parse.data.reputation_score,
    category: parse.data.category,
    verification_status: parse.data.verification_status,
    description: parse.data.description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  AuditLogRepository.log('ADMIN_SOURCE_UPSERTED', req.user!.id, { domain, score: source.reputation_score });

  res.json({
    success: true,
    data: { source },
  });
});

// Audit logs
adminRouter.get('/audit-logs', (_req, res) => {
  const logs = AuditLogRepository.getAll();
  res.json({
    success: true,
    data: { logs },
  });
});

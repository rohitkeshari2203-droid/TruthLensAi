import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDb } from './server/db/index.js';
import { authRouter } from './server/routes/auth.js';
import { analyzeRouter } from './server/routes/analyze.js';
import { adminRouter } from './server/routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await initDb();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Body and cookie parsing with safety limits
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // REST API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use('/api', analyzeRouter); // Also mounts /api/analyses, /api/saved, /api/sources directly
  app.use('/api/admin', adminRouter);

  // OpenAPI Specification endpoint (Section 23 requirement)
  app.get('/api/openapi.json', (_req, res) => {
    res.json({
      openapi: '3.0.3',
      info: {
        title: 'TruthLens AI Verification Platform API',
        version: '1.0.0',
        description: 'Complete OpenAPI 3.0 specification for TruthLens AI Fake News & Misinformation Detection Engine',
      },
      paths: {
        '/api/auth/register': {
          post: {
            summary: 'Register new user account',
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 201: { description: 'User registered' } },
          },
        },
        '/api/auth/login': {
          post: {
            summary: 'Authenticate and receive JWT token',
            responses: { 200: { description: 'Authenticated' } },
          },
        },
        '/api/analyze/text': {
          post: {
            summary: 'Analyze text claim or social media assertion',
            responses: { 201: { description: 'Analysis report generated' } },
          },
        },
        '/api/analyze/url': {
          post: {
            summary: 'Safely fetch article via URL with SSRF defense and verify claims',
            responses: { 201: { description: 'Article extracted and verified' } },
          },
        },
        '/api/analyze/ocr': {
          post: {
            summary: 'Extract multilingual text from image/screenshot for user inspection',
            responses: { 200: { description: 'Extracted text and metadata' } },
          },
        },
        '/api/analyze/image': {
          post: {
            summary: 'Verify image or screenshot with OCR verification pipeline',
            responses: { 201: { description: 'Analysis report generated' } },
          },
        },
        '/api/analyses': {
          get: {
            summary: 'List recent analyses with filtering by verdict, language, or search',
            responses: { 200: { description: 'Array of analyses' } },
          },
        },
        '/api/admin/stats': {
          get: {
            summary: 'Get system analytics and verification metrics',
            responses: { 200: { description: 'Analytics statistics' } },
          },
        },
      },
    });
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      system: 'TruthLens AI Detection Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Frontend integration: Vite middleware in dev, dist in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthLens AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

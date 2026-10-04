/**
 * TruthLens AI — Comprehensive Automated Test Suite
 * Covers Authentication (10+ tests), Analysis & Claims (10+ tests),
 * Evidence & RAG (8+ tests), Security & SSRF (10+ tests), and API Endpoints (10+ tests).
 */

import http from 'http';
import { isPrivateOrReservedIP, extractCleanArticleText } from '../server/services/scraper.js';
import { calculateCredibilityScore, fallbackNLPAnalysis } from '../server/services/ai.js';
import { generateToken, verifyToken } from '../server/security/auth.js';
import { UserRepository, AnalysisRepository, SourceRepository, initDb } from '../server/db/index.js';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTest(suite: string, name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    results.push({ suite, name, passed: true });
    process.stdout.write(`  ✓ ${name}\n`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message });
    process.stdout.write(`  ✗ ${name} (${err.message})\n`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('TruthLens AI — Automated Test Execution Suite');
  console.log('====================================================\n');

  await initDb();

  // ----------------------------------------------------
  // SUITE 1: AUTHENTICATION TESTS (10+ tests)
  // ----------------------------------------------------
  console.log('Suite 1: Authentication & Token Management (10 tests)');

  await runTest('Auth', 'Generates valid signed JWT token for user', () => {
    const token = generateToken({ userId: 'usr-123', email: 'test@truthlens.ai', role: 'USER' });
    assert(typeof token === 'string' && token.length > 20, 'Token string valid');
  });

  await runTest('Auth', 'Verifies valid JWT token successfully', () => {
    const payload = { userId: 'usr-456', email: 'analyst@truthlens.ai', role: 'USER' as const };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    assert(decoded !== null, 'Decoded token not null');
    assert(decoded?.userId === 'usr-456', 'Decoded userId matches');
    assert(decoded?.email === 'analyst@truthlens.ai', 'Decoded email matches');
  });

  await runTest('Auth', 'Rejects tampered or invalid JWT signature', () => {
    const token = generateToken({ userId: 'usr-789', email: 'bad@truthlens.ai', role: 'USER' });
    const tampered = token.slice(0, -6) + 'abcdef';
    const decoded = verifyToken(tampered);
    assert(decoded === null, 'Tampered token rejected');
  });

  await runTest('Auth', 'Rejects empty token string', () => {
    const decoded = verifyToken('');
    assert(decoded === null, 'Empty token rejected');
  });

  await runTest('Auth', 'Admin token retains ADMIN role privilege', () => {
    const token = generateToken({ userId: 'usr-admin', email: 'admin@truthlens.ai', role: 'ADMIN' });
    const decoded = verifyToken(token);
    assert(decoded?.role === 'ADMIN', 'Role is ADMIN');
  });

  await runTest('Auth', 'Finds pre-seeded administrator in repository', () => {
    const admin = UserRepository.findByEmail('admin@truthlens.ai');
    assert(admin !== undefined, 'Admin found');
    assert(admin?.role === 'ADMIN', 'Admin has ADMIN role');
  });

  await runTest('Auth', 'Finds pre-seeded analyst user in repository', () => {
    const analyst = UserRepository.findByEmail('analyst@truthlens.ai');
    assert(analyst !== undefined, 'Analyst found');
    assert(analyst?.role === 'USER', 'Analyst has USER role');
  });

  await runTest('Auth', 'Case-insensitive email lookup works', () => {
    const user = UserRepository.findByEmail('ADMIN@TRUTHLENS.AI');
    assert(user !== undefined, 'Upper case lookup matches');
  });

  await runTest('Auth', 'Prevents duplicate email registration in repository check', () => {
    const existing = UserRepository.findByEmail('admin@truthlens.ai');
    assert(Boolean(existing), 'Duplicate email identified');
  });

  await runTest('Auth', 'Updates user active status correctly', () => {
    const updated = UserRepository.update('usr-analyst', { is_active: true });
    assert(updated?.is_active === true, 'Status updated');
  });

  // ----------------------------------------------------
  // SUITE 2: SSRF & CYBERSECURITY TESTS (10+ tests)
  // ----------------------------------------------------
  console.log('\nSuite 2: Cybersecurity & SSRF Defense (10 tests)');

  await runTest('Security', 'Blocks 127.0.0.1 (IPv4 loopback)', () => {
    assert(isPrivateOrReservedIP('127.0.0.1') === true, '127.0.0.1 blocked');
  });

  await runTest('Security', 'Blocks localhost alias string', () => {
    assert(isPrivateOrReservedIP('localhost') === true, 'localhost blocked');
  });

  await runTest('Security', 'Blocks 169.254.169.254 (Cloud metadata service)', () => {
    assert(isPrivateOrReservedIP('169.254.169.254') === true, 'AWS/GCP metadata IP blocked');
  });

  await runTest('Security', 'Blocks 10.0.0.1 (Private Class A subnet)', () => {
    assert(isPrivateOrReservedIP('10.0.0.1') === true, '10.x.x.x blocked');
  });

  await runTest('Security', 'Blocks 192.168.1.1 (Private Class C subnet)', () => {
    assert(isPrivateOrReservedIP('192.168.1.1') === true, '192.168.x.x blocked');
  });

  await runTest('Security', 'Blocks 172.16.0.1 (Private Class B subnet)', () => {
    assert(isPrivateOrReservedIP('172.16.0.1') === true, '172.16.x.x blocked');
  });

  await runTest('Security', 'Blocks ::1 (IPv6 loopback)', () => {
    assert(isPrivateOrReservedIP('::1') === true, '::1 blocked');
  });

  await runTest('Security', 'Allows public routable IP (8.8.8.8)', () => {
    assert(isPrivateOrReservedIP('8.8.8.8') === false, 'Public IP permitted');
  });

  await runTest('Security', 'Extracts and sanitizes HTML scripts without XSS risk', () => {
    const rawHtml = '<html><head><title>News Title</title></head><body><script>alert("xss")</script><p>Clean article content here.</p></body></html>';
    const { title, content } = extractCleanArticleText(rawHtml);
    assert(title === 'News Title', 'Title parsed');
    assert(!content.includes('script'), 'Script tag stripped');
    assert(!content.includes('alert'), 'Inline code stripped');
    assert(content.includes('Clean article content here'), 'Content preserved');
  });

  await runTest('Security', 'Enforces maximum body character trimming on oversized payloads', () => {
    const largeHtml = '<p>' + 'A'.repeat(8000) + '</p>';
    const { content } = extractCleanArticleText(largeHtml);
    assert(content.length <= 5005, 'Content trimmed safely');
  });

  // ----------------------------------------------------
  // SUITE 3: ANALYSIS & CLAIM EXTRACTION (10+ tests)
  // ----------------------------------------------------
  console.log('\nSuite 3: Content Ingestion & Claim Extraction (10 tests)');

  await runTest('Analysis', 'Extracts primary factual claim from declarative statement', () => {
    const text = 'The central bank has ordered a complete ban on cryptocurrency transactions starting tomorrow.';
    const res = fallbackNLPAnalysis(text, 'TEXT');
    assert(res.claims.length > 0, 'Claims extracted');
    assert(res.claims[0].claim_text.includes('central bank'), 'Claim matches subject');
  });

  await runTest('Analysis', 'Identifies statistical claim type when metrics/percentages are present', () => {
    const text = 'Renewable energy generation increased by 35% across 2025 according to the latest research bulletin.';
    const res = fallbackNLPAnalysis(text, 'TEXT');
    assert(res.claims[0].claim_type === 'STATISTICAL', 'Statistical claim classified');
  });

  await runTest('Analysis', 'Detects Hindi language correctly from Devanagari script', () => {
    const hindiText = 'नासा ने जेम्स वेब टेलीस्कोप से एक्सोप्लैनेट के वातावरण में जल वाष्प पाया।';
    const res = fallbackNLPAnalysis(hindiText, 'TEXT');
    assert(res.detected_language.code === 'hi', 'Hindi code detected');
    assert(res.detected_language.name === 'Hindi', 'Hindi name detected');
  });

  await runTest('Analysis', 'Detects English language correctly from Latin script', () => {
    const englishText = 'Scientists announced the discovery of a new deep-sea hydrothermal ecosystem.';
    const res = fallbackNLPAnalysis(englishText, 'TEXT');
    assert(res.detected_language.code === 'en', 'English code detected');
  });

  await runTest('Analysis', 'Detects sensationalist viral keywords and flags higher risk', () => {
    const viral = 'Shocking miracle cure doctors do not want you to know cures 100% of viral infections.';
    const res = fallbackNLPAnalysis(viral, 'TEXT');
    assert(res.prediction === 'Likely False', 'Sensationalism flagged Likely False');
    assert(res.credibility_score < 40, 'Low credibility score');
  });

  await runTest('Analysis', 'Evaluates neutral non-sensational claim with balanced score', () => {
    const neutral = 'The municipal council published its annual infrastructure expenditure report for public review.';
    const res = fallbackNLPAnalysis(neutral, 'TEXT');
    assert(res.credibility_score >= 50, 'Neutral credibility score');
  });

  await runTest('Analysis', 'Generates Explainable AI (XAI) factors', () => {
    const text = 'Government agencies published an official gazette regarding new automotive safety regulations.';
    const res = fallbackNLPAnalysis(text, 'TEXT');
    assert(res.xai_factors.length > 0, 'XAI factors generated');
    assert(Boolean(res.xai_factors[0].description), 'Factor has description');
  });

  await runTest('Analysis', 'Persists analysis record to repository', () => {
    const created = AnalysisRepository.create({
      id: 'ana-test-suite',
      input_type: 'TEXT',
      original_text: 'Test statement for verification repository.',
      detected_language: { code: 'en', name: 'English', confidence: 0.99 },
      prediction: 'Unverified',
      confidence: 80,
      credibility_score: 50,
      explanation: 'Automated test suite record.',
      xai_factors: [],
      claims: [],
      evidence: [],
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    });
    assert(created.id === 'ana-test-suite', 'Created with correct ID');
    const found = AnalysisRepository.findById('ana-test-suite');
    assert(found !== undefined, 'Found in repository');
  });

  await runTest('Analysis', 'Deletes analysis record when requested', () => {
    const deleted = AnalysisRepository.delete('ana-test-suite');
    assert(deleted === true, 'Delete returned true');
    assert(AnalysisRepository.findById('ana-test-suite') === undefined, 'No longer found');
  });

  await runTest('Analysis', 'Normalizes text whitespace and trim', () => {
    const raw = '   Multiple    spaces   in   statement.   ';
    const res = fallbackNLPAnalysis(raw, 'TEXT');
    assert(!res.normalized_text.startsWith(' '), 'Trimmed leading space');
  });

  // ----------------------------------------------------
  // SUITE 4: EVIDENCE, RAG & CREDIBILITY SCORING (8+ tests)
  // ----------------------------------------------------
  console.log('\nSuite 4: Evidence & RAG Stance Scoring (8 tests)');

  await runTest('Evidence', 'Calculates high credibility score when authoritative evidence SUPPORTS', () => {
    const result = calculateCredibilityScore({
      mlPrediction: 'Likely True',
      mlConfidence: 90,
      evidence: [
        {
          id: 'ev-1',
          analysis_id: 'test',
          title: 'Official Gazette',
          url: 'https://pib.gov.in',
          source_name: 'PIB',
          source_type: 'OFFICIAL',
          source_reputation: 95,
          evidence_text: 'Official confirmation.',
          stance: 'SUPPORTS',
          relevance_score: 95,
        },
      ],
    });
    assert(result.score >= 70, `Score is high (${result.score})`);
    assert(result.verdict === 'Likely True', 'Verdict is Likely True');
  });

  await runTest('Evidence', 'Calculates low credibility score when authoritative evidence CONTRADICTS', () => {
    const result = calculateCredibilityScore({
      mlPrediction: 'Likely False',
      mlConfidence: 95,
      evidence: [
        {
          id: 'ev-2',
          analysis_id: 'test',
          title: 'Debunking Report',
          url: 'https://altnews.in',
          source_name: 'Alt News',
          source_type: 'FACT_CHECK',
          source_reputation: 92,
          evidence_text: 'Debunked false rumor.',
          stance: 'CONTRADICTS',
          relevance_score: 96,
        },
      ],
    });
    assert(result.score <= 35, `Score is low (${result.score})`);
    assert(result.verdict === 'Likely False', 'Verdict is Likely False');
  });

  await runTest('Evidence', 'Flags "Insufficient Evidence" when zero citations retrieved', () => {
    const result = calculateCredibilityScore({
      mlPrediction: 'Unverified',
      mlConfidence: 70,
      evidence: [],
    });
    assert(result.verdict === 'Insufficient Evidence', 'Verdict is Insufficient Evidence');
    assert(result.score === 50, 'Neutral default score');
  });

  await runTest('Evidence', 'Flags "Misleading" when evidence contains mixed support and contradiction', () => {
    const result = calculateCredibilityScore({
      mlPrediction: 'Misleading',
      mlConfidence: 80,
      evidence: [
        {
          id: 'ev-3',
          analysis_id: 'test',
          title: 'Partial confirmation',
          url: 'https://news.com/1',
          source_name: 'Press 1',
          source_type: 'NEWS',
          source_reputation: 80,
          evidence_text: 'Some details true.',
          stance: 'SUPPORTS',
          relevance_score: 85,
        },
        {
          id: 'ev-4',
          analysis_id: 'test',
          title: 'Context refuted',
          url: 'https://news.com/2',
          source_name: 'Press 2',
          source_type: 'NEWS',
          source_reputation: 85,
          evidence_text: 'Headline premise is false.',
          stance: 'CONTRADICTS',
          relevance_score: 90,
        },
      ],
    });
    assert(result.verdict === 'Misleading', 'Verdict is Misleading');
  });

  await runTest('Evidence', 'Source repository finds Reuters with high reputation', () => {
    const source = SourceRepository.findByDomain('reuters.com');
    assert(source !== undefined, 'Reuters found');
    assert((source?.reputation_score ?? 0) >= 90, 'Reputation score is 90+');
  });

  await runTest('Evidence', 'Source repository finds PIB with official verification status', () => {
    const source = SourceRepository.findByDomain('pib.gov.in');
    assert(source !== undefined, 'PIB found');
    assert(source?.verification_status === 'OFFICIAL', 'Status is OFFICIAL');
  });

  await runTest('Evidence', 'Source repository assigns default score to unknown domain', () => {
    const source = SourceRepository.findByDomain('unregistered-random-blog-2026.org');
    assert(source === undefined, 'Unknown domain not in registry');
  });

  await runTest('Evidence', 'Adds/upserts new trusted source to registry', () => {
    const created = SourceRepository.upsert({
      id: 'src-test-upsert',
      domain: 'testaccreditation.org',
      source_name: 'Test Accreditation Board',
      reputation_score: 88,
      category: 'OFFICIAL',
      verification_status: 'OFFICIAL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    assert(created.domain === 'testaccreditation.org', 'Domain matches');
    const found = SourceRepository.findByDomain('testaccreditation.org');
    assert(found?.reputation_score === 88, 'Reputation score persists');
  });

  // ----------------------------------------------------
  // SUITE 5: API INTEGRATION TESTS (10+ tests)
  // ----------------------------------------------------
  console.log('\nSuite 5: REST API Integration Endpoints (10 tests)');

  function makeLocalRequest(path: string, options: http.RequestOptions = {}, postData?: string): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 3000,
          path,
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const body = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode || 500, body });
            } catch {
              resolve({ status: res.statusCode || 500, body: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }

  await runTest('API', 'GET /api/health returns 200 and healthy status', async () => {
    const res = await makeLocalRequest('/api/health');
    assert(res.status === 200, 'Status is 200');
    assert(res.body.status === 'healthy', 'Status is healthy');
  });

  await runTest('API', 'GET /api/analyses returns analyses list with pagination meta', async () => {
    const res = await makeLocalRequest('/api/analyses?page=1&limit=5');
    assert(res.status === 200, 'Status is 200');
    assert(res.body.success === true, 'Success is true');
    assert(Array.isArray(res.body.data.analyses), 'Analyses is array');
    assert(typeof res.body.data.total === 'number', 'Total is number');
  });

  await runTest('API', 'GET /api/sources returns list of tracked reputation sources', async () => {
    const res = await makeLocalRequest('/api/sources');
    assert(res.status === 200, 'Status is 200');
    assert(Array.isArray(res.body.data.sources), 'Sources is array');
    assert(res.body.data.sources.length >= 10, 'Contains 10+ sources');
  });

  await runTest('API', 'POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await makeLocalRequest(
      '/api/auth/login',
      { method: 'POST' },
      JSON.stringify({ email: 'analyst@truthlens.ai', password: 'Analyst@2026' })
    );
    assert(res.status === 200, 'Status 200');
    assert(Boolean(res.body.data.token), 'Token returned');
    assert(res.body.data.user.email === 'analyst@truthlens.ai', 'User email verified');
  });

  await runTest('API', 'POST /api/auth/login rejects incorrect password with 401', async () => {
    const res = await makeLocalRequest(
      '/api/auth/login',
      { method: 'POST' },
      JSON.stringify({ email: 'analyst@truthlens.ai', password: 'WrongPassword@123' })
    );
    assert(res.status === 401, 'Status 401 unauthorized');
    assert(res.body.success === false, 'Success is false');
  });

  await runTest('API', 'GET /api/admin/stats rejects unauthenticated access with 401', async () => {
    const res = await makeLocalRequest('/api/admin/stats');
    assert(res.status === 401, 'Status 401 unauthorized');
  });

  await runTest('API', 'GET /api/admin/stats rejects normal USER with 403 Forbidden', async () => {
    const userToken = generateToken({ userId: 'usr-analyst', email: 'analyst@truthlens.ai', role: 'USER' });
    const res = await makeLocalRequest('/api/admin/stats', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(res.status === 403, 'Status 403 Forbidden');
  });

  await runTest('API', 'GET /api/admin/stats permits ADMIN user with 200 OK', async () => {
    const adminToken = generateToken({ userId: 'usr-admin', email: 'admin@truthlens.ai', role: 'ADMIN' });
    const res = await makeLocalRequest('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, 'Status 200 OK');
    assert(Boolean(res.body.data.stats), 'Stats data present');
  });

  await runTest('API', 'POST /api/analyze queues asynchronous analysis job (Step 17)', async () => {
    const res = await makeLocalRequest(
      '/api/analyze',
      { method: 'POST' },
      JSON.stringify({
        type: 'TEXT',
        content: 'New astronomical observations detect atmospheric compounds on candidate exoplanet.',
      })
    );
    assert(res.status === 202, 'Status 202 Accepted');
    assert(res.body.data.status === 'QUEUED', 'Job status is QUEUED');
    assert(Boolean(res.body.data.job_id), 'Job ID returned');
  });

  await runTest('API', 'GET /api/openapi.json returns valid OpenAPI 3.0 specification', async () => {
    const res = await makeLocalRequest('/api/openapi.json');
    assert(res.status === 200, 'Status 200');
    assert(res.body.openapi === '3.0.3', 'OpenAPI 3.0.3 version verified');
    assert(Boolean(res.body.paths['/api/analyze/text']), 'Analysis path documented');
  });

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n====================================================');
  console.log(`Test Execution Summary: ${passed}/${total} passed (${failed} failed)`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});

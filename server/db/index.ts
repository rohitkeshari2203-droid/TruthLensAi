import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Analysis,
  Claim,
  EvidenceItem,
  Source,
  SavedItem,
  Report,
  AuditLog,
} from '../types.js';

interface DatabaseSchema {
  users: User[];
  analyses: Analysis[];
  claims: Claim[];
  evidence: EvidenceItem[];
  sources: Source[];
  saved_items: SavedItem[];
  reports: Report[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// In-memory cache
let db: DatabaseSchema = {
  users: [],
  analyses: [],
  claims: [],
  evidence: [],
  sources: [],
  saved_items: [],
  reports: [],
  audit_logs: [],
};

// Seed trusted sources
const SEED_SOURCES: Source[] = [
  {
    id: 'src-1',
    domain: 'reuters.com',
    source_name: 'Reuters',
    reputation_score: 96,
    category: 'MAINSTREAM_NEWS',
    verification_status: 'VERIFIED',
    description: 'International news agency with rigorous editorial standards.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-2',
    domain: 'apnews.com',
    source_name: 'Associated Press',
    reputation_score: 97,
    category: 'MAINSTREAM_NEWS',
    verification_status: 'VERIFIED',
    description: 'Primary non-profit news cooperative dedicated to factual reporting.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-3',
    domain: 'bbc.com',
    source_name: 'BBC News',
    reputation_score: 92,
    category: 'MAINSTREAM_NEWS',
    verification_status: 'VERIFIED',
    description: 'Public service broadcaster with high editorial accountability.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-4',
    domain: 'who.int',
    source_name: 'World Health Organization',
    reputation_score: 98,
    category: 'OFFICIAL',
    verification_status: 'OFFICIAL',
    description: 'Specialized agency of the UN responsible for international public health.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-5',
    domain: 'snopes.com',
    source_name: 'Snopes',
    reputation_score: 91,
    category: 'FACT_CHECK',
    verification_status: 'VERIFIED',
    description: 'Pioneering independent fact-checking website.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-6',
    domain: 'factcheck.org',
    source_name: 'FactCheck.org',
    reputation_score: 94,
    category: 'FACT_CHECK',
    verification_status: 'VERIFIED',
    description: 'Annenberg Public Policy Center nonpartisan fact-checker.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-7',
    domain: 'pib.gov.in',
    source_name: 'Press Information Bureau (PIB)',
    reputation_score: 95,
    category: 'OFFICIAL',
    verification_status: 'OFFICIAL',
    description: 'Nodal agency of the Government of India for official announcements & Fact Check unit.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-8',
    domain: 'altnews.in',
    source_name: 'Alt News',
    reputation_score: 89,
    category: 'FACT_CHECK',
    verification_status: 'VERIFIED',
    description: 'Certified non-profit fact-checking initiative focused on Indian media.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-9',
    domain: 'thehindu.com',
    source_name: 'The Hindu',
    reputation_score: 90,
    category: 'MAINSTREAM_NEWS',
    verification_status: 'VERIFIED',
    description: 'Prominent national English daily newspaper of India.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-10',
    domain: 'nature.com',
    source_name: 'Nature Research',
    reputation_score: 99,
    category: 'ACADEMIC',
    verification_status: 'OFFICIAL',
    description: 'Peer-reviewed international scientific journal.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'src-11',
    domain: 'viralclicknews.xyz',
    source_name: 'Viral Click Daily',
    reputation_score: 18,
    category: 'USER_CONTENT',
    verification_status: 'QUESTIONABLE',
    description: 'Low-credibility aggregation site known for unverified clickbait.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// Seed sample analyses for realistic starting dataset
const SEED_ANALYSES: Analysis[] = [
  {
    id: 'ana-seed-01',
    user_id: 'usr-analyst',
    input_type: 'TEXT',
    original_text: 'The Reserve Bank of India has announced that all 500 rupee notes will be decommissioned by midnight today.',
    detected_language: {
      code: 'en',
      name: 'English',
      confidence: 0.99,
    },
    prediction: 'Likely False',
    confidence: 94,
    credibility_score: 8,
    explanation: 'The Reserve Bank of India and PIB Fact Check have explicitly debunked this circulating rumor. The current series of Rs 500 currency notes remains legal tender.',
    xai_factors: [
      {
        category: 'EVIDENCE',
        impact: 'NEGATIVE',
        description: 'Direct contradiction found in official RBI regulatory notifications and PIB Fact Check reports.',
      },
      {
        category: 'LINGUISTIC',
        impact: 'NEGATIVE',
        description: 'Employs false urgency tactics ("by midnight today") typical of financial panic disinformation.',
      },
      {
        category: 'SOURCE',
        impact: 'NEGATIVE',
        description: 'No verified citation provided; statement conflicts with all major financial news services.',
      },
    ],
    claims: [
      {
        id: 'clm-01',
        analysis_id: 'ana-seed-01',
        claim_text: 'RBI has announced decommissioning of Rs 500 notes by midnight today.',
        claim_type: 'POLICY',
        confidence: 96,
      },
    ],
    evidence: [
      {
        id: 'ev-01',
        analysis_id: 'ana-seed-01',
        claim_id: 'clm-01',
        title: 'PIB Fact Check: Rs 500 notes are not being discontinued',
        url: 'https://pib.gov.in/FactCheck/detail.aspx?id=500note',
        source_name: 'Press Information Bureau',
        source_type: 'OFFICIAL',
        source_reputation: 95,
        publication_date: '2026-02-14',
        evidence_text: 'Press Information Bureau confirmed that reports claiming RBI is withdrawing Rs 500 notes are completely false.',
        stance: 'CONTRADICTS',
        relevance_score: 97,
      },
      {
        id: 'ev-02',
        analysis_id: 'ana-seed-01',
        claim_id: 'clm-01',
        title: 'RBI Clarification on Currency Notes in Circulation',
        url: 'https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx',
        source_name: 'Reserve Bank of India',
        source_type: 'OFFICIAL',
        source_reputation: 98,
        publication_date: '2026-02-15',
        evidence_text: 'No notification regarding discontinuation of current legal tender Rs 500 denomination has been issued.',
        stance: 'CONTRADICTS',
        relevance_score: 95,
      },
    ],
    status: 'COMPLETED',
    created_at: '2026-03-28T14:20:00Z',
  },
  {
    id: 'ana-seed-02',
    user_id: 'usr-analyst',
    input_type: 'TEXT',
    original_text: 'नासा ने घोषणा की है कि जेम्स वेब स्पेस टेलीस्कोप ने सौर मंडल के बाहर एक नए एक्सोप्लैनेट पर पानी के वाष्प का पता लगाया है।',
    detected_language: {
      code: 'hi',
      name: 'Hindi',
      confidence: 0.98,
      script: 'Devanagari',
    },
    prediction: 'Likely True',
    confidence: 91,
    credibility_score: 88,
    explanation: 'दावा वैज्ञानिक रिपोर्टों और नासा द्वारा प्रकाशित जेम्स वेब स्पेस टेलीस्कोप (JWST) के स्पेक्ट्रोस्कोपिक डेटा के अनुरूप है।',
    xai_factors: [
      {
        category: 'EVIDENCE',
        impact: 'POSITIVE',
        description: 'NASA astrophysics press releases and peer-reviewed spectroscopic datasets substantiate water vapor signatures in exoplanet atmospheres.',
      },
      {
        category: 'SOURCE',
        impact: 'POSITIVE',
        description: 'Attributed directly to astronomical observatories with matching scientific citations.',
      },
    ],
    claims: [
      {
        id: 'clm-02',
        analysis_id: 'ana-seed-02',
        claim_text: 'जेम्स वेब स्पेस टेलीस्कोप ने एक्सोप्लैनेट के वातावरण में जल वाष्प के संकेत पाए।',
        claim_type: 'FACTUAL_ASSERTION',
        confidence: 92,
      },
    ],
    evidence: [
      {
        id: 'ev-03',
        analysis_id: 'ana-seed-02',
        claim_id: 'clm-02',
        title: 'NASA Webb Detects Water Vapor in Rocky Exoplanet Atmosphere',
        url: 'https://nasa.gov/mission_pages/webb/science/exoplanet-water',
        source_name: 'NASA Official',
        source_type: 'ACADEMIC',
        source_reputation: 98,
        publication_date: '2026-01-20',
        evidence_text: 'Astronomers using NASAs James Webb Space Telescope have discovered evidence of water vapor around candidate exoplanet.',
        stance: 'SUPPORTS',
        relevance_score: 93,
      },
    ],
    status: 'COMPLETED',
    created_at: '2026-03-29T09:15:00Z',
  },
  {
    id: 'ana-seed-03',
    user_id: 'usr-admin',
    input_type: 'SOCIAL',
    original_text: 'Drinking boiled garlic water cures 100% of viral infections within 3 hours according to doctors.',
    detected_language: {
      code: 'en',
      name: 'English',
      confidence: 0.99,
    },
    prediction: 'Likely False',
    confidence: 96,
    credibility_score: 4,
    explanation: 'Health authorities including WHO and peer-reviewed medical journals confirm that while garlic has mild antimicrobial properties, there is zero clinical evidence that it cures viral infections.',
    xai_factors: [
      {
        category: 'EVIDENCE',
        impact: 'NEGATIVE',
        description: 'World Health Organization mythbuster specifically disproves garlic water as a viral cure.',
      },
      {
        category: 'LINGUISTIC',
        impact: 'NEGATIVE',
        description: 'Contains absolute medical claims ("100% cure within 3 hours") with pseudoscientific attribution ("according to doctors").',
      },
    ],
    claims: [
      {
        id: 'clm-03',
        analysis_id: 'ana-seed-03',
        claim_text: 'Drinking boiled garlic water cures 100% of viral infections in 3 hours.',
        claim_type: 'STATISTICAL',
        confidence: 98,
      },
    ],
    evidence: [
      {
        id: 'ev-04',
        analysis_id: 'ana-seed-03',
        claim_id: 'clm-03',
        title: 'WHO Advice for Public: Coronavirus disease (COVID-19) mythbusters',
        url: 'https://who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters',
        source_name: 'World Health Organization',
        source_type: 'OFFICIAL',
        source_reputation: 98,
        publication_date: '2026-01-10',
        evidence_text: 'Garlic is a healthy food that may have some antimicrobial properties. However, there is no evidence that eating garlic cures or protects against viruses.',
        stance: 'CONTRADICTS',
        relevance_score: 96,
      },
    ],
    status: 'COMPLETED',
    created_at: '2026-04-01T11:42:00Z',
  },
  {
    id: 'ana-seed-04',
    user_id: 'usr-analyst',
    input_type: 'URL',
    source_url: 'https://example.com/energy-announcement',
    original_text: 'Solar and wind accounted for over 30% of global electricity generation in recent quarterly milestones.',
    detected_language: {
      code: 'en',
      name: 'English',
      confidence: 0.97,
    },
    prediction: 'Partially Supported',
    confidence: 84,
    credibility_score: 72,
    explanation: 'Renewable energy reports verify historic generation records in several major economies, though the exact global percentage varies depending on seasonal hydroelectric inclusion.',
    xai_factors: [
      {
        category: 'EVIDENCE',
        impact: 'POSITIVE',
        description: 'International Energy Agency data supports peak renewable generation thresholds exceeding 30% in specified regions.',
      },
      {
        category: 'CONSISTENCY',
        impact: 'NEUTRAL',
        description: 'Nuance between combined renewables (including hydro) vs solely wind and solar requires careful metric distinction.',
      },
    ],
    claims: [
      {
        id: 'clm-04',
        analysis_id: 'ana-seed-04',
        claim_text: 'Solar and wind accounted for over 30% of electricity generation.',
        claim_type: 'STATISTICAL',
        confidence: 88,
      },
    ],
    evidence: [
      {
        id: 'ev-05',
        analysis_id: 'ana-seed-04',
        claim_id: 'clm-04',
        title: 'Global Electricity Review: Renewables Milestones',
        url: 'https://ember-climate.org/insights/research/global-electricity-review',
        source_name: 'Ember Energy Research',
        source_type: 'ACADEMIC',
        source_reputation: 91,
        publication_date: '2026-02-18',
        evidence_text: 'Wind and solar reached record highs, contributing significantly alongside broader low-carbon sources.',
        stance: 'SUPPORTS',
        relevance_score: 87,
      },
    ],
    status: 'COMPLETED',
    created_at: '2026-04-02T16:05:00Z',
  },
];

// Initialize database
export async function initDb(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
    } else {
      // Create initial seed
      const adminHash = await bcrypt.hash('AdminPassword@2026', 10);
      const analystHash = await bcrypt.hash('Analyst@2026', 10);

      db = {
        users: [
          {
            id: 'usr-admin',
            name: 'System Administrator',
            email: 'admin@truthlens.ai',
            password_hash: adminHash,
            role: 'ADMIN',
            preferred_language: 'en',
            is_verified: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'usr-analyst',
            name: 'Senior Fact Analyst',
            email: 'analyst@truthlens.ai',
            password_hash: analystHash,
            role: 'USER',
            preferred_language: 'en',
            is_verified: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        analyses: SEED_ANALYSES,
        claims: SEED_ANALYSES.flatMap((a) => a.claims),
        evidence: SEED_ANALYSES.flatMap((a) => a.evidence),
        sources: SEED_SOURCES,
        saved_items: [
          {
            id: 'saved-1',
            user_id: 'usr-analyst',
            analysis_id: 'ana-seed-01',
            created_at: '2026-03-29T10:00:00Z',
          },
        ],
        reports: [],
        audit_logs: [
          {
            id: 'log-1',
            user_id: 'usr-admin',
            action: 'SYSTEM_INITIALIZED',
            details: { message: 'TruthLens AI database bootstrapped successfully' },
            created_at: new Date().toISOString(),
          },
        ],
      };

      saveDb();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

function saveDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

// Repositories
export const UserRepository = {
  findByEmail(email: string): User | undefined {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  },
  getAll(): User[] {
    return [...db.users];
  },
  create(user: User): User {
    db.users.push(user);
    saveDb();
    return user;
  },
  update(id: string, updates: Partial<User>): User | undefined {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    db.users[idx] = { ...db.users[idx], ...updates, updated_at: new Date().toISOString() };
    saveDb();
    return db.users[idx];
  },
};

export const AnalysisRepository = {
  create(analysis: Analysis): Analysis {
    db.analyses.unshift(analysis);
    if (analysis.claims?.length) {
      db.claims.push(...analysis.claims);
    }
    if (analysis.evidence?.length) {
      db.evidence.push(...analysis.evidence);
    }
    saveDb();
    return analysis;
  },
  findById(id: string): Analysis | undefined {
    return db.analyses.find((a) => a.id === id);
  },
  getAll(userId?: string): Analysis[] {
    if (userId) {
      return db.analyses.filter((a) => a.user_id === userId || !a.user_id);
    }
    return [...db.analyses];
  },
  delete(id: string): boolean {
    const idx = db.analyses.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    db.analyses.splice(idx, 1);
    db.claims = db.claims.filter((c) => c.analysis_id !== id);
    db.evidence = db.evidence.filter((e) => e.analysis_id !== id);
    db.saved_items = db.saved_items.filter((s) => s.analysis_id !== id);
    saveDb();
    return true;
  },
};

export const SavedItemRepository = {
  getUserSaved(userId: string): SavedItem[] {
    return db.saved_items.filter((s) => s.user_id === userId);
  },
  isSaved(userId: string, analysisId: string): boolean {
    return db.saved_items.some((s) => s.user_id === userId && s.analysis_id === analysisId);
  },
  save(userId: string, analysisId: string): SavedItem {
    const existing = db.saved_items.find((s) => s.user_id === userId && s.analysis_id === analysisId);
    if (existing) return existing;
    const item: SavedItem = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      analysis_id: analysisId,
      created_at: new Date().toISOString(),
    };
    db.saved_items.push(item);
    saveDb();
    return item;
  },
  remove(userId: string, analysisId: string): boolean {
    const initialLen = db.saved_items.length;
    db.saved_items = db.saved_items.filter((s) => !(s.user_id === userId && s.analysis_id === analysisId));
    if (db.saved_items.length !== initialLen) {
      saveDb();
      return true;
    }
    return false;
  },
};

export const ReportRepository = {
  create(report: Report): Report {
    db.reports.unshift(report);
    saveDb();
    return report;
  },
  getAll(): Report[] {
    return [...db.reports];
  },
  updateStatus(id: string, status: 'PENDING' | 'REVIEWED' | 'DISMISSED'): Report | undefined {
    const report = db.reports.find((r) => r.id === id);
    if (report) {
      report.status = status;
      saveDb();
    }
    return report;
  },
};

export const SourceRepository = {
  getAll(): Source[] {
    return [...db.sources];
  },
  findByDomain(domain: string): Source | undefined {
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    return db.sources.find((s) => s.domain.toLowerCase() === cleanDomain);
  },
  upsert(source: Source): Source {
    const idx = db.sources.findIndex((s) => s.domain.toLowerCase() === source.domain.toLowerCase());
    if (idx !== -1) {
      db.sources[idx] = { ...db.sources[idx], ...source, updated_at: new Date().toISOString() };
    } else {
      db.sources.push(source);
    }
    saveDb();
    return source;
  },
};

export const AuditLogRepository = {
  log(action: string, userId?: string, details?: Record<string, any>, ip?: string, userAgent?: string): void {
    const logItem: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      action,
      details,
      ip_address: ip,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    };
    db.audit_logs.unshift(logItem);
    // Keep max 1000 logs
    if (db.audit_logs.length > 1000) {
      db.audit_logs.pop();
    }
    saveDb();
  },
  getAll(): AuditLog[] {
    return [...db.audit_logs];
  },
};

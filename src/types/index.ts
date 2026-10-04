export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferred_language: string;
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}

export type Verdict =
  | 'Likely True'
  | 'Likely False'
  | 'Misleading'
  | 'Partially Supported'
  | 'Unverified'
  | 'Insufficient Evidence';

export type InputType = 'URL' | 'TEXT' | 'IMAGE' | 'SOCIAL';
export type EvidenceStance = 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
export type SourceCategory = 'OFFICIAL' | 'FACT_CHECK' | 'MAINSTREAM_NEWS' | 'ACADEMIC' | 'USER_CONTENT' | 'UNKNOWN';
export type VerificationStatus = 'VERIFIED' | 'QUESTIONABLE' | 'UNVERIFIED' | 'OFFICIAL';

export interface Claim {
  id: string;
  analysis_id: string;
  claim_text: string;
  claim_type: 'FACTUAL_ASSERTION' | 'STATISTICAL' | 'ATTRIBUTION' | 'POLICY';
  confidence: number;
}

export interface EvidenceItem {
  id: string;
  analysis_id: string;
  claim_id?: string;
  title: string;
  url: string;
  source_name: string;
  source_type: string;
  source_reputation?: number;
  publication_date?: string;
  evidence_text: string;
  stance: EvidenceStance;
  relevance_score: number;
}

export interface XAIFactor {
  category: 'EVIDENCE' | 'LINGUISTIC' | 'SOURCE' | 'CONSISTENCY';
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
}

export interface Analysis {
  id: string;
  user_id?: string;
  input_type: InputType;
  original_text: string;
  source_url?: string;
  detected_language: {
    code: string;
    name: string;
    confidence: number;
    script?: string;
  };
  normalized_text?: string;
  prediction: Verdict;
  confidence: number;
  credibility_score: number;
  explanation: string;
  xai_factors: XAIFactor[];
  claims: Claim[];
  evidence: EvidenceItem[];
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  error_message?: string;
  created_at: string;
}

export interface Source {
  id: string;
  domain: string;
  source_name: string;
  reputation_score: number;
  category: SourceCategory;
  verification_status: VerificationStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id?: string;
  analysis_id: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  created_at: string;
  analysis?: {
    id: string;
    prediction: Verdict;
    confidence: number;
    original_text: string;
  };
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  created_at: string;
}

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    preferred_language: str = "en"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=10)
    inputType: str = "TEXT"

class AnalyzeUrlRequest(BaseModel):
    url: str

class ClaimResponse(BaseModel):
    id: str
    claim_text: str
    claim_type: str
    confidence: float

class EvidenceResponse(BaseModel):
    id: str
    title: str
    url: str
    source_name: str
    source_type: str
    source_reputation: float
    publication_date: Optional[str] = None
    evidence_text: str
    stance: str
    relevance_score: float

class XAIFactor(BaseModel):
    category: str
    impact: str
    description: str

class AnalysisResponse(BaseModel):
    id: str
    input_type: str
    original_text: str
    source_url: Optional[str] = None
    detected_language: Dict[str, Any]
    normalized_text: Optional[str] = None
    prediction: str
    confidence: float
    credibility_score: float
    explanation: str
    xai_factors: List[XAIFactor]
    claims: List[ClaimResponse]
    evidence: List[EvidenceResponse]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

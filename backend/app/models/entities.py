from datetime import datetime
import uuid
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Float,
    Integer,
    ForeignKey,
    Text,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER", nullable=False)
    preferred_language = Column(String(10), default="en")
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    analyses = relationship("Analysis", back_populates="user")
    saved_items = relationship("SavedItem", back_populates="user")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    input_type = Column(String(20), nullable=False)  # URL, TEXT, IMAGE, SOCIAL
    original_text = Column(Text, nullable=False)
    source_url = Column(String(1000), nullable=True)
    detected_language = Column(JSON, nullable=False)
    normalized_text = Column(Text, nullable=True)
    prediction = Column(String(50), nullable=False)  # Likely True, Likely False, etc.
    confidence = Column(Float, nullable=False)
    credibility_score = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    xai_factors = Column(JSON, nullable=True)
    status = Column(String(20), default="COMPLETED")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")
    claims = relationship("Claim", back_populates="analysis", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="analysis", cascade="all, delete-orphan")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    claim_type = Column(String(50), default="FACTUAL_ASSERTION")
    confidence = Column(Float, default=85.0)

    analysis = relationship("Analysis", back_populates="claims")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    claim_id = Column(String(36), ForeignKey("claims.id"), nullable=True)
    title = Column(String(500), nullable=False)
    url = Column(String(1000), nullable=False)
    source_name = Column(String(255), nullable=False)
    source_type = Column(String(50), default="NEWS")
    source_reputation = Column(Float, default=75.0)
    publication_date = Column(String(50), nullable=True)
    evidence_text = Column(Text, nullable=False)
    stance = Column(String(20), nullable=False)  # SUPPORTS, CONTRADICTS, NEUTRAL
    relevance_score = Column(Float, default=80.0)

    analysis = relationship("Analysis", back_populates="evidence")

class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain = Column(String(255), unique=True, index=True, nullable=False)
    source_name = Column(String(255), nullable=False)
    reputation_score = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    verification_status = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SavedItem(Base):
    __tablename__ = "saved_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_items")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    reason = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

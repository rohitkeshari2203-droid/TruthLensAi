# TruthLens AI — System Architecture Specification

## 1. Executive Summary

TruthLens AI is an enterprise-grade, multilingual fake news and misinformation detection platform. Designed as an MCA Major Project, it demonstrates full-stack software architecture, natural language processing (NLP), retrieval-augmented verification (RAG), multimodal computer vision (OCR), and robust cybersecurity defenses.

## 2. Architectural Layers

### A. Presentation Layer (Frontend)
- **Framework**: React 19 with TypeScript, bundled using Vite.
- **Styling**: Tailwind CSS adhering to enterprise light-mode aesthetics (WCAG AA compliant, zero-pill typography, clean cards, no mechanical slop).
- **Routing**: React Router DOM (v7) managing protected routes, public workspace, and admin consoles.
- **Visualization**: Recharts for real-time analytics (Verdict Distribution, Multilingual Ingestion, Volume Trendlines).

### B. Gateway & API Layer
- **Runtime**: Express full-stack entrypoint (`server.ts`) with seamless Vite dev middleware integration on port 3000.
- **Protocol**: RESTful HTTP API with standardized JSON envelope payloads and OpenAPI 3.0 schemas.
- **Security Middleware**: HTTP-only JWT cookies, SameSite enforcement, rate limiting, and Server-Side Request Forgery (SSRF) defense filters.

### C. Core Processing Engines
1. **SSRF-Protected Scraper**: Safely downloads web news articles, resolves DNS records to strictly block internal/loopback/cloud-metadata addresses, and strips scripts, ads, and navigation boilerplate.
2. **Multilingual NLP Module**: Identifies languages (English, Hindi, Bengali, Tamil, etc.), detects scripts, and extracts verifiable factual claims from rhetorical discourse.
3. **Multimodal OCR Vision**: Processes user-uploaded screenshots and images using Gemini 3.8 Flash Vision, extracting headlines, timestamps, and visible body text with an editable preview buffer.
4. **RAG & Search Grounding Engine**: Dynamically retrieves real-world articles, official government bulletins, and fact-checking archives.
5. **Stance & Credibility Scorer**: Classifies retrieved evidence into `SUPPORTS`, `CONTRADICTS`, or `NEUTRAL` positions, calculating an engineering confidence metric.
6. **Explainable AI (XAI) Synthesizer**: Generates clear, non-opaque reasoning factors so users understand exactly why a claim is flagged.

### D. Data Persistence Layer
- **ACID Persistent Store**: Thread-safe, JSON-backed atomic file store with schema migrations and seed datasets.
- **PostgreSQL / SQLAlchemy**: Complete relational schema and async database models ready for enterprise multi-node deployment.

# TruthLens AI — Multilingual Fake News & Misinformation Detection Platform

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![FastAPI & Express](https://img.shields.io/badge/Backend-Express%20%7C%20FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Manifest V3](https://img.shields.io/badge/Extension-Manifest%20V3-yellow.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

**TruthLens AI** is an enterprise-grade, multilingual AI-powered platform for detecting fake news and digital misinformation. Built as an MCA Major Project, it replaces opaque black-box predictions with **Retrieval-Augmented Verification (RAG)**, cross-referencing claims with verified external evidence and accredited news archives.

---

## 1. Project Overview & Problem Statement

Digital misinformation spreads rapidly across online platforms and private chat channels. Existing automated detection systems suffer from severe limitations:
- **Hallucination Risk**: Large language models often hallucinate facts or rely on stale pre-training datasets.
- **Language Bias**: Most verification models only support English, failing on Indic languages such as Hindi, Bengali, or Tamil.
- **Opaque Scoring**: Users are presented with a confidence score without external corroborating or refuting evidence.

**TruthLens AI** solves this through an **evidence-first verification pipeline**:
1. Accepts **URLs**, **raw text**, **screenshots (OCR)**, or **social media posts**.
2. Decomposes content into isolated factual assertions.
3. Retrieves live reporting from verified news sources, official government bulletins, and fact-checking archives.
4. Determines evidence stance (**SUPPORTS**, **CONTRADICTS**, **NEUTRAL**).
5. Calculates a transparent, multi-factor credibility score ($0-100$).
6. Provides human-auditable **Explainable AI (XAI)** factors.

---

## 2. Key Features

- **Multi-Modal Ingestion**:
  - News Article URL (safe scraping with **Server-Side Request Forgery [SSRF] defense**).
  - Raw Text & Headlines.
  - Social Media Posts (X, WhatsApp, Facebook, Telegram).
  - Screenshot / Image Upload with multimodal OCR and editable transcription preview.
- **Evidence-First Verification**:
  - Distinguishes AI linguistic predictions from verified real-world evidence.
  - Displays interactive evidence cards with verbatim snippets, source authority scores, and direct hyperlinks.
  - Never claims that an automated AI model is 100% infallible.
- **Multilingual Support**:
  - Native detection and verification for **English** and **Hindi (हिन्दी)**.
  - Extensible architecture for Bengali, Tamil, Telugu, Marathi, and other regional scripts.
- **Explainable AI (XAI)**:
  - Generates clear reasoning factors explaining *why* a claim was classified.
- **Complete Authentication & Security**:
  - Salted bcrypt password hashing.
  - Secure HTTP-only JWT cookies.
  - Role-based authorization (`USER` vs `ADMIN`).
  - IP-based rate limiting and request size guards.
- **User Dashboard & Analytics**:
  - Ingested claim statistics, verdict distribution pie charts, language breakdown, and volume trendlines powered by Recharts.
- **Administrative Control Panel**:
  - User management, dispute resolution queue, domain reputation database, and security audit logs.
- **Browser Extension (Manifest V3)**:
  - Chrome / Brave extension for 1-click verification of highlighted text or current page URLs.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Lucide React, Axios.
- **Backend**: Express + Node.js (full-stack dev & prod integration on port 3000), plus complete standalone FastAPI / Python architecture in `/backend`.
- **AI / NLP**: `@google/genai` TypeScript SDK with `gemini-3.8-flash` & Google Search Grounding for live RAG evidence retrieval.
- **Database**: ACID-compliant persistent JSON storage engine (in `./data/database.json`) + PostgreSQL SQLAlchemy models in `backend/app/models/entities.py`.
- **Extension**: Google Chrome Manifest V3 service worker & popup architecture in `/extension`.

---

## 4. Directory Structure

```
.
├── backend/                  # Standalone Python / FastAPI backend
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── config.py         # App configuration
│   │   ├── main.py           # FastAPI application entrypoint
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── rag/              # RAG verification pipeline
│   │   ├── schemas/          # Pydantic schemas
│   │   └── scrapers/         # SSRF-protected article scraper
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── data/
│   ├── database.json         # Live persistent database
│   └── README.md             # Dataset documentation
├── docs/                     # MCA Major Project documentation
│   ├── diagrams/             # Architecture, ERD, and DFD Level 0, 1, 2 diagrams (.mmd)
│   ├── ai-pipeline.md        # AI credibility scoring formula
│   ├── api.md                # REST API documentation
│   ├── architecture.md       # System architecture
│   ├── database.md           # Database data dictionary
│   ├── mca-major-project-report.md # Academic report
│   ├── rag.md                # RAG methodology
│   └── security.md           # SSRF and cybersecurity defenses
├── extension/                # Chrome Manifest V3 Browser Extension
│   ├── background/           # Service worker & context menus
│   ├── content/              # In-page text selection extractor
│   ├── options/              # Extension configuration UI
│   ├── popup/                # Extension popup UI
│   └── manifest.json         # Manifest V3 specification
├── ml/
│   └── evaluation/           # Model accuracy & F1 evaluation pipeline
├── server/                   # Full-Stack Node.js backend
│   ├── db/                   # Persistent repository
│   ├── routes/               # Express auth, analyze, and admin routes
│   ├── security/             # JWT, rate limiting, and auth guards
│   ├── services/             # AI RAG, Gemini vision OCR, and safe scraper
│   └── types.ts              # Server TypeScript interfaces
├── src/                      # React 19 Frontend
│   ├── components/           # Navbar, Footer, EvidenceCard, VerdictBadge, ExtensionSimulator
│   ├── context/              # AuthContext
│   ├── pages/                # Landing, Analyze, Details, Dashboard, History, Saved, Admin
│   ├── services/             # Axios API client
│   └── types/                # Frontend TypeScript types
├── docker-compose.yml        # Docker multi-container stack
├── Dockerfile                # Multi-stage production container
├── package.json              # NPM dependencies & scripts
├── server.ts                 # Full-stack server entry point (Port 3000)
└── README.md
```

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js 20+
- (Optional for Python backend) Python 3.10+
- (Optional for containers) Docker & Docker Compose

### Environment Setup
Create a `.env` file from `.env.example`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-jwt-secret-key"
PORT=3000
```

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run the full-stack application (frontend + server on port 3000)
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 6. Pre-Seeded Demo Credentials

The platform is pre-seeded with verified test accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@truthlens.ai` | `AdminPassword@2026` | Full access to Admin Workspace, User Management, Source Reputation, and Security Logs. |
| **Fact Analyst** | `analyst@truthlens.ai` | `Analyst@2026` | Claim verification, history review, bookmarking, and dispute filing. |

---

## 7. Installing the Browser Extension (Manifest V3)

1. Open Google Chrome or Brave and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the upper-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` directory from this repository.
5. Highlight any text on any website, right-click, and select **"Verify claim with TruthLens AI"**!

---

## 8. Docker Deployment

To launch the multi-service stack (Node.js full-stack app, PostgreSQL, and Redis):
```bash
docker compose up --build -d
```

---

## 9. Academic Disclaimer

**Important Notice**: TruthLens AI provides automated credibility assessments synthesized from machine-learning predictions and retrieved external evidence. No automated system can determine truth with 100% accuracy. Critical decisions regarding medical, financial, legal, political, or emergency matters should always be verified with primary regulatory and professional authorities.

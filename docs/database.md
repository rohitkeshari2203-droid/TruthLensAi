# TruthLens AI — Database Schema & Data Modeling

TruthLens implements a relational database design for PostgreSQL (and an ACID JSON repository for local single-binary operation).

## Database Tables

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY | Unique user UUID |
| name | VARCHAR(100) | NOT NULL | User full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Account email |
| password_hash | VARCHAR(255) | NOT NULL | Salted bcrypt hash |
| role | VARCHAR(20) | NOT NULL | USER or ADMIN |
| preferred_language | VARCHAR(10) | DEFAULT 'en' | Default UI / analysis language |
| is_active | BOOLEAN | DEFAULT true | Account status flag |
| created_at | TIMESTAMP | DEFAULT UTC | Account creation timestamp |
| last_login | TIMESTAMP | NULLABLE | Last successful authentication |

### 2. `analyses`
| Column | Type | Description |
|---|---|---|
| id | VARCHAR(36) | PRIMARY KEY |
| user_id | VARCHAR(36) | Foreign key to users.id (nullable for anonymous) |
| input_type | VARCHAR(20) | URL, TEXT, IMAGE, or SOCIAL |
| original_text | TEXT | Input text or extracted article body |
| source_url | VARCHAR(1000) | Origin URL if applicable |
| detected_language | JSON | `{ code, name, confidence, script }` |
| normalized_text | TEXT | Cleaned representation |
| prediction | VARCHAR(50) | Likely True / False / Misleading / etc. |
| confidence | FLOAT | Confidence level (0-100) |
| credibility_score | FLOAT | Multi-factor score (0-100) |
| explanation | TEXT | Human-readable reasoning summary |
| xai_factors | JSON | Array of positive/negative reasoning factors |
| status | VARCHAR(20) | COMPLETED / PROCESSING / FAILED |
| created_at | TIMESTAMP | Verification timestamp |

### 3. `claims`
Stores individual factual assertions isolated from an article.
- `id`: Primary key
- `analysis_id`: Foreign key to `analyses.id`
- `claim_text`: Factual statement
- `claim_type`: FACTUAL_ASSERTION, STATISTICAL, ATTRIBUTION, POLICY
- `confidence`: Extraction confidence

### 4. `evidence`
Stores citations retrieved through RAG grounding.
- `id`: Primary key
- `analysis_id`: Foreign key to `analyses.id`
- `claim_id`: Linked claim
- `title`: Article title
- `url`: Direct source link
- `source_name`: Publisher name
- `source_type`: OFFICIAL, FACT_CHECK, MAINSTREAM_NEWS, ACADEMIC
- `source_reputation`: Score from 0 to 100
- `evidence_text`: Verbatim snippet
- `stance`: SUPPORTS, CONTRADICTS, NEUTRAL
- `relevance_score`: Semantic similarity score (0-100)

### 5. `sources`
Maintains editorial reputation scores for major domains.
- `id`, `domain`, `source_name`, `reputation_score`, `category`, `verification_status`, `description`

### 6. `saved_items`, `reports`, `audit_logs`
Handles user bookmarks, dispute reporting, and system security event tracking.

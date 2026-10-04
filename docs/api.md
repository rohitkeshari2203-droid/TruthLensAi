# TruthLens AI — REST API Documentation

This API powers the web application and Chrome Extension. All error responses use structured envelopes:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Human-readable explanation of error."
  }
}
```

## Authentication Endpoints

### 1. `POST /api/auth/register`
Creates a new analyst or researcher account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.org",
    "password": "SecurePassword123",
    "preferred_language": "en"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt-token-string",
      "user": { "id": "usr-...", "name": "Jane Doe", "email": "jane@example.org", "role": "USER" }
    }
  }
  ```

### 2. `POST /api/auth/login`
Authenticates user and sets HTTP-only secure cookie `auth_token`.
- **Request Body**: `{ "email": "...", "password": "..." }`
- **Response** (200 OK): Returns user session and token.

### 3. `GET /api/auth/me`
Retrieves currently authenticated user profile.
- **Headers**: `Authorization: Bearer <token>` or HTTP cookie.

---

## Verification & Analysis Endpoints

### 4. `POST /api/analyze/text`
Analyzes raw statement, headline, or social post.
- **Request Body**:
  ```json
  {
    "text": "RBI announced 500 rupee notes will be decommissioned by midnight today.",
    "inputType": "TEXT"
  }
  ```
- **Response** (201 Created): Returns full `Analysis` object with claims, evidence citations, verdict, and XAI factors.

### 5. `POST /api/analyze/url`
Safely scrapes and verifies article URL with SSRF protection.
- **Request Body**: `{ "url": "https://example.com/news/article" }`
- **Response** (201 Created): Returns parsed article metadata and verification report.

### 6. `POST /api/analyze/ocr`
Extracts text from uploaded image without committing an analysis, allowing user editing.
- **Request Body**: `{ "imageBase64": "data:image/png;base64,...", "mimeType": "image/png" }`
- **Response** (200 OK): `{ "extracted_text": "...", "headline": "...", "confidence": 95 }`

### 7. `POST /api/analyze/image`
Directly verifies image screenshot or takes edited OCR text.

---

## Administrative Endpoints (Admin Role Required)

### 8. `GET /api/admin/stats`
System overview statistics, analysis counts, verdict breakdowns, and active users.

### 9. `GET /api/admin/reports` & `PUT /api/admin/reports/:id/status`
Manage user disputes and counter-evidence submissions.

### 10. `GET /api/admin/audit-logs`
Security and immutable audit trail.

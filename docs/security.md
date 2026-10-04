# TruthLens AI — Cybersecurity & Defense-in-Depth Specification

Security is treated as a first-class architectural requirement across the entire TruthLens stack.

## 1. Server-Side Request Forgery (SSRF) Protection

When users submit arbitrary article URLs for verification, the server is vulnerable to SSRF if requests are not strictly sanitized. TruthLens enforces:

1. **Protocol Restriction**: Only `http:` and `https:` schemes are allowed (`file://`, `gopher://`, `ftp://` are rejected).
2. **Domain Resolution & IP Filtering**:
   - Hostnames are resolved through DNS before any HTTP socket connection is initiated.
   - Any IP resolving to loopback (`127.0.0.0/8`, `::1`), private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), or link-local/cloud metadata (`169.254.169.254`, `metadata.google.internal`) is immediately blocked.
3. **Payload & Timeout Limits**: Requests are capped at 9 seconds and maximum 3MB response payload to prevent buffer exhaustion and Slowloris attacks.

## 2. Authentication & Credential Security

- **Bcrypt Password Hashing**: Passwords hashed with 10 salt rounds. Plaintext passwords never stored or logged.
- **HTTP-Only JWT Cookies**: Tokens stored in `HttpOnly`, `SameSite=Lax` cookies to prevent token exfiltration via client-side XSS.
- **Role-Based Authorization (RBAC)**: All administrative endpoints (`/api/admin/*`) require backend authorization checks, never relying on client-side routing alone.

## 3. Rate Limiting & Denial of Service

- In-memory IP-based rate limiting on sensitive endpoints (login, register, analysis generation).
- Max body payload limited to 10MB to accommodate image uploads safely without memory leaks.

## 4. File Upload & OCR Security

- Image uploads strictly validated for permitted MIME types (`image/jpeg`, `image/png`, `image/webp`).
- File size capped at 5MB.
- Images processed in-memory as base64 buffers without writing executable scripts to arbitrary filesystem paths (mitigating path traversal and remote code execution).

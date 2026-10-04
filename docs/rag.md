# TruthLens AI — Retrieval-Augmented Verification (RAG) Architecture

## 1. Objective of RAG in Misinformation Detection

Traditional LLM classification fails when verifying breaking news or recent events due to training cutoff limits and hallucination vulnerabilities. TruthLens uses Retrieval-Augmented Generation (RAG) to ground every claim against verified external reality.

## 2. Retrieval Workflow

1. **Entity & Keyword Identification**: When a claim is extracted, primary named entities (organizations, countries, officials, dates, statistical figures) are tagged.
2. **Search Grounding Queries**: Targeted boolean and natural language queries are dispatched through the Google Search Grounding API via `@google/genai`.
3. **Domain Authority Filtering**: Retrieved search results and chunks are cross-referenced with the internal `SourceRepository` to assign a baseline domain trust rating ($0-100$).
4. **Context Deduplication**: Redundant syndications of the same news wire story are deduplicated.
5. **Stance Analysis**:
   - The model compares the factual assertion directly against the retrieved excerpt.
   - Outputs: `SUPPORTS`, `CONTRADICTS`, or `NEUTRAL` with a semantic relevance confidence score.
6. **No-Hallucination Fallback**: If no relevant reporting exists, the system refuses to guess and explicitly renders `"Insufficient Evidence"`.

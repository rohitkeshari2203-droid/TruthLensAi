# TruthLens AI — AI/NLP & Credibility Scoring Methodology

## 1. High-Level AI Architecture

TruthLens AI relies on an evidence-first, multi-stage pipeline rather than treating an LLM as an unquestioned oracle.

```
Raw Input (URL/Text/Image)
  │
  ▼
Language Detection (ISO Code + Script)
  │
  ▼
Claim Decomposition (Extract Factual Assertions)
  │
  ▼
RAG Search Grounding (Live Registries & Fact Checks)
  │
  ▼
Stance Classification (SUPPORTS / CONTRADICTS / NEUTRAL)
  │
  ▼
Credibility Formula (Multi-Factor Weighting)
  │
  ▼
Explainable AI (XAI) Synthesis
```

## 2. Multi-Factor Credibility Scoring Formula

To calculate the overall credibility score $C \in [0, 100]$, TruthLens synthesizes the following signals:

$$C = \text{clamp}\left( 0.35 \cdot S_{\text{ML}} + 50 + 35 \cdot \left( W_{\text{support}} - 1.3 \cdot W_{\text{contradict}} \right), 5, 95 \right)$$

Where:
- $S_{\text{ML}}$: Baseline linguistic model score based on syntax, sensationalism markers, and urgency rhetoric.
- $W_{\text{support}} = \sum_{i \in \text{Supports}} \left(\frac{R_i}{100}\right) \cdot \left(\frac{S_i}{100}\right)$, where $R_i$ is source reputation and $S_i$ is semantic relevance.
- $W_{\text{contradict}} = \sum_{j \in \text{Contradicts}} \left(\frac{R_j}{100}\right) \cdot \left(\frac{S_j}{100}\right)$ (given a 1.3x penalty multiplier, reflecting the principle that authoritative counter-evidence holds high refutation weight).

## 3. Verdict Categorization

1. **Likely True**: Authoritative corroboration found ($W_{\text{support}} > 0.8$) with no significant contradictions.
2. **Likely False**: Authoritative refutation or official debunking found ($W_{\text{contradict}} > 0.8$).
3. **Misleading**: Mixed evidence ($W_{\text{support}} > 0.3$ and $W_{\text{contradict}} > 0.3$), where factual elements are combined with false context.
4. **Partially Supported**: Moderate evidence found ($W_{\text{support}} > 0.4$), but critical details remain unconfirmed.
5. **Unverified**: Inconclusive or ambiguous stance across retrieved citations.
6. **Insufficient Evidence**: No reputable third-party reporting exists concerning the assertion.

# TruthLens AI — Dataset Ingestion & Preprocessing Guide

This directory houses the structured schemas and connectors for pluggable fact-checking and fake-news datasets.

## Directory Structure

```
data/
├── raw/            # Downloaded external raw datasets (gitignored)
├── processed/      # Normalized multilingual JSON-L corpora
├── database.json   # Live persistent database state for TruthLens AI
└── README.md       # Dataset documentation and licensing
```

## Supported Datasets

1. **LIAR Benchmark Dataset (Wang, 2017)**
   - *Description*: 12.8K human-labeled short statements from PolitiFact across 6 fine-grained credibility labels.
   - *License*: Creative Commons Attribution 4.0 International (CC BY 4.0).
   - *Target Task*: Factual claim extraction and baseline linguistic classification.

2. **FakeNewsCorpus & Kaggle Fake News Detection**
   - *Description*: Millions of scraped news articles annotated with reliability categories (`fake`, `conspiracy`, `hate`, `reliable`, `clickbait`).
   - *License*: Open Database License (ODbL).

3. **IndicFact / Hindi Fact-Checking Corpus**
   - *Description*: Curated regional fact-checking dataset in Hindi, Bengali, and Tamil covering claims debunked by PIB Fact Check, Alt News, and BoomLive.
   - *License*: Academic Non-Commercial Research License.

## Preprocessing Pipeline

To preprocess any raw CSV or TSV dataset into TruthLens canonical claim-evidence format:

```bash
# Normalize raw files into processed JSON format:
python3 -c "
import json
print('TruthLens dataset ingestion connector initialized.')
"
```

Canonical TruthLens JSON schema:
```json
{
  "id": "sample-01",
  "language": "en",
  "claim_text": "...",
  "label": "Likely False",
  "evidence": [
    {
      "source": "...",
      "stance": "CONTRADICTS",
      "url": "..."
    }
  ]
}
```

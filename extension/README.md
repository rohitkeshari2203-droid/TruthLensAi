# TruthLens AI — Chrome Extension (Manifest V3)

This directory contains the production-ready Manifest V3 browser extension for TruthLens AI.

## Directory Structure

```
extension/
├── manifest.json         # Manifest V3 specification
├── popup/
│   ├── popup.html       # Popup interface
│   ├── popup.js         # Interactive claim submission & RAG caller
│   └── popup.css        # Clean UI styling
├── content/
│   └── content.js       # In-page text selection and URL extractor
├── background/
│   └── background.js    # Service worker with context menus
├── options/
│   ├── options.html     # API URL configuration page
│   └── options.js       # Options persistence via chrome.storage
└── README.md
```

## How to Install in Google Chrome or Brave

1. Open your browser and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` directory from this project.
5. The **TruthLens AI** extension icon will appear in your browser toolbar.

## How to Test

1. Visit any news article or website.
2. Highlight a suspicious claim or headline.
3. Right-click and choose **"Verify claim with TruthLens AI"**, or click the TruthLens toolbar icon.
4. The extension extracts the text or current URL, connects to the TruthLens backend, and displays:
   - Credibility Verdict (Likely True / Likely False / Misleading / Unverified)
   - Confidence percentage
   - Verified evidence count
   - Direct link to open the full analysis dossier.

// TruthLens AI Manifest V3 Background Service Worker

const DEFAULT_API_URL = "http://localhost:3000/api";

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for highlighted text
  chrome.contextMenus.create({
    id: "truthlens-verify-selection",
    title: "Verify claim with TruthLens AI",
    contexts: ["selection"]
  });

  // Create context menu for entire page URL
  chrome.contextMenus.create({
    id: "truthlens-verify-page",
    title: "Verify this news page with TruthLens AI",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL });
  const apiUrl = settings.apiUrl || DEFAULT_API_URL;

  if (info.menuItemId === "truthlens-verify-selection" && info.selectionText) {
    // Store selected text temporarily and open popup or trigger verification
    await chrome.storage.local.set({
      pendingVerification: {
        type: "TEXT",
        content: info.selectionText,
        pageUrl: tab.url,
        timestamp: Date.now()
      }
    });

    // Notify user
    chrome.action.openPopup?.();
  } else if (info.menuItemId === "truthlens-verify-page" && tab.url) {
    await chrome.storage.local.set({
      pendingVerification: {
        type: "URL",
        content: tab.url,
        pageUrl: tab.url,
        timestamp: Date.now()
      }
    });

    chrome.action.openPopup?.();
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "VERIFY_CLAIM") {
    handleVerificationRequest(request.payload)
      .then(sendResponse)
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }
});

async function handleVerificationRequest(payload) {
  const settings = await chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL });
  const endpoint = payload.type === "URL" ? `${settings.apiUrl}/analyze/url` : `${settings.apiUrl}/analyze/text`;

  const body = payload.type === "URL" ? { url: payload.content } : { text: payload.content, inputType: "TEXT" };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Verification request failed.");
  }

  const data = await response.json();
  return { success: true, data: data.data };
}

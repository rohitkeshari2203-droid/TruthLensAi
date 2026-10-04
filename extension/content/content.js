// TruthLens AI Content Script
// Safely inspects page metadata and selection for verification companion

(() => {
  // Listen for extraction requests from extension popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_PAGE_CONTEXT") {
      const selection = window.getSelection()?.toString().trim();
      const metaOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
      const title = metaOgTitle || document.title;
      const url = window.location.href;

      sendResponse({
        success: true,
        data: {
          url,
          title,
          selectedText: selection || "",
          hasSelection: Boolean(selection && selection.length > 5)
        }
      });
    }
  });
})();

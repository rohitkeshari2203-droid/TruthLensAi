document.addEventListener("DOMContentLoaded", async () => {
  const claimInput = document.getElementById("claim-input");
  const btnVerify = document.getElementById("btn-verify");
  const btnText = document.getElementById("btn-text");
  const spinner = document.getElementById("spinner");
  const errorBox = document.getElementById("error-box");
  const resultBox = document.getElementById("result-box");
  const resultVerdict = document.getElementById("result-verdict");
  const resultConfidence = document.getElementById("result-confidence");
  const resultScore = document.getElementById("result-score");
  const resultEvidenceCount = document.getElementById("result-evidence-count");
  const resultExplanation = document.getElementById("result-explanation");
  const btnOpenFull = document.getElementById("btn-open-full");
  const tabSelection = document.getElementById("btn-tab-selection");
  const tabPage = document.getElementById("btn-tab-page");

  let currentMode = "TEXT"; // or 'URL'
  let currentTabUrl = "";

  // Query active tab for highlighted text or URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      currentTabUrl = tab.url;

      // Ask content script for active selection
      chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_CONTEXT" }, (response) => {
        if (chrome.runtime.lastError || !response?.data) {
          // Content script not loaded or restricted page
          return;
        }

        if (response.data.selectedText) {
          claimInput.value = response.data.selectedText;
          setMode("TEXT");
        } else {
          claimInput.value = currentTabUrl;
          setMode("URL");
        }
      });
    }
  } catch (err) {
    console.error("Tab context fetch error:", err);
  }

  function setMode(mode) {
    currentMode = mode;
    if (mode === "TEXT") {
      tabSelection.classList.add("active");
      tabPage.classList.remove("active");
      claimInput.placeholder = "Highlight text on page or paste claim here...";
    } else {
      tabPage.classList.add("active");
      tabSelection.classList.remove("active");
      claimInput.placeholder = "Enter article URL...";
      if (currentTabUrl) claimInput.value = currentTabUrl;
    }
  }

  tabSelection.addEventListener("click", () => setMode("TEXT"));
  tabPage.addEventListener("click", () => setMode("URL"));

  btnVerify.addEventListener("click", async () => {
    const content = claimInput.value.trim();
    if (!content) {
      showError("Please enter text or a URL to verify.");
      return;
    }

    setLoading(true);
    errorBox.classList.add("hidden");
    resultBox.classList.add("hidden");

    try {
      const response = await chrome.runtime.sendMessage({
        action: "VERIFY_CLAIM",
        payload: {
          type: currentMode,
          content
        }
      });

      if (!response || !response.success) {
        throw new Error(response?.error || "Verification engine returned an error.");
      }

      displayResult(response.data.analysis);
    } catch (err) {
      showError(err.message || "Failed to communicate with TruthLens AI.");
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    if (loading) {
      btnVerify.disabled = true;
      btnText.textContent = "Verifying with RAG...";
      spinner.classList.remove("hidden");
    } else {
      btnVerify.disabled = false;
      btnText.textContent = "Verify Claim";
      spinner.classList.add("hidden");
    }
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  }

  function displayResult(analysis) {
    resultVerdict.textContent = analysis.prediction;
    resultVerdict.className = "verdict-tag";

    if (analysis.prediction === "Likely True") resultVerdict.classList.add("true");
    else if (analysis.prediction === "Likely False") resultVerdict.classList.add("false");
    else if (analysis.prediction === "Misleading") resultVerdict.classList.add("misleading");
    else resultVerdict.classList.add("unverified");

    resultConfidence.textContent = `${analysis.confidence}%`;
    resultScore.textContent = `${analysis.credibility_score}/100`;
    resultEvidenceCount.textContent = `${analysis.evidence?.length || 0} sources`;
    resultExplanation.textContent = analysis.explanation;

    // Set link to full web view
    btnOpenFull.href = `http://localhost:3000/analysis/${analysis.id}`;
    resultBox.classList.remove("hidden");
  }
});

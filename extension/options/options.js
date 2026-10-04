document.addEventListener("DOMContentLoaded", () => {
  const apiUrlInput = document.getElementById("api-url");
  const saveBtn = document.getElementById("save-btn");
  const status = document.getElementById("status");

  chrome.storage.sync.get({ apiUrl: "http://localhost:3000/api" }, (items) => {
    apiUrlInput.value = items.apiUrl;
  });

  saveBtn.addEventListener("click", () => {
    const apiUrl = apiUrlInput.value.trim() || "http://localhost:3000/api";
    chrome.storage.sync.set({ apiUrl }, () => {
      status.style.display = "block";
      setTimeout(() => {
        status.style.display = "none";
      }, 2000);
    });
  });
});

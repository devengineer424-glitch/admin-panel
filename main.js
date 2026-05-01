// Main Application Entry Point

// The form rendering and population logic now lives in forms.js.
// This file only wires events and initial application state.

function setupEventListeners() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const blogNav = document.getElementById("blogNav");
  const caseNav = document.getElementById("caseNav");
  const subsNav = document.getElementById("subsNav");
  const msgNav = document.getElementById("msgNav");

  if (blogNav) blogNav.addEventListener("click", loadBlogs);
  if (caseNav) caseNav.addEventListener("click", loadCases);
  if (subsNav) subsNav.addEventListener("click", loadSubscribers);
  if (msgNav) msgNav.addEventListener("click", loadMessages);

  const addBtn = document.getElementById("addBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const copyEmailsBtn = document.getElementById("copyEmailsBtn");

  if (addBtn) addBtn.addEventListener("click", () => openCreate());
  if (saveBtn) saveBtn.addEventListener("click", save);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (copyEmailsBtn) copyEmailsBtn.addEventListener("click", copyAllSubscriberEmails);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      const modal = document.getElementById("modal");

      if (modal && modal.style.display === "flex") {
        e.preventDefault();
        save(e);
      }
    }
  });

  const existingToken = getToken();

  if (existingToken && !isExpired(existingToken)) {
    showAdmin();
    loadBlogs();
  } else {
    showLogin();
  }

  document.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
      closeModal();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupEventListeners);
} else {
  setupEventListeners();
}

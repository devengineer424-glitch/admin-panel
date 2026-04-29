// Newsletter & Subscriber Management

function getSubscriberEmails() {
  return Array.from(
    new Set(
      currentItems
        .map((item) => String(item?.email || item?.gmail || item?.mail || "").trim())
        .filter(Boolean)
    )
  );
}

function setSubscriberActionsVisibility() {
  const copyBtn = document.getElementById("copyEmailsBtn");
  if (!copyBtn) return;

  const isSubscribers = current === "newsletter-subscribers";

  if (!isSubscribers) {
    copyBtn.style.display = "none";
    copyBtn.disabled = true;
    copyBtn.textContent = "Copy All Emails";
    return;
  }

  const emails = getSubscriberEmails();

  copyBtn.style.display = "inline-block";
  copyBtn.disabled = emails.length === 0;
  copyBtn.textContent = emails.length
    ? `Copy All Emails (${emails.length})`
    : "Copy All Emails";
}

async function copyAllSubscriberEmails() {
  const emails = getSubscriberEmails();

  if (!emails.length) {
    alert("No subscriber emails available to copy.");
    return;
  }

  const payload = emails.join(", ");

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(payload);
    } else {
      const temp = document.createElement("textarea");
      temp.value = payload;
      temp.setAttribute("readonly", "");
      temp.style.position = "absolute";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    const copyBtn = document.getElementById("copyEmailsBtn");
    if (copyBtn) {
      copyBtn.textContent = "Copied";
      setTimeout(() => setSubscriberActionsVisibility(), 1200);
    }
  } catch (_error) {
    alert("Could not copy emails. Please try again.");
  }
}

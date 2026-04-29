// Utility Functions

function setStatus(nodeId, message, isError = false) {
  const node = document.getElementById(nodeId);
  if (!node) return;
  node.className = isError ? "status error" : "status success";
  node.textContent = message;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatFieldName(name) {
  if (!name) return "Field";
  return String(name)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCellValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getBlogExcerpt(content) {
  const plain = String(content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "No preview text available.";
  if (plain.length <= 190) return plain;
  return `${plain.slice(0, 190)}...`;
}

function formatBlogDate(blog) {
  const candidateDates = [
    blog?.meta?.date,
    blog?.meta_date,
    blog?.date,
    blog?.published_at,
    blog?.updated_at,
    blog?.created_at,
  ];

  for (const value of candidateDates) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString();
    }
  }

  return "No date";
}

function getStringHue(value) {
  const text = String(value || "untagged");
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % 360;
}

function getTagStyle(tag) {
  const hue = getStringHue(tag);
  const bg = `hsla(${hue}, 80%, 90%, 0.92)`;
  const text = `hsl(${hue}, 64%, 28%)`;
  const border = `hsla(${hue}, 62%, 45%, 0.35)`;
  return `background:${bg};color:${text};border-color:${border};`;
}

function buildBlogShareUrl(slug) {
  const base = String(FRONTEND_URL || "").replace(/\/+$/, "");
  const cleanSlug = String(slug || "").trim();
  if (!cleanSlug) return `${base}/blogs`;
  return `${base}/blogs/${encodeURIComponent(cleanSlug)}`;
}

async function copyBlogUrl(slug, button) {
  const shareUrl = buildBlogShareUrl(slug);

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      const temp = document.createElement("textarea");
      temp.value = shareUrl;
      temp.setAttribute("readonly", "");
      temp.style.position = "absolute";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    if (button) {
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original || "Copy URL";
      }, 1200);
    }
  } catch (_error) {
    alert("Could not copy URL. Please copy manually: " + shareUrl);
  }
}

function renderMarkdownPreview(text) {
  let html = escapeHtml(text);

  html = html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^-\s+(.*)$/gm, "• $1");
  html = html.replace(/\n/g, "<br>");

  return html;
}

function updateContentPreview() {
  const contentInput = document.querySelector(
    '#dataForm textarea[name="content"]'
  );
  const preview = document.getElementById("contentPreview");

  if (!contentInput || !preview) return;

  if (!contentInput.value.trim()) {
    preview.innerHTML =
      "<em>Preview will appear here as you type markdown.</em>";
    return;
  }

  preview.innerHTML = renderMarkdownPreview(contentInput.value);
}

function updateSlugHint() {
  const slugInput = document.querySelector('#dataForm input[name="slug"]');
  const slugHint = document.getElementById("slugHint");

  if (!slugInput || !slugHint) return;

  const slug = (slugInput.value || "").trim().toLowerCase();

  if (!slug) {
    slugHint.className = "help-text";
    slugHint.textContent = "Use lowercase words separated by hyphens.";
    return;
  }

  const duplicate = currentItems.find(
    (item) =>
      String(item.slug || "").trim().toLowerCase() === slug &&
      (!editId || String(item.id) !== String(editId))
  );

  if (duplicate) {
    slugHint.className = "help-text error";
    slugHint.textContent = "This slug already exists.";
  } else {
    slugHint.className = "help-text success";
    slugHint.textContent = "Slug looks good.";
  }
}

function ensureFieldLabels(form) {
  if (!form) return;

  const fields = form.querySelectorAll("input[name], textarea[name], select[name]");

  fields.forEach((field) => {
    if (field.type === "hidden") return;

    const prev = field.previousElementSibling;
    if (prev && prev.classList && prev.classList.contains("field-label")) return;

    const label = document.createElement("label");
    label.className = "field-label";
    label.textContent =
      field.getAttribute("placeholder") || formatFieldName(field.name);
    field.parentNode.insertBefore(label, field);
  });
}

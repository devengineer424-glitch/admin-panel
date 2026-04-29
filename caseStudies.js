// Case Study Management & Rendering

function renderCaseStudiesView(data) {
  currentItems = Array.isArray(data) ? data : [];

  const container = document.getElementById("messagesView");
  container.innerHTML = "";

  if (currentItems.length === 0) {
    container.innerHTML = '<div class="empty-state">No case studies yet.</div>';
    return;
  }

  const legend = document.createElement("div");
  legend.className = "design-legend";
  legend.innerHTML = `
  <span class="design-legend-item design-1"><span class="design-dot"></span>Design 1</span>
  <span class="design-legend-item design-2"><span class="design-dot"></span>Design 2</span>
  <span class="design-legend-item design-3"><span class="design-dot"></span>Design 3</span>
  `;

  container.appendChild(legend);

  const grid = document.createElement("div");
  grid.className = "case-studies-grid";

  currentItems.forEach((caseStudy) => {
    const card = document.createElement("div");
    const designNumber = [1, 2, 3].includes(Number(caseStudy.design))
      ? Number(caseStudy.design)
      : 1;
    card.className = `case-study-card design-${designNumber}`;

    const excerpt = caseStudy.excerpt || "No description available.";
    const client = caseStudy.client || "Unknown Client";
    const industry = caseStudy.industry || "General";
    const rawTags = Array.isArray(caseStudy.tags) ? caseStudy.tags : [];
    const tags = [
      ...new Set(
        rawTags
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
      ),
    ];
    const displayTags = (tags.length ? tags : [industry]).slice(0, 5);
    const tagsMarkup = displayTags
      .map(
        (tag) =>
          `<span class="case-tag" style="${getTagStyle(tag)}">${escapeHtml(tag)}</span>`
      )
      .join("");

    const designPalette = {
      1: { accent: "#2563eb", tint: "#eff6ff" },
      2: { accent: "#f97316", tint: "#fff7ed" },
      3: { accent: "#8b5cf6", tint: "#f5f3ff" },
    }[designNumber];

    card.style.setProperty("--card-accent", designPalette.accent);
    card.style.setProperty("--card-tint", designPalette.tint);

    card.innerHTML = `
    <div class="case-design-row">
    <span class="design-badge design-${designNumber}"><span class="design-dot"></span>Design ${designNumber}</span>
    </div>
    <div class="case-title">${escapeHtml(caseStudy.title || "Untitled case study")}</div>
    <div class="case-client">
      <strong>${escapeHtml(client)}</strong>
    </div>
    <div class="case-meta">
    <span>${escapeHtml(industry)}</span>
    </div>
    <div class="case-tags">${tagsMarkup}</div>
    <div class="case-excerpt">${escapeHtml(excerpt)}</div>
    <div class="case-actions">
    <button class="btn btn-edit" onclick="edit('${caseStudy.id}')">Edit</button>
    <button class="btn btn-danger" onclick="removeItem('${caseStudy.id}')">Delete</button>
    <button class="btn btn-open" onclick="openCaseStudyInNewTab('${escapeHtml(caseStudy.slug || "")}')">Open</button>
    </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function openCaseStudyInNewTab(slug) {
  const base = String(FRONTEND_URL || "").replace(/\/+$/, "");
  const cleanSlug = String(slug || "").trim();
  const caseStudyUrl = cleanSlug ? `${base}/case-studies/${encodeURIComponent(cleanSlug)}` : `${base}/case-studies`;
  window.open(caseStudyUrl, "_blank", "noopener,noreferrer");
}

function setupCaseStudyFormHandlers() {
  const form = document.getElementById("dataForm");
  const titleInput = form.querySelector('input[name="title"]');
  const slugInput = form.querySelector('input[name="slug"]');
  const contentInput = form.querySelector('textarea[name="content"]');

  if (titleInput && slugInput) {
    titleInput.addEventListener("input", () => {
      if (!slugInput.value.trim()) slugInput.value = slugify(titleInput.value);
    });
  }

  if (slugInput) {
    slugInput.addEventListener("input", updateSlugHint);
  }

  if (contentInput) {
    contentInput.addEventListener("input", updateContentPreview);
  }
}

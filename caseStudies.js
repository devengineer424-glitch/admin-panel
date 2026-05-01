// Case Study Management & Rendering

async function renderCaseStudiesView(data) {
  currentItems = Array.isArray(data) ? data : [];

  const container = document.getElementById("messagesView");
  container.innerHTML = "";

  if (currentItems.length === 0) {
    container.innerHTML = '<div class="empty-state">No case studies yet.</div>';
    return;
  }

  const [legendTemplate, cardTemplate] = await Promise.all([
    loadHtmlTemplate("templates/case-studies-legend.html"),
    loadHtmlTemplate("templates/case-study-card.html"),
  ]);

  container.insertAdjacentHTML("beforeend", legendTemplate);

  const grid = document.createElement("div");
  grid.className = "case-studies-grid";

  currentItems.forEach((caseStudy) => {
    const card = document.createElement("div");
    const rawDesign = Number(caseStudy.design);
    const designNumber = rawDesign === 1 ? 1 : 2;
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
    }[designNumber];

    card.style.setProperty("--card-accent", designPalette.accent);
    card.style.setProperty("--card-tint", designPalette.tint);

    card.innerHTML = renderTemplate(cardTemplate, {
      designNumber,
      title: escapeHtml(caseStudy.title || "Untitled case study"),
      client: escapeHtml(client),
      industry: escapeHtml(industry),
      tagsMarkup,
      excerpt: escapeHtml(excerpt),
      id: escapeHtml(caseStudy.id || ""),
      slugRaw: escapeHtml(caseStudy.slug || ""),
    });

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

function applyCaseStudyDesignVisibility() {
  const form = document.getElementById("dataForm");
  if (!form) return;

  const designSelect = form.querySelector('select[name="design"]');
  const design = String(designSelect?.value || "1");
  const resolved = design === "1" ? "1" : "2";

  const scopedSections = form.querySelectorAll("fieldset[data-design]");

  scopedSections.forEach((section) => {
    const scope = section.getAttribute("data-design");
    const show = scope === "shared" || scope === resolved;
    section.style.display = show ? "" : "none";
  });
}

function setupCaseStudyFormHandlers() {
  const form = document.getElementById("dataForm");
  const titleInput = form.querySelector('input[name="title"]');
  const slugInput = form.querySelector('input[name="slug"]');
  const contentInput = form.querySelector('textarea[name="content"]');
  const designSelect = form.querySelector('select[name="design"]');
  const addGoalBtn = document.getElementById("addGoalBtn");
  const addApproachBtn = document.getElementById("addApproachBtn");
  const addBenefitBtn = document.getElementById("addBenefitBtn");
  const addResultBtn = document.getElementById("addResultBtn");
  const addFeatureBtn = document.getElementById("addFeatureBtn");
  const addMetricBtn = document.getElementById("addMetricBtn");
  const addTableColumnBtn = document.getElementById("addTableColumnBtn");
  const addTableRowBtn = document.getElementById("addTableRowBtn");

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

  if (designSelect) {
    designSelect.addEventListener("change", applyCaseStudyDesignVisibility);
  }

  if (addGoalBtn) {
    addGoalBtn.addEventListener("click", () =>
      addBlogPairRow(
        "goalsRows",
        "goal-heading",
        "goal-text",
        "Goal Heading",
        "Goal Description",
        "",
        "",
        "goal-emoji",
        "Emoji (optional)"
      )
    );
  }

  if (addApproachBtn) {
    addApproachBtn.addEventListener("click", () =>
      addBlogPairRow(
        "approachRows",
        "approach-step",
        "approach-desc",
        "Step",
        "Description"
      )
    );
  }

  if (addBenefitBtn) {
    addBenefitBtn.addEventListener("click", () =>
      addBlogPairRow(
        "benefitsRows",
        "benefit-title",
        "benefit-text",
        "Benefit Title",
        "Benefit Description",
        "",
        "",
        "benefit-icon",
        "Icon/Emoji (optional)"
      )
    );
  }

  if (addResultBtn) {
    addResultBtn.addEventListener("click", () => addResultRow());
  }

  if (addFeatureBtn) {
    addFeatureBtn.addEventListener("click", () => addFeatureRow());
  }

  if (addMetricBtn) {
    addMetricBtn.addEventListener("click", () => addMetricRow());
  }

  if (addTableColumnBtn) {
    addTableColumnBtn.addEventListener("click", () => addTableColumn());
  }

  if (addTableRowBtn) {
    addTableRowBtn.addEventListener("click", () => addTableRow());
  }

  applyCaseStudyDesignVisibility();
}

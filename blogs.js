// Blog Rendering & Editing Logic

function renderBlogsView(data) {
  currentItems = Array.isArray(data) ? data : [];

  const container = document.getElementById("messagesView");
  container.innerHTML = "";

  if (currentItems.length === 0) {
    container.innerHTML = '<div class="empty-state">No blogs yet.</div>';
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
  grid.className = "blogs-grid";

  currentItems.forEach((blog) => {
    const card = document.createElement("div");
    const designNumber = [1, 2, 3].includes(Number(blog.design_number))
      ? Number(blog.design_number)
      : 1;
    card.className = `blog-card design-${designNumber}`;

    const sourceText =
      String(blog.content || blog.text_sections?.introduction || "");
    const excerpt = getBlogExcerpt(sourceText);
    const dateLabel = formatBlogDate(blog);
    const category = blog.meta?.category || "General";
    const author = blog.meta?.author || "Unknown author";
    const rawTags = Array.isArray(blog.tags) ? blog.tags : [];
    const tags = [
      ...new Set(
        rawTags
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
      ),
    ];
    const displayTags = (tags.length ? tags : [category]).slice(0, 5);
    const tagsMarkup = displayTags
      .map(
        (tag) =>
          `<span class="blog-tag" style="${getTagStyle(tag)}">${escapeHtml(tag)}</span>`
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
    <div class="blog-design-row">
    <span class="design-badge design-${designNumber}"><span class="design-dot"></span>Design ${designNumber}</span>
    </div>
    <div class="blog-title">${escapeHtml(blog.title || "Untitled blog")}</div>
    <div class="blog-slug">/${escapeHtml(blog.slug || "no-slug")}</div>
    <div class="blog-meta">
    <span>${escapeHtml(category)}</span>
    <span>•</span>
    <span>${escapeHtml(author)}</span>
    <span>•</span>
    <span>${escapeHtml(dateLabel)}</span>
    </div>
    <div class="blog-tags">${tagsMarkup}</div>
    <div class="blog-excerpt">${escapeHtml(excerpt)}</div>
    <div class="blog-actions">
    <button class="btn btn-edit" onclick="edit('${blog.id}')">Edit</button>
    <button class="btn btn-danger" onclick="removeItem('${blog.id}')">Delete</button>
    <button class="btn btn-open" onclick="openBlogInNewTab('${escapeHtml(blog.slug || "")}')">Open</button>
    <button class="btn btn-share" data-slug="${escapeHtml(blog.slug || "")}" onclick="copyBlogUrl(this.dataset.slug, this)">Copy URL</button>
    </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function initBlogCollectionEditors(existingData = null) {
  const steps = Array.isArray(existingData?.steps)
    ? existingData.steps
    : [];
  const infoCards = Array.isArray(existingData?.info_cards)
    ? existingData.info_cards
    : [];
  const ctaButtons = Array.isArray(existingData?.cta?.buttons)
    ? existingData.cta.buttons
    : [];

  const addStepBtn = document.getElementById("addStepBtn");
  const addInfoCardBtn = document.getElementById("addInfoCardBtn");
  const addCtaButtonBtn = document.getElementById("addCtaButtonBtn");

  if (addStepBtn) {
    addStepBtn.addEventListener("click", () =>
      addBlogPairRow(
        "stepsRows",
        "step-title",
        "step-description",
        "Step title",
        "Step description"
      )
    );
  }

  if (addInfoCardBtn) {
    addInfoCardBtn.addEventListener("click", () =>
      addBlogPairRow(
        "infoCardsRows",
        "info-title",
        "info-content",
        "Card title",
        "Card content",
        "",
        "",
        "info-image",
        "Image URL (optional)"
      )
    );
  }

  if (addCtaButtonBtn) {
    addCtaButtonBtn.addEventListener("click", () => addCtaButtonRow());
  }

  if (steps.length) {
    steps.forEach((item) =>
      addBlogPairRow(
        "stepsRows",
        "step-title",
        "step-description",
        "Step title",
        "Step description",
        item.title || "",
        item.description || ""
      )
    );
  } else {
    addBlogPairRow(
      "stepsRows",
      "step-title",
      "step-description",
      "Step title",
      "Step description"
    );
  }

  if (infoCards.length) {
    infoCards.forEach((item) =>
      addBlogPairRow(
        "infoCardsRows",
        "info-title",
        "info-content",
        "Card title",
        "Card content",
        item.title || "",
        item.content || "",
        "info-image",
        "Image URL (optional)",
        item.image || ""
      )
    );
  } else {
    addBlogPairRow(
      "infoCardsRows",
      "info-title",
      "info-content",
      "Card title",
      "Card content",
      "",
      "",
      "info-image",
      "Image URL (optional)"
    );
  }

  if (ctaButtons.length) {
    ctaButtons.forEach((item) =>
      addCtaButtonRow(item.text || "", item.action || "")
    );
  } else {
    addCtaButtonRow();
  }
}

function setupBlogFormHandlers() {
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

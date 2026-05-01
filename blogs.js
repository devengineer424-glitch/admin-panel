// Blog Rendering & Editing Logic

async function renderBlogsView(data) {
  currentItems = Array.isArray(data) ? data : [];
  setSearchCollection(currentItems, (blog) => {
    const category = blog?.meta?.category || "";
    const author = blog?.meta?.author || "";
    const tags = Array.isArray(blog?.tags) ? blog.tags.join(" ") : "";
    const excerpt = getBlogExcerpt(String(blog.content || blog.text_sections?.introduction || ""));
    return [blog.title, blog.slug, category, author, tags, excerpt].filter(Boolean).join(" ");
  });

  const visibleItems = filterSearchCollection();

  const container = document.getElementById("messagesView");
  container.innerHTML = "";

  if (visibleItems.length === 0) {
    container.innerHTML = getSearchQuery()
      ? '<div class="empty-state">No blogs match your search.</div>'
      : '<div class="empty-state">No blogs yet.</div>';
    return;
  }

  const [legendTemplate, cardTemplate] = await Promise.all([
    loadHtmlTemplate("templates/design-legend.html"),
    loadHtmlTemplate("templates/blog-card.html"),
  ]);

  container.insertAdjacentHTML("beforeend", legendTemplate);

  const grid = document.createElement("div");
  grid.className = "blogs-grid";

  visibleItems.forEach((blog) => {
    const card = document.createElement("div");
    const designNumber = [1, 2, 3].includes(Number(blog.design_number))
      ? Number(blog.design_number)
      : 1;
    card.className = `blog-card design-${designNumber}`;

    const sourceText = String(blog.content || blog.text_sections?.introduction || "");
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

    card.innerHTML = renderTemplate(cardTemplate, {
      designNumber,
      title: escapeHtml(blog.title || "Untitled blog"),
      slug: escapeHtml(blog.slug || "no-slug"),
      category: escapeHtml(category),
      author: escapeHtml(author),
      dateLabel: escapeHtml(dateLabel),
      tagsMarkup,
      excerpt: escapeHtml(excerpt),
      id: escapeHtml(blog.id || ""),
      slugRaw: escapeHtml(blog.slug || ""),
    });

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

// Main Application Entry Point & Modal Management

function openCreate(existingData = null) {
  if (isReadOnlySection()) return;

  editId = existingData && existingData.id ? existingData.id : null;

  const isEdit = !!editId;

  let form = document.getElementById("dataForm");

  if (current === "blogs") {
    form.innerHTML = `
    <input name="slug" placeholder="Slug" required>
    <div id="slugHint" class="help-text">Use lowercase words separated by hyphens.</div>
    <input name="title" placeholder="Title" required>
    <select name="design_number" required>
    <option value="1">Design 1</option>
    <option value="2">Design 2</option>
    <option value="3">Design 3</option>
    </select>
    <input name="hero_badge" placeholder="Hero Badge">
    <input name="hero_subtitle" placeholder="Hero Subtitle">
    <input name="hero_image" placeholder="Hero Image URL" required>
    <input name="meta_author" placeholder="Author">
    <input type="datetime-local" name="meta_date">
    <input name="meta_category" placeholder="Category">
    <input name="meta_intro_img" placeholder="Meta Intro Image URL">
    <input name="meta_current_landscape_img" placeholder="Meta Current Landscape Image URL">
    <input name="meta_my_perspective_img" placeholder="Meta My Perspective Image URL">
    <input name="meta_why_this_matters_img" placeholder="Meta Why This Matters Image URL">
    <textarea name="content" placeholder="Markdown Content"></textarea>
    <label class="field-label">Content Preview</label>
    <div id="contentPreview" class="preview-box"><em>Preview will appear here as you type markdown.</em></div>
    <textarea name="text_introduction" placeholder="Introduction"></textarea>
    <textarea name="text_current_landscape" placeholder="Current Landscape"></textarea>
    <textarea name="text_my_perspective" placeholder="My Perspective"></textarea>
    <textarea name="text_why_this_matters" placeholder="Why This Matters"></textarea>
    <input name="highlight_title" placeholder="Highlight Box Title">
    <textarea name="highlight_content" placeholder="Highlight Box Content"></textarea>
    <div class="results-header">
    <span class="results-title">Steps</span>
    <button type="button" class="btn btn-primary btn-small" id="addStepBtn">Add Step</button>
    </div>
    <div id="stepsRows"></div>
    <div class="results-header">
    <span class="results-title">Info Cards</span>
    <button type="button" class="btn btn-primary btn-small" id="addInfoCardBtn">Add Card</button>
    </div>
    <div id="infoCardsRows"></div>
    <textarea name="quote_content" placeholder="Quote Content" required></textarea>
    <input name="quote_author" placeholder="Quote Author">
    <input name="cta_title" placeholder="CTA Title">
    <textarea name="cta_description" placeholder="CTA Description"></textarea>
    <div class="results-header">
    <span class="results-title">CTA Buttons</span>
    <button type="button" class="btn btn-primary btn-small" id="addCtaButtonBtn">Add Button</button>
    </div>
    <div id="ctaButtonsRows"></div>
    `;

    setupBlogFormHandlers();
  } else {
    form.innerHTML = `
    <!-- BASIC INFO -->
    <fieldset>
      <legend>📋 Basic Information</legend>
      <input name="slug" placeholder="Slug" required>
      <div id="slugHint" class="help-text">Use lowercase words separated by hyphens.</div>
      <input name="title" placeholder="Title" required>
      <input name="client" placeholder="Client" required>
      <input name="industry" placeholder="Industry" required>
      <input name="image" placeholder="Hero Image URL" required>
      <textarea name="excerpt" placeholder="Excerpt (short description)" required></textarea>
      <select name="design" required>
        <option value="1">Design 1</option>
        <option value="2">Design 2</option>
        <option value="3">Design 3</option>
      </select>
    </fieldset>

    <!-- TAGS -->
    <fieldset>
      <legend>🏷️ Tags</legend>
      <div class="tag-editor">
        <div id="tagChips"></div>
        <input id="tagInput" type="text" placeholder="Type a tag and press Enter">
      </div>
    </fieldset>

    <!-- HERO SECTION -->
    <fieldset>
      <legend>🎨 Hero Section</legend>
      <input name="hero_title" placeholder="Hero Title">
      <input name="hero_subtitle" placeholder="Hero Subtitle">
      <input name="hero_image" placeholder="Hero Image URL">
    </fieldset>

    <!-- PROJECT OVERVIEW -->
    <fieldset>
      <legend>🎯 Project Overview</legend>
      <textarea name="overview_summary" placeholder="Summary of the project"></textarea>
      <div class="results-header">
        <span class="results-title">Goals</span>
        <button type="button" class="btn btn-primary btn-small" id="addGoalBtn">Add Goal</button>
      </div>
      <div id="goalsRows"></div>
    </fieldset>

    <!-- TABLE SECTION (friendly editor) -->
    <fieldset>
      <legend>📋 Table</legend>
      <label class="field-label">Table Title</label>
      <input name="table_title" placeholder="Table title">
      <div class="results-header">
        <span class="results-title">Columns</span>
        <button type="button" class="btn btn-primary btn-small" id="addTableColumnBtn">Add Column</button>
      </div>
      <div id="tableColumns"></div>

      <div class="results-header" style="margin-top:10px;">
        <span class="results-title">Rows</span>
        <button type="button" class="btn btn-primary btn-small" id="addTableRowBtn">Add Row</button>
      </div>
      <div id="tableRows"></div>
      <div class="help-text">Use the controls to add/remove columns and rows. Cells are simple text values.</div>
    </fieldset>

    <!-- CHALLENGE SECTION -->
    <fieldset>
      <legend>⚡ Challenge</legend>
      <input name="challenge_title" placeholder="Challenge Title">
      <input name="challenge_subtitle" placeholder="Challenge Subtitle">
      <textarea name="challenge_content" placeholder="Challenge Content/Description"></textarea>
      <input name="challenge_image" placeholder="Challenge Image URL">
    </fieldset>

    <!-- SOLUTION SECTION -->
    <fieldset>
      <legend>✅ Solution</legend>
      <textarea name="solution_description" placeholder="Solution Description"></textarea>
      <div class="results-header">
        <span class="results-title">Approach Steps</span>
        <button type="button" class="btn btn-primary btn-small" id="addApproachBtn">Add Step</button>
      </div>
      <div id="approachRows"></div>
    </fieldset>

    <!-- FEATURES SECTION -->
    <fieldset>
      <legend>✨ Features</legend>
      <div class="results-header">
        <span class="results-title">Feature Items</span>
        <button type="button" class="btn btn-primary btn-small" id="addFeatureBtn">Add Feature</button>
      </div>
      <div id="featuresRows"></div>
    </fieldset>

    <!-- BENEFITS SECTION -->
    <fieldset>
      <legend>🚀 Benefits</legend>
      <input name="benefits_title" placeholder="Benefits Title">
      <input name="benefits_subtitle" placeholder="Benefits Subtitle">
      <textarea name="benefits_description" placeholder="Benefits Description"></textarea>
      <div class="results-header">
        <span class="results-title">Benefit Items</span>
        <button type="button" class="btn btn-primary btn-small" id="addBenefitBtn">Add Benefit</button>
      </div>
      <div id="benefitsRows"></div>
    </fieldset>

    <!-- TESTIMONIAL SECTION -->
    <fieldset>
      <legend>💬 Testimonial</legend>
      <textarea name="testimonial_quote" placeholder="Quote from client/user"></textarea>
      <input name="testimonial_author" placeholder="Author Name">
    </fieldset>

    <!-- RESULTS SECTION -->
    <fieldset>
      <legend>📊 Results</legend>
      <div class="results-header">
        <span class="results-title">Qualitative Results</span>
        <button type="button" class="btn btn-primary btn-small" id="addResultBtn">Add Result</button>
      </div>
      <div id="resultsRows"></div>
    </fieldset>

    <!-- METRICS SECTION -->
    <fieldset>
      <legend>📈 Metrics</legend>
      <input name="metrics_title" placeholder="Metrics title (e.g. Key Metrics)">
      <input name="metrics_subtitle" placeholder="Metrics subtitle (optional)">
      <textarea name="metrics_description" placeholder="Metrics description (optional)"></textarea>
      <div class="results-header">
        <span class="results-title">Metric Items</span>
        <button type="button" class="btn btn-primary btn-small" id="addMetricBtn">Add Metric</button>
      </div>
      <div id="metricsRows"></div>
      <div class="help-text">Each metric is a small highlighted item with optional icon and label.</div>
    </fieldset>

    <!-- TECH STACK SECTION -->
    <fieldset>
      <legend>🛠️ Tech Stack</legend>
      <textarea name="tech_backend" placeholder="Backend (comma-separated)"></textarea>
      <textarea name="tech_frontend" placeholder="Frontend (comma-separated)"></textarea>
      <textarea name="tech_ai_ml" placeholder="AI/ML (comma-separated)"></textarea>
      <textarea name="tech_database" placeholder="Database (comma-separated)"></textarea>
      <textarea name="tech_infra" placeholder="Infrastructure (comma-separated)"></textarea>
    </fieldset>

    <!-- CTA SECTION -->
    <fieldset>
      <legend>🔗 Call to Action</legend>
      <input name="cta_title" placeholder="CTA Title">
      <textarea name="cta_description" placeholder="CTA Description"></textarea>
      <input name="cta_button_text" placeholder="Button Text">
      <input name="cta_button_link" placeholder="Button Link (URL)">
    </fieldset>
    `;

    // Setup event listeners for dynamic rows
    document.getElementById("addGoalBtn").addEventListener("click", () =>
      addBlogPairRow("goalsRows", "goal-heading", "goal-text", "Goal Heading", "Goal Description", "", "", "goal-emoji", "Emoji (optional)")
    );

    document.getElementById("addApproachBtn").addEventListener("click", () =>
      addBlogPairRow("approachRows", "approach-step", "approach-desc", "Step", "Description")
    );

    document.getElementById("addBenefitBtn").addEventListener("click", () =>
      addBlogPairRow("benefitsRows", "benefit-title", "benefit-text", "Benefit Title", "Benefit Description", "", "", "benefit-icon", "Icon/Emoji (optional)")
    );

    document.getElementById("addResultBtn").addEventListener("click", () =>
      addResultRow()
    );

    document.getElementById("addFeatureBtn").addEventListener("click", () =>
      addFeatureRow()
    );

    document.getElementById("addMetricBtn").addEventListener("click", () => addMetricRow());

    // Table editor controls (friendly UI)
    document.getElementById("addTableColumnBtn").addEventListener("click", () => addTableColumn());
    document.getElementById("addTableRowBtn").addEventListener("click", () => addTableRow());

    setupCaseStudyFormHandlers();
  }

  if (existingData) {
    if (current === "blogs") {
      const setField = (name, value) => {
        const node = form.querySelector(`[name="${name}"]`);
        if (node && value !== undefined && value !== null)
          node.value = String(value);
      };

      setField("slug", existingData.slug);
      setField("title", existingData.title);
      setField("design_number", String(existingData.design_number || 1));
      setField("content", existingData.content);
      setField("hero_badge", existingData.hero?.badge);
      setField("hero_subtitle", existingData.hero?.subtitle);
      setField("hero_image", existingData.hero?.image);
      setField("meta_author", existingData.meta?.author);
      if (existingData.meta?.date) {
        const localDate = new Date(existingData.meta.date);
        if (!Number.isNaN(localDate.getTime())) {
          setField("meta_date", localDate.toISOString().slice(0, 16));
        }
      }
      setField("meta_category", existingData.meta?.category);
      setField("meta_intro_img", existingData.meta?.intro_img);
      setField(
        "meta_current_landscape_img",
        existingData.meta?.current_landscape_img
      );
      setField(
        "meta_my_perspective_img",
        existingData.meta?.my_perspective_img
      );
      setField(
        "meta_why_this_matters_img",
        existingData.meta?.why_this_matters_img
      );
      setField("text_introduction", existingData.text_sections?.introduction);
      setField(
        "text_current_landscape",
        existingData.text_sections?.current_landscape
      );
      setField(
        "text_my_perspective",
        existingData.text_sections?.my_perspective
      );
      setField(
        "text_why_this_matters",
        existingData.text_sections?.why_this_matters
      );
      setField("highlight_title", existingData.highlight_box?.title);
      setField("highlight_content", existingData.highlight_box?.content);
      setField("quote_content", existingData.quote?.content);
      setField("quote_author", existingData.quote?.author);
      setField("cta_title", existingData.cta?.title);
      setField("cta_description", existingData.cta?.description);
      initBlogCollectionEditors(existingData);
    } else {
      // Case Study population
      const setField = (name, value) => {
        const node = form.querySelector(`[name="${name}"]`);
        if (node && value !== undefined && value !== null) {
          node.value = String(value);
        }
      };

      // Basic fields
      setField("slug", existingData.slug);
      setField("title", existingData.title);
      setField("client", existingData.client);
      setField("industry", existingData.industry);
      setField("image", existingData.image);
      setField("excerpt", existingData.excerpt);
      setField("design", String(existingData.design || 1));

      // Tags
      const tags = Array.isArray(existingData.tags) ? existingData.tags : [];
      initTagEditor(tags);

      // Extract sections from sections array
      const sections = Array.isArray(existingData.sections) ? existingData.sections : [];
      
      sections.forEach((section) => {
        const type = section?.type || "";
        const data = section?.data || {};

        if (type === "hero" && data) {
          setField("hero_title", data.title);
          setField("hero_subtitle", data.subtitle);
          setField("hero_image", data.image);
        } else if (type === "project_overview" && data) {
          setField("overview_summary", data.summary);
          if (Array.isArray(data.goals)) {
            data.goals.forEach((goal) => {
              addBlogPairRow(
                "goalsRows",
                "goal-heading",
                "goal-text",
                "Goal Heading",
                "Goal Description",
                goal.heading || "",
                goal.text || "",
                "goal-emoji",
                "Emoji (optional)",
                goal.emoji || ""
              );
            });
          }
        } else if (type === "table" && data) {
          // populate friendly table editor
          setField("table_title", data.title || "");
          try {
            populateTableEditor(data);
          } catch (e) {
            // fallback: clear editor on error
            console.warn("Failed to populate table editor:", e);
          }
        } else if (type === "challenge" && data) {
          setField("challenge_title", data.title);
          setField("challenge_subtitle", data.subtitle);
          setField("challenge_content", data.content);
          setField("challenge_image", data.image);
        } else if (type === "solution" && data) {
          setField("solution_description", data.description);
          if (Array.isArray(data.approach)) {
            data.approach.forEach((step) => {
              addBlogPairRow("approachRows", "approach-step", "approach-desc", "Step", "Description", step, "");
            });
          }
        } else if (type === "features" && data) {
          // Features may be stored as an array of feature objects or an object with `features` array
          const featureList = Array.isArray(data) ? data : Array.isArray(data.features) ? data.features : [];
          featureList.forEach((f) => {
            if (f && typeof f === 'object') {
              addFeatureRow(f.title || '', f.description || '', f.icon || '');
            } else if (typeof f === 'string') {
              addFeatureRow(f, '');
            }
          });
        } else if (type === "benefits" && data) {
          setField("benefits_title", data.title);
          setField("benefits_subtitle", data.subtitle);
          setField("benefits_description", data.description);
          if (Array.isArray(data.benefits)) {
            data.benefits.forEach((benefit) => {
              addBlogPairRow(
                "benefitsRows",
                "benefit-title",
                "benefit-text",
                "Benefit Title",
                "Benefit Description",
                benefit.title || "",
                benefit.text || "",
                "benefit-icon",
                "Icon/Emoji (optional)",
                benefit.icon || ""
              );
            });
          }
        } else if (type === "testimonial" && data) {
          setField("testimonial_quote", data.quote);
          setField("testimonial_author", data.author);
        } else if (type === "metrics" && data) {
          // populate metrics section
          setField("metrics_title", data.title || "");
          setField("metrics_subtitle", data.subtitle || "");
          setField("metrics_description", data.description || "");
          if (Array.isArray(data.metrics)) {
            data.metrics.forEach((m) => {
              addMetricRow(m.icon || "", m.label || "");
            });
          }
          if (data.testimonial) {
            setField("testimonial_quote", data.testimonial.quote || "");
            setField("testimonial_author", data.testimonial.author || "");
          }
        } else if (type === "results" && data) {
          if (Array.isArray(data.qualitative)) {
            data.qualitative.forEach((result) => {
              addResultRow(result.metric || "", result.value || "");
            });
          }
        } else if (type === "tech_stack" && data) {
          setField("tech_backend", Array.isArray(data.backend) ? data.backend.join(", ") : "");
          setField("tech_frontend", Array.isArray(data.frontend) ? data.frontend.join(", ") : "");
          setField("tech_ai_ml", Array.isArray(data.ai_ml) ? data.ai_ml.join(", ") : "");
          setField("tech_database", Array.isArray(data.database) ? data.database.join(", ") : "");
          setField("tech_infra", Array.isArray(data.infra) ? data.infra.join(", ") : "");
        } else if (type === "cta" && data) {
          setField("cta_title", data.title);
          setField("cta_description", data.description);
          setField("cta_button_text", data.button_text);
          setField("cta_button_link", data.button_link);
        }
      });
    }
  } else if (current === "case-studies") {
    // Initialize empty rows for case study creation
    const goalsBtn = document.getElementById("addGoalBtn");
    const approachBtn = document.getElementById("addApproachBtn");
    const benefitBtn = document.getElementById("addBenefitBtn");
    const resultBtn = document.getElementById("addResultBtn");

    if (goalsBtn) goalsBtn.click();
    if (approachBtn) approachBtn.click();
    if (benefitBtn) benefitBtn.click();
    if (resultBtn) resultBtn.click();
  }

  ensureFieldLabels(form);

  updateSlugHint();
  updateContentPreview();

  document.getElementById("formTitle").innerText =
    (isEdit ? "Edit " : "Create ") + current;
  document.getElementById("status").innerHTML = "";

  openModal();
}

// Initialize Event Listeners
// Setup form handler first (before DOMContentLoaded to avoid timing issues)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupEventListeners);
} else {
  setupEventListeners();
}

function setupEventListeners() {
  // Auth form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Navigation
  const blogNav = document.getElementById("blogNav");
  const caseNav = document.getElementById("caseNav");
  const subsNav = document.getElementById("subsNav");
  const msgNav = document.getElementById("msgNav");

  if (blogNav) blogNav.addEventListener("click", loadBlogs);
  if (caseNav) caseNav.addEventListener("click", loadCases);
  if (subsNav) subsNav.addEventListener("click", loadSubscribers);
  if (msgNav) msgNav.addEventListener("click", loadMessages);

  // Buttons
  const addBtn = document.getElementById("addBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const copyEmailsBtn = document.getElementById("copyEmailsBtn");

  if (addBtn) addBtn.addEventListener("click", () => openCreate());
  if (saveBtn) saveBtn.addEventListener("click", save);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (copyEmailsBtn) copyEmailsBtn.addEventListener("click", copyAllSubscriberEmails);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      const modal = document.getElementById("modal");

      if (modal && modal.style.display === "flex") {
        e.preventDefault();
        save(e);
      }
    }
  });

  // Check auth on load
  const existingToken = getToken();

  if (existingToken && !isExpired(existingToken)) {
    showAdmin();
    loadBlogs();
  } else {
    showLogin();
  }

  // Close modal when clicking outside
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
      closeModal();
    }
  });
}

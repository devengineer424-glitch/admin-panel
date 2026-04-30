// API Fetch Wrapper & CRUD Operations

async function authFetch(url, options = {}) {
  const token = getToken();

  if (!token || isExpired(token)) {
    logout("Session expired. Please log in again.");
    throw new Error("Missing or expired token");
  }

  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    logout("Unauthorized access. Please log in again.");
    throw new Error("Unauthorized");
  }

  return response;
}

// Load data from API
async function loadBlogs() {
  current = "blogs";
  setActive(document.getElementById("blogNav"));
  document.getElementById("sectionTitle").innerText = "Blogs";
  setAddVisibility();
  setSubscriberActionsVisibility();
  setMessagesView(true);

  authFetch(API + "/blogs/")
    .then((r) => r.json())
    .then(renderBlogsView)
    .catch((err) => {
      setStatus("loginStatus", err.message || "Request failed", true);
    });
}

async function loadCases() {
  current = "case-studies";
  setActive(document.getElementById("caseNav"));
  document.getElementById("sectionTitle").innerText = "Case Studies";
  setAddVisibility();
  setSubscriberActionsVisibility();
  setMessagesView(true);

  authFetch(API + "/case-studies/")
    .then((r) => r.json())
    .then(renderCaseStudiesView)
    .catch((err) => {
      setStatus("loginStatus", err.message || "Request failed", true);
    });
}

async function loadSubscribers() {
  current = "newsletter-subscribers";
  currentItems = [];
  setActive(document.getElementById("subsNav"));
  document.getElementById("sectionTitle").innerText = "Subscribed Emails";
  setAddVisibility();
  setSubscriberActionsVisibility();
  setMessagesView(false);

  authFetch(API + "/newsletter/subscribers")
    .then((r) => r.json())
    .then(renderTable)
    .catch((err) => {
      setStatus("loginStatus", err.message || "Request failed", true);
    });
}

async function loadMessages() {
  current = "contact-messages";
  setActive(document.getElementById("msgNav"));
  document.getElementById("sectionTitle").innerText = "Contact Messages";
  setAddVisibility();
  setSubscriberActionsVisibility();
  setMessagesView(true);

  authFetch(API + "/contact-messages/")
    .then((r) => r.json())
    .then(renderMessagesView)
    .catch((err) => {
      setStatus("loginStatus", err.message || "Request failed", true);
    });
}

async function save(event) {
  if (isReadOnlySection()) return;

  if (event) event.preventDefault();

  const form = document.getElementById("dataForm");
  const status = document.getElementById("status");
  const saveBtn = document.getElementById("saveBtn");

  if (saveBtn && saveBtn.disabled) return;

  const setSavingState = (isSaving) => {
    if (!saveBtn) return;
    if (isSaving) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = "<span class='btn-loader' aria-hidden='true'></span>Saving...";
      return;
    }
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  };

  // Utility functions available for both blogs and case studies
  const cleanValue = (value) => {
    const v = String(value || "").trim();
    return v ? v : null;
  };

  const compactObject = (obj) => {
    const entries = Object.entries(obj).filter(([, value]) => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return true;
    });

    return entries.length ? Object.fromEntries(entries) : null;
  };

  let data = {};

  Array.from(form.elements).forEach((el) => {
    if (el.name) data[el.name] = el.value;
  });

  if (current === "blogs") {
    if (!validateRequiredBlogFields(data, status)) {
      return;
    }

    try {
      const steps = getBlogPairRows(
        "stepsRows",
        "step-title",
        "step-description",
        "title",
        "description"
      );
      const infoCards = getBlogPairRows(
        "infoCardsRows",
        "info-title",
        "info-content",
        "title",
        "content",
        "info-image",
        "image"
      );
      const ctaButtons = getBlogPairRows(
        "ctaButtonsRows",
        "cta-btn-text",
        "cta-btn-action",
        "text",
        "action"
      );
      const metaDateRaw = cleanValue(data.meta_date);

      data = {
        slug: cleanValue(data.slug) || "",
        title: cleanValue(data.title) || "",
        design_number: Number.parseInt(String(data.design_number || "1"), 10) || 1,
        content: cleanValue(data.content),
        hero: compactObject({
          badge: cleanValue(data.hero_badge),
          subtitle: cleanValue(data.hero_subtitle),
          image: cleanValue(data.hero_image),
        }),
        meta: {
          author: cleanValue(data.meta_author),
          date: metaDateRaw ? new Date(metaDateRaw).toISOString() : null,
          category: cleanValue(data.meta_category),
          intro_img: cleanValue(data.meta_intro_img),
          current_landscape_img: cleanValue(data.meta_current_landscape_img),
          my_perspective_img: cleanValue(data.meta_my_perspective_img),
          why_this_matters_img: cleanValue(data.meta_why_this_matters_img),
        },
        text_sections: compactObject({
          introduction: cleanValue(data.text_introduction),
          current_landscape: cleanValue(data.text_current_landscape),
          my_perspective: cleanValue(data.text_my_perspective),
          why_this_matters: cleanValue(data.text_why_this_matters),
        }),
        highlight_box: compactObject({
          title: cleanValue(data.highlight_title),
          content: cleanValue(data.highlight_content),
        }),
        steps: steps.length ? steps : null,
        info_cards: infoCards.length ? infoCards : null,
        quote: compactObject({
          content: cleanValue(data.quote_content),
          author: cleanValue(data.quote_author),
        }),
        cta: compactObject({
          title: cleanValue(data.cta_title),
          description: cleanValue(data.cta_description),
          buttons: ctaButtons.length ? ctaButtons : null,
        }),
      };
    } catch (err) {
      status.innerHTML = `<span class='error'>${err.message || "Invalid blogs data"}</span>`;
      return;
    }
  }

  if (current === "case-studies") {
    data.tags = getTagsFromChips();

    // Extract section data from form fields
    const newSections = [];
    const editedSectionTypes = new Set();

    // Hero section
    if (data.hero_title || data.hero_subtitle || data.hero_image) {
      newSections.push({
        type: "hero",
        data: {
          title: cleanValue(data.hero_title),
          subtitle: cleanValue(data.hero_subtitle),
          image: cleanValue(data.hero_image),
        },
      });
      editedSectionTypes.add("hero");
    }

    // Project Overview section
    const goalsRows = getBlogPairRows("goalsRows", "goal-heading", "goal-text", "heading", "text", "goal-emoji", "emoji");
    if (data.overview_summary || goalsRows.length > 0) {
      newSections.push({
        type: "project_overview",
        data: {
          summary: cleanValue(data.overview_summary),
          goals: goalsRows.map(g => ({
            heading: g.heading,
            text: g.text,
            emoji: g.emoji || "",
          })),
        },
      });
      editedSectionTypes.add("project_overview");
    }

    // Challenge section
    if (data.challenge_title || data.challenge_subtitle || data.challenge_content || data.challenge_image) {
      newSections.push({
        type: "challenge",
        data: {
          title: cleanValue(data.challenge_title),
          subtitle: cleanValue(data.challenge_subtitle),
          content: cleanValue(data.challenge_content),
          image: cleanValue(data.challenge_image),
        },
      });
      editedSectionTypes.add("challenge");
    }

    // Solution section
    const approachRows = getBlogPairRows("approachRows", "approach-step", "approach-desc", "step", "description");
    if (data.solution_description || approachRows.length > 0) {
      newSections.push({
        type: "solution",
        data: {
          description: cleanValue(data.solution_description),
          approach: approachRows.map(a => a.step),
        },
      });
      editedSectionTypes.add("solution");
    }

    // Benefits section
    const benefitsRows = getBlogPairRows("benefitsRows", "benefit-title", "benefit-text", "title", "text", "benefit-icon", "icon");
    if (data.benefits_title || data.benefits_subtitle || data.benefits_description || benefitsRows.length > 0) {
      newSections.push({
        type: "benefits",
        data: {
          title: cleanValue(data.benefits_title),
          subtitle: cleanValue(data.benefits_subtitle),
          description: cleanValue(data.benefits_description),
          benefits: benefitsRows.map(b => ({
            title: b.title,
            text: b.text,
            icon: b.icon || "",
          })),
        },
      });
      editedSectionTypes.add("benefits");
    }

    // Testimonial section
    if (data.testimonial_quote || data.testimonial_author) {
      newSections.push({
        type: "testimonial",
        data: {
          quote: cleanValue(data.testimonial_quote),
          author: cleanValue(data.testimonial_author),
        },
      });
      editedSectionTypes.add("testimonial");
    }

    // Results section
    const resultsRows = getResultsFromRows();
    if (resultsRows.length > 0) {
      const valid = resultsRows.every((item) => item.metric && item.value);
      if (!valid) {
        status.innerHTML =
          "<span class='error'>Each result row needs both metric and value</span>";
        return;
      }
      newSections.push({
        type: "results",
        data: {
          qualitative: resultsRows.map(r => ({
            metric: r.metric,
            value: r.value,
          })),
        },
      });
      editedSectionTypes.add("results");
    }


    // TESTING DUAL SECTION
    if (
      data.test_left_title ||
      data.test_right_title
    ) {
      newSections.push({
        type: "testing_dual",
        data: {
          left: {
            eyebrow: cleanValue(data.test_left_eyebrow),
            title: cleanValue(data.test_left_title),
            highlight: cleanValue(data.test_left_highlight),
            description: cleanValue(data.test_left_desc),
          },
          right: {
            eyebrow: cleanValue(data.test_right_eyebrow),
            title: cleanValue(data.test_right_title),
            highlight: cleanValue(data.test_right_highlight),
            description: cleanValue(data.test_right_desc),
          },
        },
      });
    }

    // Features section
    try {
      if (typeof getFeaturesFromRows === "function") {
        const features = getFeaturesFromRows();
        if (features && Array.isArray(features) && features.length) {
          newSections.push({ type: "features", data: features });
          editedSectionTypes.add("features");
        }
      }
    } catch (err) {
      console.warn("Failed to read features data", err);
      status.innerHTML = "<span class='error'>Invalid Features data</span>";
      return;
    }

    // Metrics section
    try {
      const mTitle = cleanValue(data.metrics_title);
      const mSubtitle = cleanValue(data.metrics_subtitle);
      const mDescription = cleanValue(data.metrics_description);
      if (mTitle || mSubtitle || mDescription || (typeof getMetricsFromRows === "function" && getMetricsFromRows().length)) {
        const metricsItems = (typeof getMetricsFromRows === "function") ? getMetricsFromRows() : [];
        const metricsData = {
          title: mTitle || "",
          subtitle: mSubtitle || null,
          description: mDescription || null,
          metrics: metricsItems,
        };
        // optional testimonial may have been captured earlier
        if (data.testimonial_quote || data.testimonial_author) {
          metricsData.testimonial = {
            quote: cleanValue(data.testimonial_quote),
            author: cleanValue(data.testimonial_author),
          };
        }
        newSections.push({ type: "metrics", data: metricsData });
        editedSectionTypes.add("metrics");
      }
    } catch (err) {
      console.warn("Failed to read metrics data", err);
      status.innerHTML = "<span class='error'>Invalid Metrics data</span>";
      return;
    }

    // Tech Stack section
    const parseCommaSeparated = (str) => {
      if (!str) return [];
      return str.split(",").map(s => s.trim()).filter(s => s);
    };
    if (data.tech_backend || data.tech_frontend || data.tech_ai_ml || data.tech_database || data.tech_infra) {
      newSections.push({
        type: "tech_stack",
        data: {
          backend: parseCommaSeparated(data.tech_backend),
          frontend: parseCommaSeparated(data.tech_frontend),
          ai_ml: parseCommaSeparated(data.tech_ai_ml),
          database: parseCommaSeparated(data.tech_database),
          infra: parseCommaSeparated(data.tech_infra),
        },
      });
      editedSectionTypes.add("tech_stack");
    }

    // CTA section
    if (data.cta_title || data.cta_description || data.cta_button_text || data.cta_button_link) {
      newSections.push({
        type: "cta",
        data: {
          title: cleanValue(data.cta_title),
          description: cleanValue(data.cta_description),
          button_text: cleanValue(data.cta_button_text),
          button_link: cleanValue(data.cta_button_link),
        },
      });
      editedSectionTypes.add("cta");
    }

    // Table section (friendly table editor)
    try {
      if (typeof getTableEditorData === "function") {
        const tableData = getTableEditorData();
        if (tableData && Array.isArray(tableData.columns) && tableData.columns.length) {
          // include title from simple input if present
          const tablePayload = Object.assign({ title: cleanValue(data.table_title) || "" }, tableData);
          newSections.push({ type: "table", data: tablePayload });
          editedSectionTypes.add("table");
        }
      }
    } catch (err) {
      console.warn("Failed to read table editor data", err);
      status.innerHTML = "<span class='error'>Invalid Table data</span>";
      return;
    }

    // Preserve sections that aren't being edited (features, table, metrics, etc.)
    if (editId && currentItems) {
      const existingItem = currentItems.find(item => String(item.id) === String(editId));
      if (existingItem && Array.isArray(existingItem.sections)) {
        existingItem.sections.forEach(section => {
          if (!editedSectionTypes.has(section.type)) {
            newSections.push(section);
          }
        });
      }
    }

    // Finalize case study data
    data = {
      slug: cleanValue(data.slug) || "",
      title: cleanValue(data.title) || "",
      client: cleanValue(data.client) || "",
      industry: cleanValue(data.industry) || "",
      image: cleanValue(data.image) || "",
      excerpt: cleanValue(data.excerpt) || "",
      design: Number.parseInt(String(data.design || "1"), 10) || 1,
      tags: data.tags,
      sections: newSections,
    };
  }

  const slug = (data.slug || "").trim().toLowerCase();

  if (slug) {
    const duplicate = currentItems.find(
      (item) =>
        String(item.slug || "").trim().toLowerCase() === slug &&
        (!editId || String(item.id) !== String(editId))
    );

    if (duplicate) {
      status.innerHTML = "<span class='error'>Slug already exists</span>";
      return;
    }
  }

  let url = API + "/" + current + "/";
  let method = "POST";

  if (editId) {
    url += editId;
    method = "PUT";
  }

  authFetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      return res.json()
        .then((data) => ({ ok: res.ok, data }))
        .catch(() => ({ ok: res.ok, data: {} }));
    })
    .then(({ ok, data }) => {
      setSavingState(false);
      if (!ok) {
        const message = data.detail || "Request failed";
        throw new Error(message);
      }
      status.innerHTML = "<span class='success'>Saved successfully</span>";
      setTimeout(() => location.reload(), 800);
    })
    .catch((err) => {
      setSavingState(false);
      status.innerHTML = `<span class='error'>${err.message || "Error saving data"}</span>`;
    });

  setSavingState(true);
}

async function removeItem(id) {
  if (isReadOnlySection()) return;

  if (!confirm("Delete this item?")) return;

  authFetch(API + "/" + current + "/" + id, { method: "DELETE" })
    .then(() => location.reload());
}

async function edit(id) {
  if (isReadOnlySection()) return;

  authFetch(API + "/" + current + "/" + id)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load data for edit");
      return res.json();
    })
    .then((data) => openCreate(data))
    .catch((err) => {
      const status = document.getElementById("status");
      status.innerHTML = `<span class='error'>${err.message}</span>`;
      openModal();
    });
}

// Form Handling & Data Collection

function addBlogPairRow(
  containerId,
  firstClass,
  secondClass,
  firstPlaceholder,
  secondPlaceholder,
  firstValue = "",
  secondValue = "",
  thirdClass,
  thirdPlaceholder,
  thirdValue = ""
) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const row = document.createElement("div");
  row.className = thirdClass ? "result-row three" : "result-row";

  const firstInput = document.createElement("input");
  firstInput.type = "text";
  firstInput.className = firstClass;
  firstInput.placeholder = firstPlaceholder;
  firstInput.value = firstValue;

  const secondInput = document.createElement("input");
  secondInput.type = "text";
  secondInput.className = secondClass;
  secondInput.placeholder = secondPlaceholder;
  secondInput.value = secondValue;

  let thirdInput;
  if (thirdClass) {
    thirdInput = document.createElement("input");
    thirdInput.type = "text";
    thirdInput.className = thirdClass;
    thirdInput.placeholder = thirdPlaceholder;
    thirdInput.value = thirdValue || "";
  }

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(firstInput);
  row.appendChild(secondInput);
  if (thirdInput) row.appendChild(thirdInput);
  row.appendChild(removeBtn);

  container.appendChild(row);
}

function addSolutionImageRow(url = "") {
  const container = document.getElementById("solutionImagesRows");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "result-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "solution-image-url";
  input.placeholder = "Image URL";
  input.value = url || "";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(input);
  row.appendChild(removeBtn);
  container.appendChild(row);
}

function addCtaButtonRow(textValue = "", actionValue = "") {
  const container = document.getElementById("ctaButtonsRows");

  if (!container) return;

  const row = document.createElement("div");
  row.className = "result-row";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = "cta-btn-text";
  textInput.placeholder = "Button text";
  textInput.value = textValue;

  const actionSelect = document.createElement("select");
  actionSelect.className = "cta-btn-action";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Select button link";
  actionSelect.appendChild(placeholderOption);

  CTA_ACTION_OPTIONS.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    actionSelect.appendChild(option);
  });

  if (actionValue && !CTA_ACTION_OPTIONS.includes(actionValue)) {
    const customOption = document.createElement("option");
    customOption.value = actionValue;
    customOption.textContent = `${actionValue} (existing)`;
    actionSelect.appendChild(customOption);
  }

  actionSelect.value = actionValue || "";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(textInput);
  row.appendChild(actionSelect);
  row.appendChild(removeBtn);

  container.appendChild(row);
}

function getBlogPairRows(
  containerId,
  firstSelector,
  secondSelector,
  firstKey,
  secondKey,
  thirdSelector,
  thirdKey
) {
  const rows = document.querySelectorAll(`#${containerId} .result-row`);

  return Array.from(rows)
    .map((row) => {
      const obj = {
        [firstKey]:
          (row.querySelector(`.${firstSelector}`)?.value || "").trim(),
        [secondKey]:
          (row.querySelector(`.${secondSelector}`)?.value || "").trim(),
      };

      if (thirdSelector && thirdKey) {
        obj[thirdKey] = (
          row.querySelector(`.${thirdSelector}`)?.value || ""
        ).trim();
      }

      return obj;
    })
    .filter((item) => {
      if (thirdKey && Object.prototype.hasOwnProperty.call(item, thirdKey)) {
        return item[firstKey] || item[secondKey] || item[thirdKey];
      }
      return item[firstKey] || item[secondKey];
    });
}

function validateRequiredBlogFields(values, status) {
  const missing = [];

  if (!String(values.slug || "").trim()) missing.push("Slug");
  if (!String(values.title || "").trim()) missing.push("Title");
  if (!String(values.hero_image || "").trim()) missing.push("Hero Image URL");
  if (!String(values.quote_content || "").trim())
    missing.push("Quote Content");

  if (missing.length) {
    status.innerHTML = `<span class='error'>Please fill: ${missing.join(", ")}</span>`;
    return false;
  }

  return true;
}

function addTagChip(tag) {
  const cleanTag = String(tag || "").trim();

  if (!cleanTag) return;

  const chipsContainer = document.getElementById("tagChips");

  if (!chipsContainer) return;

  const existing = getTagsFromChips().map((t) => t.toLowerCase());

  if (existing.includes(cleanTag.toLowerCase())) return;

  const chip = document.createElement("span");
  chip.className = "tag-chip";

  const textNode = document.createElement("span");
  textNode.className = "tag-chip-text";
  textNode.textContent = cleanTag;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "x";
  removeBtn.addEventListener("click", () => chip.remove());

  chip.appendChild(textNode);
  chip.appendChild(removeBtn);
  chipsContainer.appendChild(chip);
}

function setFieldValue(form, name, value) {
  const node = form.querySelector(`[name="${name}"]`);
  if (node && value !== undefined && value !== null) {
    node.value = String(value);
  }
}

function initializeCaseStudyEmptyRows() {
  const goalsBtn = document.getElementById("addGoalBtn");
  const approachBtn = document.getElementById("addApproachBtn");
  const benefitBtn = document.getElementById("addBenefitBtn");
  const featureBtn = document.getElementById("addFeatureBtn");
  const metricBtn = document.getElementById("addMetricBtn");

  const designSelect = document.querySelector('#dataForm select[name="design"]');
  const design = designSelect ? String(designSelect.value || "1") : "1";

  if (design === "1") {
    if (approachBtn) approachBtn.click();
    if (benefitBtn) benefitBtn.click();
    if (featureBtn) featureBtn.click();
    if (metricBtn) metricBtn.click();
  } else {
    if (goalsBtn) goalsBtn.click();
  }
}

function populateBlogForm(form, existingData) {
  setFieldValue(form, "slug", existingData.slug);
  setFieldValue(form, "title", existingData.title);
  setFieldValue(form, "design_number", String(existingData.design_number || 1));
  setFieldValue(form, "content", existingData.content);
  setFieldValue(form, "hero_badge", existingData.hero?.badge);
  setFieldValue(form, "hero_subtitle", existingData.hero?.subtitle);
  setFieldValue(form, "hero_image", existingData.hero?.image);
  setFieldValue(form, "meta_author", existingData.meta?.author);

  if (existingData.meta?.date) {
    const localDate = new Date(existingData.meta.date);
    if (!Number.isNaN(localDate.getTime())) {
      setFieldValue(form, "meta_date", localDate.toISOString().slice(0, 16));
    }
  }

  setFieldValue(form, "meta_category", existingData.meta?.category);
  setFieldValue(form, "meta_intro_img", existingData.meta?.intro_img);
  setFieldValue(form, "meta_current_landscape_img", existingData.meta?.current_landscape_img);
  setFieldValue(form, "meta_my_perspective_img", existingData.meta?.my_perspective_img);
  setFieldValue(form, "meta_why_this_matters_img", existingData.meta?.why_this_matters_img);
  setFieldValue(form, "text_introduction", existingData.text_sections?.introduction);
  setFieldValue(form, "text_current_landscape", existingData.text_sections?.current_landscape);
  setFieldValue(form, "text_my_perspective", existingData.text_sections?.my_perspective);
  setFieldValue(form, "text_why_this_matters", existingData.text_sections?.why_this_matters);
  setFieldValue(form, "highlight_title", existingData.highlight_box?.title);
  setFieldValue(form, "highlight_content", existingData.highlight_box?.content);
  setFieldValue(form, "quote_content", existingData.quote?.content);
  setFieldValue(form, "quote_author", existingData.quote?.author);
  setFieldValue(form, "cta_title", existingData.cta?.title);
  setFieldValue(form, "cta_description", existingData.cta?.description);
  initBlogCollectionEditors(existingData);
}

function populateCaseStudyForm(form, existingData) {
  setFieldValue(form, "slug", existingData.slug);
  setFieldValue(form, "title", existingData.title);
  setFieldValue(form, "client", existingData.client);
  setFieldValue(form, "industry", existingData.industry);
  setFieldValue(form, "image", existingData.image);
  setFieldValue(form, "excerpt", existingData.excerpt);
  const normalizedDesign = Number(existingData.design) === 1 ? "1" : "2";
  setFieldValue(form, "design", normalizedDesign);

  const tags = Array.isArray(existingData.tags) ? existingData.tags : [];
  initTagEditor(tags);

  const sections = Array.isArray(existingData.sections) ? existingData.sections : [];

  document.getElementById("snapshotRows").innerHTML = "";
  document.getElementById("techCards").innerHTML = "";

  const solImagesContainer = document.getElementById("solutionImagesRows");
  if (solImagesContainer) solImagesContainer.innerHTML = "";

  const whatBuiltContainer = document.getElementById("whatWeBuiltImagesRows");
  if (whatBuiltContainer) whatBuiltContainer.innerHTML = "";

  sections.forEach((section) => {
    const type = section?.type || "";
    const data = section?.data || {};

    if (type === "hero" && data) {
      setFieldValue(form, "hero_title", data.title);
      setFieldValue(form, "hero_subtitle", data.subtitle);
      setFieldValue(form, "hero_image", data.image);
    } else if (type === "project_overview" && data) {
      // Only populate project overview when design is 2
      if (String(normalizedDesign) === "2") {
      setFieldValue(form, "overview_summary", data.summary);
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
      }
    } else if (type === "table" && data) {
      setFieldValue(form, "table_title", data.title || "");
      try {
        populateTableEditor(data);
      } catch (e) {
        console.warn("Failed to populate table editor:", e);
      }
    } else if (type === "challenge" && data) {
      setFieldValue(form, "challenge_title", data.title);
      setFieldValue(form, "challenge_subtitle", data.subtitle);
      setFieldValue(form, "challenge_content", data.content);
      setFieldValue(form, "challenge_image", data.image);
    } else if (type === "solution" && data) {
      setFieldValue(form, "solution_description", data.description);
      if (Array.isArray(data.approach)) {
        data.approach.forEach((step) => {
          addBlogPairRow("approachRows", "approach-step", "approach-desc", "Step", "Description", step, "");
        });
      }
    } else if (type === "testing_dual" && data) {
      const left = data.left || {};
      const right = data.right || {};

      setFieldValue(form, "test_left_eyebrow", left.eyebrow);
      setFieldValue(form, "test_left_title", left.title);
      setFieldValue(form, "test_left_highlight", left.highlight);
      setFieldValue(form, "test_left_desc", left.description);
      setFieldValue(form, "test_right_eyebrow", right.eyebrow);
      setFieldValue(form, "test_right_title", right.title);
      setFieldValue(form, "test_right_highlight", right.highlight);
      setFieldValue(form, "test_right_desc", right.description);
    } else if (type === "features" && data) {
      const featureList = Array.isArray(data)
        ? data
        : Array.isArray(data.features)
        ? data.features
        : [];

      featureList.forEach((f) => {
        if (f && typeof f === "object") {
          addFeatureRow(f.title || "", f.description || "", f.icon || "");
        } else if (typeof f === "string") {
          addFeatureRow(f, "");
        }
      });
    } else if (type === "benefits" && data) {
      setFieldValue(form, "benefits_title", data.title);
      setFieldValue(form, "benefits_subtitle", data.subtitle);
      setFieldValue(form, "benefits_description", data.description);
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
      setFieldValue(form, "testimonial_quote", data.quote);
      setFieldValue(form, "testimonial_author", data.author);
    } else if (type === "metrics" && data) {
      setFieldValue(form, "metrics_title", data.title || "");
      setFieldValue(form, "metrics_subtitle", data.subtitle || "");
      setFieldValue(form, "metrics_description", data.description || "");
      if (Array.isArray(data.metrics)) {
        data.metrics.forEach((m) => {
          addMetricRow(m.icon || "", m.label || "");
        });
      }
      if (data.testimonial) {
        setFieldValue(form, "testimonial_quote", data.testimonial.quote || "");
        setFieldValue(form, "testimonial_author", data.testimonial.author || "");
      }
    } else if (type === "cta" && data) {
      setFieldValue(form, "cta_title", data.title);
      setFieldValue(form, "cta_description", data.description);
      setFieldValue(form, "cta_button_text", data.button_text);
      const linkField = form.querySelector("[name='cta_button_link']");
      if (linkField) {
        linkField.value = data.button_link || "";
      }
    } else if (type === "snapshot_strip" && data) {
      if (Array.isArray(data.items)) {
        data.items.forEach((item) => {
          addSnapshotRow(item.label || "", item.value || "", item.icon || "");
        });
      }
    } else if (type === "about" && data) {
      setFieldValue(form, "about_label", data.label);
      setFieldValue(form, "about_title", data.title);
      setFieldValue(form, "about_paragraphs", (data.paragraphs || []).join("\n"));
      setFieldValue(form, "about_image", data.image);
    } else if (type === "challenge_v2" && data) {
      setFieldValue(form, "challenge_v2_title", data.title);
      setFieldValue(form, "challenge_v2_paragraphs", (data.paragraphs || []).join("\n"));
      setFieldValue(form, "challenge_v2_image", data.image);
    } else if (type === "solution_v2" && data) {
      setFieldValue(form, "solution_v2_title", data.title);
      setFieldValue(form, "solution_v2_paragraphs", (data.paragraphs || []).join("\n"));
      if (Array.isArray(data.images) && data.images.length) {
        data.images.forEach((img) => {
          addSolutionImageRow(img);
        });
      }
    } else if (type === "what_we_built" && data) {
      setFieldValue(form, "what_we_built_title", data.title);
      setFieldValue(form, "what_we_built_paragraphs", (data.paragraphs || []).join("\n"));
      if (Array.isArray(data.images) && data.images.length) {
        data.images.forEach((img) => addWhatWeBuiltImageRow(img));
      }
    } else if (type === "technology" && data) {
      setFieldValue(form, "technology_title", data.title);
      setFieldValue(form, "technology_paragraphs", (data.paragraphs || []).join("\n"));

      if (Array.isArray(data.cards)) {
        data.cards.forEach((card) => {
          addTechCard(card.title || "", card.desc || "", card.icon || "");
        });
      }
    } else if (type === "final_cta_v2" && data) {
      setFieldValue(form, "cta_v2_title", data.title);
      setFieldValue(form, "cta_v2_desc", data.description);
      setFieldValue(form, "cta_v2_text", data.button?.text);
      setFieldValue(form, "cta_v2_link", data.button?.href);
    }
  });
}

async function openCreate(existingData = null) {
  if (isReadOnlySection()) return;

  editId = existingData && existingData.id ? existingData.id : null;

  const isEdit = !!editId;
  const form = document.getElementById("dataForm");

  if (current === "blogs") {
    form.innerHTML = await loadHtmlTemplate("templates/blog-form.html");
    setupBlogFormHandlers();
  } else {
    form.innerHTML = await loadHtmlTemplate("templates/case-study-form.html");
  }

  if (existingData) {
    if (current === "blogs") {
      populateBlogForm(form, existingData);
    } else {
      populateCaseStudyForm(form, existingData);
    }
  } else if (current === "case-studies") {
    initializeCaseStudyEmptyRows();
  }

  if (current === "case-studies") {
    setupCaseStudyFormHandlers();
    try {
      const finalCtaSelect = form.querySelector("select[name='cta_v2_link']");
      if (finalCtaSelect) {
        finalCtaSelect.innerHTML = "";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Select Link";
        finalCtaSelect.appendChild(placeholder);
        if (Array.isArray(CTA_ACTION_OPTIONS)) {
          CTA_ACTION_OPTIONS.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt;
            finalCtaSelect.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.warn("Failed to populate final CTA options", error);
    }
  }

  ensureFieldLabels(form);
  updateSlugHint();
  updateContentPreview();

  document.getElementById("formTitle").innerText = (isEdit ? "Edit " : "Create ") + current;
  document.getElementById("status").innerHTML = "";

  openModal();
}

function getTagsFromChips() {
  return Array.from(document.querySelectorAll("#tagChips .tag-chip-text"))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
}

function initTagEditor(tags = []) {
  const input = document.getElementById("tagInput");

  if (!input) return;

  tags.forEach((tag) => addTagChip(tag));

  const commitInputTags = () => {
    const raw = input.value || "";
    raw.split(",").forEach((part) => addTagChip(part));
    input.value = "";
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitInputTags();
    }
  });

  input.addEventListener("blur", commitInputTags);
}

// ------------------ Table Editor Helpers ------------------
let __tableColumnCounter = 0;

function _ensureTableContainers() {
  return {
    cols: document.getElementById("tableColumns"),
    rows: document.getElementById("tableRows"),
  };
}

function addTableColumn(key = "", label = "") {
  const { cols, rows } = _ensureTableContainers();
  if (!cols || !rows) return;

  __tableColumnCounter += 1;
  const colId = `col_${Date.now()}_${__tableColumnCounter}`;

  const colDiv = document.createElement("div");
  colDiv.className = "table-column";
  colDiv.dataset.colId = colId;
  colDiv.dataset.key = key || "";

  // const keyInput = document.createElement("input");
  // keyInput.type = "text";
  // keyInput.className = "table-col-key";
  // keyInput.placeholder = "key (internal)";
  // keyInput.value = key;

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className = "table-col-label";
  labelInput.placeholder = "Label (visible)";
  labelInput.value = label;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    // remove column node
    colDiv.remove();
    // remove corresponding cell inputs from each row
    Array.from(rows.querySelectorAll('.table-row')).forEach((r) => {
      const cell = r.querySelector(`[data-col-id="${colId}"]`);
      if (cell) cell.remove();
    });
  });

  colDiv.appendChild(labelInput);
  // colDiv.appendChild(keyInput);
  colDiv.appendChild(removeBtn);

  cols.appendChild(colDiv);

  // add empty cell for existing rows
  Array.from(rows.querySelectorAll('.table-row')).forEach((r) => {
    const cellInput = document.createElement("input");
    cellInput.type = "text";
    cellInput.className = "table-cell";
    cellInput.dataset.colId = colId;
    cellInput.placeholder = label || key || "";
    r.appendChild(cellInput);
  });
}

function addTableRow(cellValues = {}) {
  const { cols, rows } = _ensureTableContainers();
  if (!cols || !rows) return;

  const rowDiv = document.createElement("div");
  rowDiv.className = "table-row";

  // create cells based on columns order
  Array.from(cols.querySelectorAll('.table-column')).forEach((col) => {
    const colId = col.dataset.colId;
    const key = col.dataset.key;
    const label = (col.querySelector('.table-col-label')?.value || '').trim();

    const cellInput = document.createElement("input");
    cellInput.type = "text";
    cellInput.className = "table-cell";
    cellInput.dataset.colId = colId;
    cellInput.placeholder = label || key || "";
    const provided = cellValues[key];
    if (provided && typeof provided === 'object') {
      cellInput.value = provided.value || "";
    } else if (provided !== undefined) {
      cellInput.value = String(provided);
    }

    rowDiv.appendChild(cellInput);
  });

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => rowDiv.remove());

  rowDiv.appendChild(removeBtn);
  rows.appendChild(rowDiv);
}

function populateTableEditor(data) {
  const { cols, rows } = _ensureTableContainers();
  if (!cols || !rows) return;

  cols.innerHTML = "";
  rows.innerHTML = "";

  const columns = Array.isArray(data.columns) ? data.columns : [];
  const tableRows = Array.isArray(data.rows) ? data.rows : [];

  // add columns
  columns.forEach((c) => {
    addTableColumn(c.key || '', c.label || '');
  });

  // add rows
  tableRows.forEach((r) => {
    // r is an object mapping key -> {value,color}
    const simple = {};
    Object.keys(r || {}).forEach((k) => {
      const v = r[k];
      if (v && typeof v === 'object') simple[k] = { value: v.value || '' };
      else simple[k] = String(v || '');
    });
    addTableRow(simple);
  });
}

function getTableEditorData() {
  const { cols, rows } = _ensureTableContainers();
  if (!cols || !rows) return null;

  const usedKeys = new Set();

  const generateKey = (label) => {
    let base = String(label || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")        // spaces → _
      .replace(/[^a-z0-9_]/g, ""); // remove special chars

    if (!base) {
      base = `col_${Math.random().toString(36).slice(2, 7)}`;
    }

    let key = base;
    let i = 1;

    while (usedKeys.has(key)) {
      key = `${base}_${i++}`;
    }

    usedKeys.add(key);
    return key;
  };

  const columns = Array.from(cols.querySelectorAll('.table-column')).map((col) => {
  const label = (col.querySelector('.table-col-label')?.value || '').trim();

  // 🔥 reuse old key if exists
  const existingKey = col.dataset.key;

  const key = existingKey || generateKey(label);

  return {
    label: label,
    key: key,
  };
});

  const rowsData = Array.from(rows.querySelectorAll('.table-row')).map((r) => {
    const obj = {};

    Array.from(r.querySelectorAll('.table-cell')).forEach((cell, idx) => {
      const col = columns[idx];
      const key = col ? col.key : `col_${idx}`;
      const value = (cell.value || '').trim();

      obj[key] = { value, color: '#ffffff' };
    });

    return obj;
  });

  return { columns, rows: rowsData };
}

// ------------------ Features Helpers ------------------
function addFeatureRow(title = "", description = "", icon = "") {
  const container = document.getElementById("featuresRows");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "result-row three";

  const iconInput = document.createElement("input");
  iconInput.type = "text";
  iconInput.className = "feature-icon";
  iconInput.placeholder = "Icon/Emoji (optional)";
  iconInput.value = icon || "";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.className = "feature-title";
  titleInput.placeholder = "Feature Title";
  titleInput.value = title || "";

  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.className = "feature-desc";
  descInput.placeholder = "Feature short description";
  descInput.value = description || "";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(iconInput);
  row.appendChild(titleInput);
  row.appendChild(descInput);
  row.appendChild(removeBtn);

  container.appendChild(row);
}

function getFeaturesFromRows() {
  const rows = document.querySelectorAll("#featuresRows .result-row");
  return Array.from(rows)
    .map((row) => ({
      icon: (row.querySelector(".feature-icon")?.value || "").trim(),
      title: (row.querySelector(".feature-title")?.value || "").trim(),
      description: (row.querySelector(".feature-desc")?.value || "").trim(),
    }))
    .filter((f) => f.title || f.description);
}

// ------------------ Metrics Helpers ------------------
function addMetricRow(icon = "", label = "") {
  const container = document.getElementById("metricsRows");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "result-row two";

  const iconInput = document.createElement("input");
  iconInput.type = "text";
  iconInput.className = "metric-icon";
  iconInput.placeholder = "Icon/Emoji (optional)";
  iconInput.value = icon || "";

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className = "metric-label";
  labelInput.placeholder = "Metric label (e.g. Conversion Rate)";
  labelInput.value = label || "";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(iconInput);
  row.appendChild(labelInput);
  row.appendChild(removeBtn);

  container.appendChild(row);
}

function getMetricsFromRows() {
  const rows = document.querySelectorAll("#metricsRows .result-row");
  return Array.from(rows)
    .map((row) => ({
      icon: (row.querySelector(".metric-icon")?.value || "").trim(),
      label: (row.querySelector(".metric-label")?.value || "").trim(),
    }))
    .filter((m) => m.label);
}




function addSnapshotRow(label = "", value = "", icon = "★") {
  const container = document.getElementById("snapshotRows");

  const row = document.createElement("div");
  row.className = "result-row three";

  row.innerHTML = `
    <input class="snap-label" placeholder="Label" value="${label}">
    <input class="snap-value" placeholder="Value" value="${value}">
    <input class="snap-icon" placeholder="Icon" value="${icon}">
    <button type="button" class="btn btn-danger btn-small">Remove</button>
  `;

  row.querySelector("button").onclick = () => row.remove();

  container.appendChild(row);
}

function addTechCard(title = "", desc = "", icon = "⚙️") {
  const container = document.getElementById("techCards");

  const row = document.createElement("div");
  row.className = "result-row three";

  row.innerHTML = `
    <input class="tech-title" placeholder="Title" value="${title}">
    <input class="tech-desc" placeholder="Description" value="${desc}">
    <input class="tech-icon" placeholder="Icon" value="${icon}">
    <button type="button" class="btn btn-danger btn-small">Remove</button>
  `;

  row.querySelector("button").onclick = () => row.remove();

  container.appendChild(row);
}

function addWhatWeBuiltImageRow(url = "") {
  const container = document.getElementById("whatWeBuiltImagesRows");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "result-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "what-built-image-url";
  input.placeholder = "Image URL";
  input.value = url || "";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(input);
  row.appendChild(removeBtn);
  container.appendChild(row);
}
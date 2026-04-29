// Form Handling & Data Collection

function addResultRow(metric = "", value = "") {
  const container = document.getElementById("resultsRows");

  if (!container) return;

  const row = document.createElement("div");
  row.className = "result-row";
  const metricInput = document.createElement("input");
  metricInput.type = "text";
  metricInput.className = "result-metric";
  metricInput.placeholder = "Metric (e.g. Conversion Rate Increase)";
  metricInput.value = metric;

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.className = "result-value";
  valueInput.placeholder = "Value (e.g. 150%)";
  valueInput.value = value;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-danger btn-small";
  removeBtn.textContent = "Remove";

  removeBtn.addEventListener("click", () => {
    row.remove();
  });

  row.appendChild(metricInput);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);

  container.appendChild(row);
}

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

function getResultsFromRows() {
  const rows = document.querySelectorAll("#resultsRows .result-row");

  return Array.from(rows)
    .map((row) => ({
      metric: (row.querySelector(".result-metric")?.value || "").trim(),
      value: (row.querySelector(".result-value")?.value || "").trim(),
    }))
    .filter((item) => item.metric || item.value);
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

  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.className = "table-col-key";
  keyInput.placeholder = "key (internal)";
  keyInput.value = key;

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
  colDiv.appendChild(keyInput);
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
    const key = (col.querySelector('.table-col-key')?.value || '').trim();
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

  const columns = Array.from(cols.querySelectorAll('.table-column')).map((col) => {
    const keyRaw = (col.querySelector('.table-col-key')?.value || '').trim();
    const label = (col.querySelector('.table-col-label')?.value || '').trim();
    const key = keyRaw || label.toLowerCase().replace(/[^a-z0-9]+/g, '_') || `col_${Math.random().toString(36).slice(2,7)}`;
    return { key, label };
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

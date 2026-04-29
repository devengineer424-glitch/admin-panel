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

// Search state and helpers for blogs and case studies.

const searchState = {
  query: "",
  items: [],
  index: null,
  extractor: null,
};

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenizeSearchText(value) {
  const normalized = normalizeSearchText(value);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter(Boolean);
}

function debounce(fn, wait = 180) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), wait);
  };
}

function addPosting(postings, term, index) {
  if (!term) return;
  if (!postings.has(term)) {
    postings.set(term, new Set());
  }
  postings.get(term).add(index);
}

function buildSearchIndex(items, extractor) {
  const normalizedItems = [];
  const postings = new Map();

  items.forEach((item, index) => {
    const text = normalizeSearchText(extractor(item));
    normalizedItems[index] = text;

    const uniqueTokens = new Set(tokenizeSearchText(text));
    uniqueTokens.forEach((token) => {
      addPosting(postings, token, index);

      const maxPrefixLength = Math.min(token.length, 6);
      for (let length = 1; length <= maxPrefixLength; length += 1) {
        addPosting(postings, token.slice(0, length), index);
      }
    });
  });

  return {
    items,
    normalizedItems,
    postings,
  };
}

function intersectSets(left, right) {
  const result = new Set();
  left.forEach((value) => {
    if (right.has(value)) {
      result.add(value);
    }
  });
  return result;
}

function setSearchCollection(items, extractor) {
  searchState.items = Array.isArray(items) ? items : [];
  searchState.extractor = extractor;
  searchState.index = buildSearchIndex(searchState.items, extractor);
}

function setSearchQuery(value) {
  searchState.query = normalizeSearchText(value);
  const searchInput = document.getElementById("searchInput");
  if (searchInput && searchInput.value !== String(value || "")) {
    searchInput.value = String(value || "");
  }
}

function clearSearchQuery() {
  searchState.query = "";
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
  }
}

function getSearchQuery() {
  return searchState.query;
}

function filterSearchCollection(query = searchState.query) {
  const items = Array.isArray(searchState.items) ? searchState.items : [];
  const index = searchState.index;

  if (!index || !query) {
    return items;
  }

  const queryTokens = tokenizeSearchText(query);
  if (queryTokens.length === 0) {
    return items;
  }

  let candidateIndexes = null;

  queryTokens.forEach((token) => {
    const matched = index.postings.get(token);
    if (!matched) {
      candidateIndexes = new Set();
      return;
    }

    candidateIndexes = candidateIndexes
      ? intersectSets(candidateIndexes, matched)
      : new Set(matched);
  });

  if (!candidateIndexes || candidateIndexes.size === 0) {
    return items.filter((item, itemIndex) => {
      const normalized = index.normalizedItems[itemIndex] || "";
      return queryTokens.every((token) => normalized.includes(token));
    });
  }

  return Array.from(candidateIndexes)
    .sort((left, right) => left - right)
    .map((itemIndex) => items[itemIndex]);
}

function rerenderCurrentSearchableView() {
  if (current === "blogs") {
    renderBlogsView(currentItems);
    return;
  }

  if (current === "case-studies") {
    renderCaseStudiesView(currentItems);
  }
}

function setupSearchHandlers() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (!searchInput || searchInput.dataset.bound === "1") {
    return;
  }

  searchInput.dataset.bound = "1";

  const runSearch = debounce((value) => {
    searchState.query = normalizeSearchText(value);
    rerenderCurrentSearchableView();
  }, 150);

  searchInput.addEventListener("input", (event) => {
    runSearch(event.target.value);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearSearchQuery();
      rerenderCurrentSearchableView();
      searchInput.focus();
    });
  }
}
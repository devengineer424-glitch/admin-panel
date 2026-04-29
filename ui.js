// UI State Management & View Handling

let current = "blogs";
let editId = null;
let currentItems = [];

function isReadOnlySection() {
  return (
    current === "newsletter-subscribers" || current === "contact-messages"
  );
}

function setActive(nav) {
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
  nav.classList.add("active");
}

function setAddVisibility() {
  document.getElementById("addBtn").style.display = isReadOnlySection()
    ? "none"
    : "inline-block";
}

function setMessagesView(show) {
  const table = document.querySelector("table");
  const messagesView = document.getElementById("messagesView");

  if (show) {
    table.style.display = "none";
    messagesView.style.display = "block";
  } else {
    messagesView.style.display = "none";
    table.style.display = "table";
  }
}

function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function openBlogInNewTab(slug) {
  const blogUrl = buildBlogShareUrl(slug);
  window.open(blogUrl, "_blank", "noopener,noreferrer");
}

function renderTable(data) {
  currentItems = Array.isArray(data) ? data : [];
  setSubscriberActionsVisibility();

  const head = document.getElementById("tableHead");
  const body = document.getElementById("tableBody");

  head.innerHTML = "";
  body.innerHTML = "";

  if (data.length === 0) return;

  const isReadOnly = isReadOnlySection();
  const columns = isReadOnly
    ? Object.keys(data[0])
    : Object.keys(data[0]).slice(0, 6);

  columns.forEach((k) => {
    head.innerHTML += `<th>${k}</th>`;
  });

  if (!isReadOnly) {
    head.innerHTML += "<th>Actions</th>";
  }

  data.forEach((row) => {
    let tr = "<tr>";

    columns.forEach((k) => {
      tr += `<td>${formatCellValue(row[k])}</td>`;
    });

    if (!isReadOnly) {
      tr += `
      <td>
      <button class="btn btn-edit" onclick="edit('${row.id}')">Edit</button>
      <button class="btn btn-danger" onclick="removeItem('${row.id}')">Delete</button>
      </td>
      `;
    }

    tr += "</tr>";

    body.innerHTML += tr;
  });
}

function renderMessagesView(data) {
  currentItems = Array.isArray(data) ? data : [];

  const container = document.getElementById("messagesView");
  container.innerHTML = "";

  if (currentItems.length === 0) {
    container.innerHTML = '<div class="empty-state">No messages yet.</div>';
    return;
  }

  const grid = document.createElement("div");
  grid.className = "messages-grid";

  currentItems.forEach((msg) => {
    const card = document.createElement("div");
    card.className = "message-card";

    const createdAt = msg.created_at
      ? new Date(msg.created_at).toLocaleString()
      : "";

    card.innerHTML = `
    <div class="message-top">
      <div>
        <div class="message-name">${escapeHtml(msg.name || "Unknown")}</div>
        <div class="message-email">${escapeHtml(msg.email || "")}</div>
      </div>
      <div class="message-date">${escapeHtml(createdAt)}</div>
    </div>
    <div class="message-subject">${escapeHtml(msg.subject || "No Subject")}</div>
    <div class="message-body">${escapeHtml(msg.message || "")}</div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

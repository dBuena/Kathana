// ------------------------------------------------------------------
// 1) Core state
// ------------------------------------------------------------------
let items = [];
let filteredItems = [];
let currentPage = 1;
let itemsPerPage = 10;          // default
const maxItemsPerPage = 100;

// ------------------------------------------------------------------
// 2) NEW: icon lookup tables (populated in fetchItems)
// ------------------------------------------------------------------
let iconMap   = {};   // ItemID   -> Tex_ID
let iconFiles = {};   // Tex_ID   -> FILENAME

// ------------------------------------------------------------------
// 3) Class mapping (unchanged)
// ------------------------------------------------------------------
const classMap = {
  3: "Naga, Kimnara",
  12: "Asura, Rakshasa",
  15: "Naga, Kimnara, Asura, Rakshasa",
  48: "Yaksa, Gandharva",
  192: "Deva, Garuda"
};

const classFilterMap = {
  "Naga": [3, 15],
  "Kimnara": [3, 15],
  "Asura": [12, 15],
  "Rakshasa": [12, 15],
  "Yaksa": [48],
  "Gandharva": [48],
  "Deva": [192],
  "Garuda": [192]
};

// ------------------------------------------------------------------
// 4) Helper – get icon URL for an ItemID
// ------------------------------------------------------------------
function getIconUrl(itemId) {
  const texId = iconMap[itemId];
  if (!texId) return null;
  return `icon/${iconFiles[texId]}`;
}

// ------------------------------------------------------------------
// 5) Class display / filtering helpers (unchanged)
// ------------------------------------------------------------------
function getClassDisplay(classLimit) {
  return classMap[classLimit] || "";
}

function filterBy(className) {
  const normalizedClass = className.charAt(0).toUpperCase() + className.slice(1).toLowerCase();
  const validClassLimits = classFilterMap[normalizedClass] || [];
  filteredItems = validClassLimits.length
    ? items.filter(item => validClassLimits.includes(item.ClassLimit))
    : items;
  currentPage = 1;
  renderTable();
  renderPagination();
}

// ------------------------------------------------------------------
// 6) Fetch all JSON files and build lookup tables
// ------------------------------------------------------------------
async function fetchItems() {
  const [itemsResp, mapResp, idResp] = await Promise.all([
    fetch('items.json'),
    fetch('IconMap.json'),
    fetch('IconID.json')
  ]);

  const rawItems   = await itemsResp.json();
  const rawIconMap = await mapResp.json();
  const rawIconId  = await idResp.json();

  // Build quick maps
  rawIconMap.forEach(m => iconMap[m.ID] = m.Tex_ID);
  rawIconId.forEach(i => iconFiles[i.TEX_ID] = i.FILENAME);

  items = rawItems;
  filteredItems = items;
  renderTable();
  renderPagination();
  renderItemsPerPageDropdown();
}

// ------------------------------------------------------------------
// 7) Render table with icons
// ------------------------------------------------------------------
function renderTable() {
  const tableBody = document.getElementById("itemTable");
  tableBody.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex   = startIndex + itemsPerPage;
  const paginated  = filteredItems.slice(startIndex, endIndex);

  paginated.forEach(item => {
    const row = document.createElement("tr");

    const classDisplay = getClassDisplay(item.ClassLimit);
    const classTooltip = classDisplay ? `Class: ${classDisplay}` : "";

    const tooltipContent = `
      <h5>${item.ItemName}</h5>
      <p>${item.Description}</p>
      ${item.iEffect1Param1 !== undefined ? `${item.iEffect1Param1}-${item.iEffect1Param2}<br>` : ""}
      ${classTooltip}
    `.trim();

    row.innerHTML = `
      <td>${item.ID}</td>
      <td>
        <img src="${getIconUrl(item.ID) || 'icon/placeholder.bmp'}"
             alt="" style="width:32px;height:32px;vertical-align:middle;margin-right:6px;">
        <span data-bs-toggle="tooltip" data-bs-html="true" title="${tooltipContent}">
          ${item.ItemName}
        </span>
      </td>
      <td>${item.Description}</td>
      <td>${item.LimitRequirement}</td>
      <td>${item.ShopPrice}</td>
      <td>${item.SellPrice}</td>
      <td>${item.TaneyPrice}</td>
      <td>${item.MaxDurability}</td>
      <td>${classDisplay}</td>
    `;
    tableBody.appendChild(row);
  });

  // Re-init tooltips
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
    .forEach(el => new bootstrap.Tooltip(el));
}

// ------------------------------------------------------------------
// 8) Pagination (unchanged)
// ------------------------------------------------------------------
function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
  if (pageCount <= 1) return;

  function createPageItem(label, disabled, onClick, active = false) {
    const li = document.createElement("li");
    li.className = "page-item" + (disabled ? " disabled" : "") + (active ? " active" : "");
    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    li.appendChild(btn);
    return li;
  }

  pagination.appendChild(createPageItem("First", currentPage === 1, () => { currentPage = 1; renderTable(); renderPagination(); }));
  pagination.appendChild(createPageItem("Previous", currentPage === 1, () => { currentPage--; renderTable(); renderPagination(); }));

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end   = Math.min(pageCount, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) pagination.appendChild(createPageItem("...", true, () => {}));
  for (let i = start; i <= end; i++) {
    pagination.appendChild(createPageItem(i, false, () => { currentPage = i; renderTable(); renderPagination(); }, i === currentPage));
  }
  if (end < pageCount) pagination.appendChild(createPageItem("...", true, () => {}));

  pagination.appendChild(createPageItem("Next", currentPage === pageCount, () => { currentPage++; renderTable(); renderPagination(); }));
  pagination.appendChild(createPageItem("Last", currentPage === pageCount, () => { currentPage = pageCount; renderTable(); renderPagination(); }));
}

// ------------------------------------------------------------------
// 9) Items-per-page dropdown (unchanged)
// ------------------------------------------------------------------
function renderItemsPerPageDropdown() {
  const container = document.getElementById("itemsPerPageContainer");
  if (!container) return;

  container.innerHTML = `
    <label for="itemsPerPageSelect" class="form-label me-2">Items per page:</label>
    <select id="itemsPerPageSelect" class="form-select form-select-sm" style="width:auto;display:inline-block;">
      <option value="10"  ${itemsPerPage === 10  ? "selected" : ""}>10</option>
      <option value="25"  ${itemsPerPage === 25  ? "selected" : ""}>25</option>
      <option value="50"  ${itemsPerPage === 50  ? "selected" : ""}>50</option>
      <option value="100" ${itemsPerPage === 100 ? "selected" : ""}>100</option>
    </select>
  `;

  document.getElementById("itemsPerPageSelect").addEventListener("change", e => {
    itemsPerPage = Math.min(parseInt(e.target.value, 10), maxItemsPerPage);
    currentPage = 1;
    renderTable();
    renderPagination();
  });
}

// ------------------------------------------------------------------
// 10) Search & suggestion dropdown (unchanged)
// ------------------------------------------------------------------
function searchSuggestions() {
  const input = document.getElementById("searchBox");
  const query = input.value.trim().toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";
  if (!query) { suggestions.style.display = "none"; return; }

  const matches = items.filter(item =>
    item.ID.toString().includes(query) ||
    item.ItemName.toLowerCase().includes(query)
  ).slice(0, 10);

  if (matches.length === 0) { suggestions.style.display = "none"; return; }

  matches.forEach(item => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.textContent = `${item.ID} - ${item.ItemName}`;
    li.onclick = () => {
      input.value = `${item.ID} - ${item.ItemName}`;
      suggestions.style.display = "none";
      filteredItems = [item];
      currentPage = 1;
      renderTable();
      renderPagination();
    };
    suggestions.appendChild(li);
  });
  suggestions.style.display = "block";
}

// ------------------------------------------------------------------
// 11) Init
// ------------------------------------------------------------------
fetchItems();
renderItemsPerPageDropdown();

document.addEventListener("click", e => {
  const suggestions = document.getElementById("suggestions");
  const input = document.getElementById("searchBox");
  if (e.target !== input && !suggestions.contains(e.target)) {
    suggestions.style.display = "none";
  }
});
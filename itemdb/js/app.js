let items = [];
let filteredItems = [];
let currentPage = 1;
let itemsPerPage = 10; // default is 10
const maxItemsPerPage = 100;

// Map ClassLimit values to class names
const classMap = {
  3: "Naga, Kimnara",
  12: "Asura, Rakshasa",
  15: "Naga, Kimnara, Asura, Rakshasa",
  48: "Yaksa, Gandharva",
  192: "Deva, Garuda"
  // 0: '' (don't display)
};

// Reverse map: class name → list of ClassLimit values
const classFilterMap = {
  "Naga": [3, 15],
  "Kimnara": [3, 15],
  "Asura": [12, 15],
  "Rakshasa": [12, 15],  // Note: typo fix — you had "Raksasha"
  "Yaksa": [48],
  "Gandharva": [48],
  "Deva": [192],
  "Garuda": [192]
};

function filterBy(className) {
  // Convert to Title Case to match keys
  const normalizedClass = className.charAt(0).toUpperCase() + className.slice(1).toLowerCase();

  // Get allowed ClassLimit values for this class
  const validClassLimits = classFilterMap[normalizedClass] || [];

  if (validClassLimits.length === 0) {
    // If no class match, show all
    filteredItems = items;
  } else {
    // Filter items where ClassLimit matches any of the required values
    filteredItems = items.filter(item => validClassLimits.includes(item.ClassLimit));
  }

  // Reset to first page after filter
  currentPage = 1;

  // Re-render table and pagination
  renderTable();
  renderPagination();
}

// Helper function to get class name from ClassLimit
function getClassDisplay(classLimit) {
  return classMap[classLimit] || ""; // Return mapped string or empty if not found
}

async function fetchItems() {
  const response = await fetch('items.json');
  items = await response.json();
  filteredItems = items; // ✅ assign here so it's not empty
  renderTable();
  renderPagination();
  renderItemsPerPageDropdown();
}

function renderTable() {
  const tableBody = document.getElementById("itemTable");
  tableBody.innerHTML = "";

  let startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage;
  let paginatedItems = filteredItems.slice(startIndex, endIndex);

  paginatedItems.forEach(item => {
    const row = document.createElement("tr");

    // Get class display text
    const classDisplay = getClassDisplay(item.ClassLimit);

    // For tooltip: only show "Class: xxx" if classDisplay exists
    const classTooltip = classDisplay ? `Class: ${classDisplay}` : '';

    // Build tooltip content
    const tooltipContent = `
      <h5>${item.ItemName}</h5>
      <p>${item.Description}</p>
      ${item.iEffect1Param1 !== undefined ? `${item.iEffect1Param1}-${item.iEffect1Param2}<br>` : ''}
      ${classTooltip}
    `.trim();

    row.innerHTML = `
      <td>${item.ID}</td>
      <td>
        <span 
          data-bs-toggle="tooltip" 
          data-bs-html="true" 
          title="${tooltipContent}">
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

  // Re-initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
  if (pageCount <= 1) return;

  function createPageItem(label, disabled, onClick, isActive = false) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (disabled) li.classList.add("disabled");
    if (isActive) li.classList.add("active");

    const btn = document.createElement("button");
    btn.classList.add("page-link");
    btn.textContent = label;
    btn.addEventListener("click", onClick);

    li.appendChild(btn);
    return li;
  }

  // First + Previous
  pagination.appendChild(
    createPageItem("First", currentPage === 1, () => {
      currentPage = 1;
      renderTable();
      renderPagination();
    })
  );
  pagination.appendChild(
    createPageItem("Previous", currentPage === 1, () => {
      currentPage--;
      renderTable();
      renderPagination();
    })
  );

  // Page numbers with window
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(pageCount, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    pagination.appendChild(
      createPageItem("...", true, () => {})
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    pagination.appendChild(
      createPageItem(i, false, () => {
        currentPage = i;
        renderTable();
        renderPagination();
      }, i === currentPage)
    );
  }

  if (endPage < pageCount) {
    pagination.appendChild(
      createPageItem("...", true, () => {})
    );
  }

  // Next + Last
  pagination.appendChild(
    createPageItem("Next", currentPage === pageCount, () => {
      currentPage++;
      renderTable();
      renderPagination();
    })
  );
  pagination.appendChild(
    createPageItem("Last", currentPage === pageCount, () => {
      currentPage = pageCount;
      renderTable();
      renderPagination();
    })
  );
}

function renderItemsPerPageDropdown() {
  const container = document.getElementById("itemsPerPageContainer");
  if (!container) return;

  container.innerHTML = `
    <label for="itemsPerPageSelect" class="form-label me-2">Items per page:</label>
    <select id="itemsPerPageSelect" class="form-select form-select-sm" style="width:auto; display:inline-block;">
      <option value="10" ${itemsPerPage === 10 ? "selected" : ""}>10</option>
      <option value="25" ${itemsPerPage === 25 ? "selected" : ""}>25</option>
      <option value="50" ${itemsPerPage === 50 ? "selected" : ""}>50</option>
      <option value="100" ${itemsPerPage === 100 ? "selected" : ""}>100</option>
    </select>
  `;

  document.getElementById("itemsPerPageSelect").addEventListener("change", (e) => {
    itemsPerPage = Math.min(parseInt(e.target.value, 10), maxItemsPerPage);
    currentPage = 1;
    renderTable();
    renderPagination();
  });
}

function searchSuggestions() {
  const input = document.getElementById("searchBox");
  const query = input.value.trim().toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  // Hide suggestions if query is empty
  if (!query) {
    suggestions.style.display = "none";
    return;
  }

  // Filter items by ID or ItemName
  const matches = items.filter(item =>
    item.ID.toString().includes(query) ||
    item.ItemName.toLowerCase().includes(query)
  ).slice(0, 10); // Limit to 10 suggestions

  // Show or hide suggestions
  if (matches.length === 0) {
    suggestions.style.display = "none";
    return;
  }

  // Populate suggestions
  matches.forEach(item => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.textContent = `${item.ID} - ${item.ItemName}`;
    li.onclick = () => {
      input.value = `${item.ID} - ${item.ItemName}`;
      suggestions.innerHTML = "";
      suggestions.style.display = "none";

      // Optional: Filter table to show only this item
      filteredItems = [item];
      currentPage = 1;
      renderTable();
      renderPagination();
    };
    suggestions.appendChild(li);
  });

  // Show the dropdown
  suggestions.style.display = "block";
}

// Initialize
fetchItems();
renderItemsPerPageDropdown(); // <-- add this line

// Hide suggestions when clicking outside
document.addEventListener("click", function (e) {
  const suggestions = document.getElementById("suggestions");
  const input = document.getElementById("searchBox");
  if (e.target !== input && !suggestions.contains(e.target)) {
    suggestions.style.display = "none";
  }
});
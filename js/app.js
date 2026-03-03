/**
 * KathanaDB - Table-Based Search Interface
 * questlog.gg-inspired layout with filters and pagination
 */

const mainSearchInput = document.getElementById('mainSearchInput');
const navSearchInput = document.getElementById('navSearchInput');
const searchClear = document.getElementById('searchClear');
const resultCount = document.getElementById('resultCount');
const filtersSection = document.getElementById('filtersSection');
const filterButtons = document.querySelectorAll('.filter-btn');
const resultsTableSection = document.getElementById('resultsTableSection');
const resultsTableBody = document.getElementById('resultsTableBody');
const noResults = document.getElementById('noResults');
const detailModal = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const paginationFloating = document.getElementById('paginationFloating');
const paginationNumbers = document.getElementById('paginationNumbers');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const firstBtn = document.getElementById('firstBtn');
const lastBtn = document.getElementById('lastBtn');

// State
let allResults = [];
let filteredResults = [];
let currentFilter = 'all';
let currentPage = 1;
const resultsPerPage = 10;
let currentLanguage = 'phil';
let itemToTypeMap = {}; // Maps item ID to correct sType from ItemMapping.json
let iconMap = {};       // Item ID → Tex_ID
let iconIdMap = {};     // Tex_ID → Filename
let lootGroups = {};    // Maps group ID to array of item IDs

/**
 * Load ItemMapping.json to get correct sType mappings
 */
async function loadItemMapping() {
  try {
    // Add cache-busting parameter to ensure fresh data is loaded
    const response = await fetch('ItemMapping.json?t=' + Date.now());
    const data = await response.json();
    // Extract the itemToType object from the JSON file
    itemToTypeMap = data.itemToType || data || {};
    console.log('✅ Loaded ItemMapping.json with', Object.keys(itemToTypeMap).length, 'items');
  } catch (error) {
    console.error('Failed to load ItemMapping.json:', error);
  }
}

/**
 * Load icon mappings (Item ID → Tex_ID → Filename)
 */
async function loadIconData() {
  try {
    console.log('📦 Starting to load icon mappings...');

    // Load IconMap.json (Item ID → Tex_ID)
    console.log('📥 Fetching IconMap.json...');
    const iconMapResponse = await fetch('IconMap.json');
    const iconMapData = await iconMapResponse.json();
    iconMapData.forEach(item => {
      iconMap[item.ID] = item.Tex_ID;
    });
    console.log('✅ Loaded IconMap.json with', Object.keys(iconMap).length, 'items');

    // Load IconID.json (Tex_ID → Filename)
    console.log('📥 Fetching IconID.json...');
    const iconIdResponse = await fetch('IconID.json');
    const iconIdData = await iconIdResponse.json();
    iconIdData.forEach(icon => {
      iconIdMap[icon.TEX_ID] = icon.FILENAME;
    });
    console.log('✅ Loaded IconID.json with', Object.keys(iconIdMap).length, 'entries');

    console.log('✅ Loaded icon mappings');
  } catch (error) {
    console.warn('⚠️ Failed to load icon data:', error.message);
  }
}

/**
 * Load loot groups (HTS_ITEMGRP.json)
 */
async function loadLootGroups() {
  try {
    console.log('📥 Loading loot groups...');
    const response = await fetch('HTS_ITEMGRP.json');
    const data = await response.json();

    // Build a map of group ID to items
    if (data.loot_groups) {
      const groupMap = {};
      Object.values(data.loot_groups).forEach(entry => {
        const groupId = entry.iGroup;
        if (!groupMap[groupId]) {
          groupMap[groupId] = [];
        }
        if (entry.items && entry.items.length > 0) {
          groupMap[groupId].push(...entry.items);
        }
      });
      lootGroups = groupMap;
      console.log('✅ Loaded loot groups with', Object.keys(groupMap).length, 'groups');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load loot groups:', error.message);
  }
}

/**
 * Get icon filename for an item
 */
function getItemIcon(itemId) {
  const texId = iconMap[itemId];
  if (texId && iconIdMap[texId]) {
    return iconIdMap[texId];
  }
  return null;
}

/**
 * Get correct sType for an item from ItemMapping.json
 */
function getCorrectItemType(item) {
  if (itemToTypeMap && item.id) {
    // Convert item ID to string since ItemMapping.json keys are strings
    const itemIdStr = String(item.id);
    if (itemIdStr in itemToTypeMap) {
      return itemToTypeMap[itemIdStr];
    }
  }
  // Fallback to the sType from TantraParam.xml if mapping not found
  return item.type || 0;
}

/**
 * Initialize application
 */
async function initApp() {
  console.log('🚀 initApp started');
  // Load item type mappings first
  await loadItemMapping();
  console.log('🚀 About to load icon data...');
  // Load icon data
  await loadIconData();
  console.log('🚀 Loading loot groups...');
  // Load loot groups
  await loadLootGroups();
  console.log('🚀 Setting up event listeners...');
  // Now setup event listeners
  setupEventListeners();
  // Update menu with correct item counts
  updateMenuWithCounts();
  console.log('✅ initApp completed');
}

function setupEventListeners() {
  mainSearchInput.addEventListener('input', handleSearch);
  navSearchInput.addEventListener('input', (e) => {
    mainSearchInput.value = e.target.value;
    handleSearch();
  });

  searchClear.addEventListener('click', clearSearch);

  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.type;
      currentPage = 1;
      applyFilter();
    });
  });

  // Database dropdown menu - Main toggle
  const mainDropdownToggle = document.querySelector('.nav-dropdown > .nav-dropdown-toggle');
  const mainDropdownMenu = document.querySelector('.nav-dropdown > .nav-dropdown-menu');

  if (mainDropdownToggle && mainDropdownMenu) {
    mainDropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      mainDropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        mainDropdownMenu.classList.remove('show');
      }
    });
  }

  // Nested dropdown click handling - click to toggle submenu
  const nestedDropdowns = document.querySelectorAll('.nav-nested-dropdown');
  nestedDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector(':scope > .nav-dropdown-toggle');
    const submenu = dropdown.querySelector(':scope > .nav-dropdown-menu');

    if (toggle && submenu) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();

        // Close other open submenus at the same level
        const parentMenu = toggle.closest('.nav-dropdown-menu');
        if (parentMenu) {
          const siblings = parentMenu.querySelectorAll('.nav-nested-dropdown');
          siblings.forEach(sibling => {
            if (sibling !== dropdown) {
              const siblingMenu = sibling.querySelector(':scope > .nav-dropdown-menu');
              if (siblingMenu) {
                siblingMenu.classList.remove('show');
              }
            }
          });
        }

        // Toggle this submenu
        submenu.classList.toggle('show');
      });
    }
  });

  // Item Database type links
  const itemTypeLinks = document.querySelectorAll('.item-type-link');
  itemTypeLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const itemType = e.target.dataset.type;
      mainDropdownMenu.classList.remove('show');
      loadItemsByType(itemType);
    });
  });

  // Monster Database direct link
  // Use more specific selector to target only direct children of the main nav-dropdown-menu (not nested ones)
  const mosterDbLink = document.querySelector('.nav-dropdown > .nav-dropdown-menu > a:last-child');
  if (mosterDbLink) {
    mosterDbLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainDropdownMenu.classList.remove('show');
      loadMonsterDatabase();
    });
  }

  prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
  firstBtn.addEventListener('click', () => goToPage(1));
  lastBtn.addEventListener('click', () => goToPage(getTotalPages()));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      mainSearchInput.focus();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  mainSearchInput.focus();
}

/**
 * Count items by type and update menu display
 */
function updateMenuWithCounts() {
  // Count items for each type using CORRECT sType from ItemMapping.json
  const typeCounts = {};
  dataParser.items.forEach(item => {
    const correctType = getCorrectItemType(item);
    const typeStr = String(correctType);
    typeCounts[typeStr] = (typeCounts[typeStr] || 0) + 1;
  });

  // Remove count display from menu links (keep clean display)
  const itemTypeLinks = document.querySelectorAll('.item-type-link');
  itemTypeLinks.forEach(link => {
    // Get current text without count
    let displayText = link.textContent.split('(')[0].trim();
    link.textContent = displayText;
  });
}

/**
 * Handle search input
 */
function handleSearch(e) {
  const query = mainSearchInput.value;
  navSearchInput.value = query;

  if (query.length < 3) {
    clearResults();
    return;
  }

  performSearch(query);
}

/**
 * Clear search input
 */
function clearSearch() {
  mainSearchInput.value = '';
  navSearchInput.value = '';
  searchClear.style.display = 'none';
  clearResults();
  mainSearchInput.focus();
}

/**
 * Perform search
 */
function performSearch(query) {
  const results = dataParser.search(query);

  // Combine all results
  allResults = [
    ...results.items.map(item => ({ ...item, type: 'Item' })),
    ...results.monsters.map(m => ({ ...m, type: 'Monster' })),
    ...results.npcs.map(npc => ({ ...npc, type: 'NPC' }))
  ];

  if (allResults.length === 0) {
    noResults.style.display = 'block';
    filtersSection.style.display = 'none';
    resultsTableSection.style.display = 'none';
    resultCount.textContent = 'No results found.';
    searchClear.style.display = 'block';
    return;
  }

  resultCount.textContent = `Found ${allResults.length} results.`;
  searchClear.style.display = 'block';
  noResults.style.display = 'none';
  filtersSection.style.display = 'block';
  resultsTableSection.style.display = 'block';

  // Reset to first page and apply filter
  currentPage = 1;
  currentFilter = 'all';
  filterButtons.forEach(btn => btn.classList.remove('active'));
  filterButtons[0].classList.add('active');
  applyFilter();
}

/**
 * Apply current filter
 */
function applyFilter() {
  if (currentFilter === 'all') {
    filteredResults = [...allResults];
  } else {
    filteredResults = allResults.filter(item =>
      item.type.toLowerCase() === currentFilter.toLowerCase()
    );
  }

  renderTable();
  renderPagination();
}

/**
 * Render results table
 */
function renderTable() {
  resultsTableBody.innerHTML = '';

  const startIdx = (currentPage - 1) * resultsPerPage;
  const endIdx = startIdx + resultsPerPage;
  const pageResults = filteredResults.slice(startIdx, endIdx);

  // Check data type for optimal table layout
  const showingOnlyMonsters = filteredResults.every(item => item.type === 'Monster');
  const showingOnlyItems = filteredResults.every(item => item.type === 'Item');

  // Check if we should show Attack/Defense columns (when Item filter is active OR items from nested menus)
  const showAttackDefense = showingOnlyItems && (currentFilter === 'item' || currentFilter === 'all');

  pageResults.forEach(item => {
    const row = document.createElement('tr');
    const name = getLocalizedName(item);
    const id = item.id || item.sID || '?';

    if (showingOnlyMonsters && item.type === 'Monster') {
      // Monster-specific columns: ID, Name, Level, HP, Attack, Prana, Rupiah
      const level = item.byteLevel || item.level || '—';
      const hp = item.nHp || '—';
      const attack = item.iAttackRate || '—';
      const prana = item.nRewardPrana || '—';
      const rupiah = item.nRewardGold || '—';

      row.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(name)}</td>
        <td>${level}</td>
        <td>${hp}</td>
        <td>${attack}</td>
        <td style="color: #3fb950;">${prana}</td>
        <td style="color: #d29922;">${rupiah}</td>
      `;
    } else if (showingOnlyItems && item.type === 'Item') {
      // Item-specific columns: ID, Name, Level, Type, Buy Price, Sell Price
      const level = item.byteLimitLevel > 0 ? item.byteLimitLevel : '—';

      // Format buy price with special handling for priceless items
      let buyPrice = item.buy_price || '—';
      if (item.buy_price === 0) {
        buyPrice = 'Priceless';
      }

      // Format sell price with special handling for non-sellable items
      let sellPrice = item.sell_price || '—';
      if (item.sell_price === -1) {
        sellPrice = 'Cannot be sold';
      }

      // Get correct item type for attack/defense display
      const correctItemType = getCorrectItemType(item);
      const isWeapon = [1, 2, 4, 8, 16, 32, 64, 128].includes(correctItemType);
      const isArmor = [10, 11, 12, 13, 14, 15, 17, 256, 257, 258, 259, 260, 261].includes(correctItemType);

      const param1 = item.iEffect1Param1 || 0;
      const param2 = item.iEffect1Param2 || 0;

      let attackDefenseCell = '';
      if (showAttackDefense) {
        if (isWeapon && (param1 > 0 || param2 > 0)) {
          attackDefenseCell = `<td style="color: #ff6b6b;">${param1}-${param2}</td>`;
        } else if (isArmor && (param1 > 0 || param2 > 0)) {
          const defense = Math.max(param1, param2);
          attackDefenseCell = `<td style="color: #3fb950;">${defense}</td>`;
        } else {
          attackDefenseCell = `<td>—</td>`;
        }
      }

      if (showAttackDefense) {
        row.innerHTML = `
          <td>${id}</td>
          <td>${escapeHtml(name)}</td>
          <td>${level}</td>
          <td>${getItemTypeName(item.itemType)}</td>
          ${attackDefenseCell}
          <td style="color: #3fb950;">${buyPrice}</td>
          <td style="color: #d29922;">${sellPrice}</td>
        `;
      } else {
        row.innerHTML = `
          <td>${id}</td>
          <td>${escapeHtml(name)}</td>
          <td>${level}</td>
          <td>${getItemTypeName(item.itemType)}</td>
          <td style="color: #3fb950;">${buyPrice}</td>
          <td style="color: #d29922;">${sellPrice}</td>
        `;
      }
    } else {
      // Generic columns: Name, Level, Type, ID
      const level = item.byteLimitLevel > 0 ? item.byteLimitLevel : (item.nLevel || item.byteLevel || '—');
      const type = item.type;

      row.innerHTML = `
        <td>${escapeHtml(name)}</td>
        <td>${level}</td>
        <td>${type}</td>
        <td>${id}</td>
      `;
    }

    row.addEventListener('click', async () => await showDetailModal(item));
    resultsTableBody.appendChild(row);
  });

  // Update table headers
  const isMonsterTable = showingOnlyMonsters && filteredResults.length > 0 && filteredResults[0].type === 'Monster';
  const isItemTable = showingOnlyItems && filteredResults.length > 0 && filteredResults[0].type === 'Item';
  updateTableHeaders(isMonsterTable, isItemTable, showAttackDefense);
}

/**
 * Update table headers based on data type
 */
function updateTableHeaders(isMonsterTable, isItemTable, showAttackDefense = false) {
  const tableHead = document.querySelector('.results-table thead tr');
  if (!tableHead) return;

  if (isMonsterTable) {
    tableHead.innerHTML = `
      <th>ID</th>
      <th>Name</th>
      <th>Level</th>
      <th>HP</th>
      <th>Attack</th>
      <th>Prana</th>
      <th>Rupiah</th>
    `;
  } else if (isItemTable) {
    if (showAttackDefense) {
      tableHead.innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Level</th>
        <th>Type</th>
        <th>Attack/Defense</th>
        <th>Buy Price</th>
        <th>Sell Price</th>
      `;
    } else {
      tableHead.innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Level</th>
        <th>Type</th>
        <th>Buy Price</th>
        <th>Sell Price</th>
      `;
    }
  } else {
    tableHead.innerHTML = `
      <th>Name</th>
      <th>Level</th>
      <th>Type</th>
      <th>ID</th>
    `;
  }
}

/**
 * Render pagination
 */
function renderPagination() {
  const totalPages = getTotalPages();

  // Update button states
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  firstBtn.disabled = currentPage === 1;
  lastBtn.disabled = currentPage === totalPages;

  // Render page numbers
  paginationNumbers.innerHTML = '';

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-number' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => goToPage(i));
    paginationNumbers.appendChild(btn);
  }
}

/**
 * Go to page
 */
function goToPage(page) {
  const totalPages = getTotalPages();
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderTable();
    renderPagination();
    // Scroll table into view
    document.querySelector('.table-wrapper').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Get total pages
 */
function getTotalPages() {
  return Math.ceil(filteredResults.length / resultsPerPage);
}

/**
 * Clear results
 */
function clearResults() {
  allResults = [];
  filteredResults = [];
  currentPage = 1;
  resultsTableBody.innerHTML = '';
  filtersSection.style.display = 'none';
  resultsTableSection.style.display = 'none';
  noResults.style.display = 'none';
  resultCount.textContent = 'Enter at least 3 characters to search.';
  searchClear.style.display = 'none';
}

/**
 * Get localized name
 */
function getLocalizedName(item) {
  const nameField = `${currentLanguage}_name`;

  if (item.type === 'Item') {
    return item[nameField] || item.phil_name || item.name || 'Unknown';
  }

  // For Monster and NPC, use localized name if available
  return item[nameField] || item.phil_name || item.name || item.sName || 'Unknown';
}

/**
 * Show detail modal
 */
async function showDetailModal(data) {
  modalBody.innerHTML = '';

  let html = '';

  if (data.type === 'Item') {
    html = await createItemDetailView(data);
  } else if (data.type === 'Monster') {
    html = createMonsterDetailView(data);
  } else if (data.type === 'NPC') {
    html = createNPCDetailView(data);
  }

  modalBody.innerHTML = html;
  detailModal.style.display = 'flex';

  // Initialize tooltips for item drops
  initializeItemTooltips();
}

/**
 * Initialize tooltips for all item drop links in the modal
 */
function initializeItemTooltips() {
  const itemLinks = document.querySelectorAll('.item-drop-link');
  itemLinks.forEach(link => {
    const itemId = parseInt(link.getAttribute('data-item-id'));
    if (typeof initializeItemTooltip === 'function') {
      initializeItemTooltip(link, itemId);
    }
  });
}

/**
 * Create item detail view
 */
async function createItemDetailView(item) {
  const name = getLocalizedName(item);
  const desc = item[`${currentLanguage}_desc`] || item.phil_desc || item.desc || '';

  // Load icon data if not already loaded
  if (Object.keys(iconMap).length === 0) {
    try {
      const iconMapResponse = await fetch('IconMap.json');
      const iconMapData = await iconMapResponse.json();
      iconMapData.forEach(i => {
        iconMap[i.ID] = i.Tex_ID;
      });

      const iconIdResponse = await fetch('IconID.json');
      const iconIdData = await iconIdResponse.json();
      iconIdData.forEach(icon => {
        iconIdMap[icon.TEX_ID] = icon.FILENAME;
      });
    } catch (error) {
      console.warn('Failed to load icons:', error.message);
    }
  }

  // Get icon for this item
  const texId = iconMap[item.id];
  const iconFile = texId && iconIdMap[texId] ? iconIdMap[texId] : null;

  let iconHtml = '';
  if (iconFile) {
    iconHtml = `<img src="icon/${iconFile}" alt="${escapeHtml(name)}" style="width: 48px; height: 48px; border-radius: 4px; object-fit: contain;">`;
  }

  let html = `<h2 style="margin: 0;">${escapeHtml(name)} <span style="font-size: 16px; color: #888;">#${item.id}</span></h2>`;

  // BASIC INFO Section
  html += `
    <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333; position: relative;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600;">Basic Info</div>
        ${iconHtml}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="detail-label">Type</div>
          <div class="detail-value">${getItemTypeName(getCorrectItemType(item))}</div>
        </div>
        <div>
          <div class="detail-label">Level Req</div>
          <div class="detail-value">${item.byteLimitLevel > 0 ? item.byteLimitLevel : '—'}</div>
        </div>
        <div>
          <div class="detail-label">Stack Count</div>
          <div class="detail-value">${item.stack_count || 1}</div>
        </div>
        <div>
          <div class="detail-label">Durability</div>
          <div class="detail-value">${item.durability > 0 ? item.durability : '—'}</div>
        </div>
      </div>
    </div>
  `;

  // PRICING Info Section
  if (item.buy_price !== undefined || item.sell_price !== undefined || item.cash_price) {
    // Format buy price with special handling
    let buyPriceDisplay = '';
    if (item.buy_price !== undefined && item.buy_price !== null) {
      if (item.buy_price === 0) {
        buyPriceDisplay = 'Priceless';
      } else {
        buyPriceDisplay = item.buy_price.toLocaleString();
      }
    }

    // Format sell price with special handling
    let sellPriceDisplay = '';
    if (item.sell_price !== undefined && item.sell_price !== null) {
      if (item.sell_price === -1) {
        sellPriceDisplay = 'Cannot be sold';
      } else {
        sellPriceDisplay = item.sell_price.toLocaleString();
      }
    }

    html += `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Pricing</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
          ${buyPriceDisplay ? `
            <div>
              <div class="detail-label">Buy Price</div>
              <div class="detail-value" style="color: #3fb950;">${buyPriceDisplay}</div>
            </div>
          ` : ''}
          ${sellPriceDisplay ? `
            <div>
              <div class="detail-label">Sell Price</div>
              <div class="detail-value" style="color: #d29922;">${sellPriceDisplay}</div>
            </div>
          ` : ''}
          ${item.cash_price ? `
            <div>
              <div class="detail-label">Cash Price</div>
              <div class="detail-value" style="color: #58a6ff;">${item.cash_price.toLocaleString()}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // EFFECTS Section (if any effects exist)
  let hasEffects = false;
  let effectsHtml = '';
  for (let i = 1; i <= 5; i++) {
    const effectKey = `effect${i}`;
    if (item[effectKey] && item[effectKey] > 0) {
      hasEffects = true;
      effectsHtml += `<div style="padding: 4px 0;">• Effect ${i}: ${item[effectKey]}</div>`;
    }
  }

  if (hasEffects) {
    html += `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Effects</div>
        <div style="font-size: 13px; line-height: 1.6;">
          ${effectsHtml}
        </div>
      </div>
    `;
  }

  // Multi-language Names
  html += `
    <div class="detail-multilang">
      <span class="detail-multilang-label">Multi-Language Names</span>
      <div class="detail-multilang-names">
        🇵🇭 ${item.phil_name || '—'} • 🇰🇷 ${item.kor_name || '—'} • 🇨🇳 ${item.chi_name || '—'}<br>
        🇮🇩 ${item.indo_name || '—'} • 🇯🇵 ${item.jp_name || '—'} • 🇹🇼 ${item.taiwan_name || '—'} • 🇲🇽 ${item.mexico_name || '—'}
      </div>
    </div>
  `;

  // Description
  if (desc) {
    html += `
      <div class="detail-description">
        <span class="detail-description-label">Description</span>
        <div class="detail-description-text">${escapeHtml(desc)}</div>
      </div>
    `;
  }

  return html;
}

/**
 * Format a single drop item with name, icon, and drop rate
 */
function formatDropItem(itemId, dropRate) {
  // Find item using dataParser (has access to all items from XML)
  let item = null;
  if (typeof dataParser !== 'undefined' && dataParser.getItemById) {
    item = dataParser.getItemById(itemId);
  }

  // Fallback to allResults if dataParser doesn't have it
  if (!item) {
    item = allResults.find(i => i.type === 'Item' && i.id === itemId);
  }

  if (!item) {
    return `<tr style="border-bottom: 1px solid #333;">
      <td style="padding: 8px; color: #999;">Item #${itemId} (not found)</td>
      <td style="padding: 8px; text-align: right; color: #999;">—</td>
    </tr>`;
  }

  const itemName = getLocalizedName(item);

  // Get icon
  const texId = iconMap[itemId];
  const iconFile = texId && iconIdMap[texId] ? iconIdMap[texId] : null;
  const iconHtml = iconFile ? `<img src="icon/${iconFile}" alt="${escapeHtml(itemName)}" style="width: 24px; height: 24px; border-radius: 3px; object-fit: contain; vertical-align: middle; margin-right: 8px;">` : '';

  // Convert drop rate (divide by 100 to get percentage)
  let dropRatePercent = (parseInt(dropRate) / 100).toFixed(1) + '%';

  // Display very low drop rates as "<0.1%" instead of "0.0%"
  if (dropRatePercent === '0.0%') {
    dropRatePercent = '<0.1%';
  }

  return `<tr style="border-bottom: 1px solid #333;">
    <td style="padding: 8px; display: flex; align-items: center;">
      ${iconHtml}<span class="item-drop-link" data-item-id="${itemId}" style="color: #58a6ff; font-weight: 600; cursor: pointer; transition: color 0.2s;">${escapeHtml(itemName)}</span>
    </td>
    <td style="padding: 8px; text-align: right;">${dropRatePercent}</td>
  </tr>`;
}

/**
 * Create monster detail view
 */
function createMonsterDetailView(monster) {
  const name = getLocalizedName(monster);

  let html = `<h2>${escapeHtml(name)} <span style="font-size: 16px; color: #888;">#${monster.id}</span></h2>`;

  // Helper function to get aggression condition text
  function getAggressionText(condition) {
    if (condition === 0) return 'Passive';
    if (condition === 100) return 'Aggressive';
    return condition + '%';
  }

  // BASIC INFO Section
  html += `
    <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
      <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Basic Info</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
        <div>
          <div class="detail-label">ID</div>
          <div class="detail-value" style="color: #58a6ff;">${monster.id || monster.sID || '—'}</div>
        </div>
        <div>
          <div class="detail-label">Level</div>
          <div class="detail-value">${monster.byteLevel || monster.level || '—'}</div>
        </div>
        <div>
          <div class="detail-label">Aggression</div>
          <div class="detail-value">${getAggressionText(monster.byteAggrCond || 0)}</div>
        </div>
      </div>
    </div>
  `;

  // SPAWN INFO Section
  if (monster.nPopDelayMin !== undefined || monster.nPopDelayMax !== undefined) {
    html += `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Spawn Info</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <div class="detail-label">Min Spawn Delay</div>
            <div class="detail-value">${monster.nPopDelayMin || '—'} sec</div>
          </div>
          <div>
            <div class="detail-label">Max Spawn Delay</div>
            <div class="detail-value">${monster.nPopDelayMax || '—'} sec</div>
          </div>
        </div>
      </div>
    `;
  }

  // HP SECTION
  html += `
    <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
      <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Health</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="detail-label">HP</div>
          <div class="detail-value" style="color: #3fb950;">${monster.nHp ? monster.nHp.toLocaleString() : '—'}</div>
        </div>
        <div>
          <div class="detail-label">HP Recovery</div>
          <div class="detail-value">${monster.byteHPRecovery || '—'}</div>
        </div>
      </div>
    </div>
  `;

  // COMBAT STATS Section (Two-column layout)
  html += `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Left Column: Attack/Defense -->
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Offense</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="detail-item">
            <div class="detail-label">Attack Rate</div>
            <div class="detail-value">${monster.iAttackRate || '—'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Accuracy (AC)</div>
            <div class="detail-value">${monster.iAC || '—'}</div>
          </div>
        </div>
      </div>

      <!-- Right Column: Defense/Dodge -->
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Defense</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="detail-item">
            <div class="detail-label">Dodge Rate</div>
            <div class="detail-value">${monster.iDodgeRate || '—'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Armor Type</div>
            <div class="detail-value">${monster.byteArmorType || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // MOVEMENT Section
  html += `
    <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
      <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Movement</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="detail-label">Walk Speed</div>
          <div class="detail-value">${monster.iWalkSpeed || '—'}</div>
        </div>
        <div>
          <div class="detail-label">Run Speed</div>
          <div class="detail-value">${monster.iRunSpeed || '—'}</div>
        </div>
      </div>
    </div>
  `;

  // RESISTANCES Section
  html += `
    <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
      <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Resistances</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
        <div>
          <div class="detail-label">Fire</div>
          <div class="detail-value">${monster.iFireResist || '—'}</div>
        </div>
        <div>
          <div class="detail-label">Cold</div>
          <div class="detail-value">${monster.iColdResist || '—'}</div>
        </div>
        <div>
          <div class="detail-label">Lightning</div>
          <div class="detail-value">${monster.iLightningResist || '—'}</div>
        </div>
        <div>
          <div class="detail-label">Poison</div>
          <div class="detail-value">${monster.iPoisonResist || '—'}</div>
        </div>
      </div>
    </div>
  `;

  // REWARDS Section
  html += `
    <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
      <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Rewards</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="detail-label">Gold</div>
          <div style="font-size: 16px; color: #d29922; font-weight: 600;">${monster.nRewardGold ? monster.nRewardGold.toLocaleString() : '—'}</div>
        </div>
        <div>
          <div class="detail-label">Experience (Prana)</div>
          <div style="font-size: 16px; color: #3fb950; font-weight: 600;">${monster.nRewardPrana ? monster.nRewardPrana.toLocaleString() : '—'}</div>
        </div>
      </div>
    </div>
  `;

  // SKILLS Section
  if (monster.skills && monster.skills.length > 0) {
    html += `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Skills</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${monster.skills.map(skillId => `<span style="background: #58a6ff; color: #0d1117; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Skill #${skillId}</span>`).join('')}
        </div>
      </div>
    `;
  }

  // ITEM DROPS Section
  if (monster.itemDrops && monster.itemDrops.length > 0) {
    html += `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Item Drops</div>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #333;">
              <th style="padding: 8px; text-align: left; color: #888;">Item Name (ID)</th>
              <th style="padding: 8px; text-align: right; color: #888;">Drop Rate</th>
            </tr>
          </thead>
          <tbody>
            ${monster.itemDrops.filter(drop => drop.itemId !== 7101).map(drop => formatDropItem(drop.itemId, drop.dropRate)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // LOOT GRADES Section
  if (monster.byteItem8Grade || monster.byteItem9Grade) {
    const grades = [];
    if (monster.byteItem8Grade) {
      grades.push({ grade: 8, groupId: monster.byteItem8Grade, dropRate: monster.sItem8DropRate, color: '#79c0ff' });
    }
    if (monster.byteItem9Grade) {
      grades.push({ grade: 9, groupId: monster.byteItem9Grade, dropRate: monster.sItem9DropRate, color: '#ff79c0' });
    }

    html += `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">Loot Grades</div>
    `;

    grades.forEach(({ grade, groupId, dropRate, color }) => {
      const groupItems = lootGroups[groupId] || [];
      const groupDropRatePercent = (parseInt(dropRate) / 100).toFixed(1) + '%';

      // Calculate individual item drop rate: divide group rate by number of items
      const itemCount = groupItems.length;
      const itemDropRate = itemCount > 0 ? (parseInt(dropRate) / itemCount) : 0;

      html += `
        <div style="margin-bottom: 15px;">
          <div style="font-size: 12px; color: ${color}; font-weight: 600; margin-bottom: 8px;">Grade ${grade} (Group ${groupId}) - ${groupDropRatePercent} total (${itemCount} items)</div>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tbody>
              ${groupItems.map(itemId => formatDropItem(itemId, itemDropRate)).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    html += `
      </div>
    `;
  }

  // Multi-language Names
  html += `
    <div class="detail-multilang">
      <span class="detail-multilang-label">Multi-Language Names</span>
      <div class="detail-multilang-names">
        🇵🇭 ${monster.phil_name || '—'} • 🇰🇷 ${monster.kor_name || '—'} • 🇨🇳 ${monster.chi_name || '—'}<br>
        🇮🇩 ${monster.indo_name || '—'} • 🇯🇵 ${monster.jp_name || '—'} • 🇹🇼 ${monster.taiwan_name || '—'} • 🇲🇽 ${monster.mexico_name || '—'}
      </div>
    </div>
  `;

  return html;
}

/**
 * Create NPC detail view
 */
function createNPCDetailView(npc) {
  const name = getLocalizedName(npc);

  let html = `<h2>${escapeHtml(name)} <span style="font-size: 16px; color: #888;">#${npc.id}</span></h2>`;

  // NPC Info Grid
  html += `
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-label">Type</div>
        <div class="detail-value">${escapeHtml(npc.type || 'Unknown')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Location</div>
        <div class="detail-value">${escapeHtml(npc.location || 'Unknown')}</div>
      </div>
    </div>
  `;

  // Multi-language Names
  html += `
    <div class="detail-multilang">
      <span class="detail-multilang-label">Multi-Language Names</span>
      <div class="detail-multilang-names">
        🇵🇭 ${npc.phil_name || '—'} • 🇰🇷 ${npc.kor_name || '—'} • 🇨🇳 ${npc.chi_name || '—'}<br>
        🇮🇩 ${npc.indo_name || '—'} • 🇯🇵 ${npc.jp_name || '—'} • 🇹🇼 ${npc.taiwan_name || '—'} • 🇲🇽 ${npc.mexico_name || '—'}
      </div>
    </div>
  `;

  return html;
}

/**
 * Close detail modal
 */
function closeModal() {
  detailModal.style.display = 'none';
}

/**
 * Get item type name
 */
function getItemTypeName(typeCode) {
  const typeMap = {
    0: 'Others',
    1: 'Sword',
    2: 'Axes',
    4: 'Spears',
    8: 'Dullweapons',
    10: 'Armors',
    11: 'Pants',
    12: 'Helmet',
    13: 'Gloves',
    14: 'Belt',
    15: 'Shoes',
    16: 'Battleweapons',
    17: 'Charms',
    18: 'Earrings',
    19: 'Bracelets',
    20: 'Necklace',
    21: 'Rings',
    22: 'Type 22',
    23: 'Type 23',
    24: 'Type 24',
    32: 'Staff',
    64: 'Bows',
    90: 'Refinement Stones',
    91: 'Refinement Helper',
    92: 'Refinement Addon',
    128: 'Daggers',
    256: 'Shields'
  };
  return typeMap[typeCode] || 'Unknown';
}

/**
 * Load items by type/category
 */
function loadItemsByType(itemType) {
  // Clear search input
  mainSearchInput.value = '';
  navSearchInput.value = '';

  // Filter items by type using CORRECT sType from ItemMapping.json
  const filteredItems = dataParser.items.filter(item => {
    const correctType = getCorrectItemType(item);
    const itemTypeStr = String(correctType);
    return itemTypeStr === String(itemType);
  });

  // Set filtered items as results
  allResults = filteredItems.map(item => ({ ...item, itemType: getCorrectItemType(item), type: 'Item' }));

  if (allResults.length === 0) {
    noResults.style.display = 'block';
    filtersSection.style.display = 'none';
    resultsTableSection.style.display = 'none';
    resultCount.textContent = `No items found for type ${itemType}.`;
    searchClear.style.display = 'none';
    return;
  }

  resultCount.textContent = `Found ${allResults.length} items.`;
  searchClear.style.display = 'block';
  noResults.style.display = 'none';
  filtersSection.style.display = 'block';
  resultsTableSection.style.display = 'block';

  // Reset to first page and apply filter
  currentPage = 1;
  currentFilter = 'all';
  filterButtons.forEach(btn => btn.classList.remove('active'));
  filterButtons[0].classList.add('active');
  applyFilter();

  // Scroll to results
  document.querySelector('.table-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Load all monsters from the database
 */
function loadMonsterDatabase() {
  // Clear search input
  mainSearchInput.value = '';
  navSearchInput.value = '';

  // Set all monsters as results
  allResults = dataParser.monsters.map(monster => ({ ...monster, type: 'Monster' }));

  if (allResults.length === 0) {
    noResults.style.display = 'block';
    filtersSection.style.display = 'none';
    resultsTableSection.style.display = 'none';
    resultCount.textContent = 'No monsters found.';
    searchClear.style.display = 'none';
    return;
  }

  resultCount.textContent = `Found ${allResults.length} monsters.`;
  searchClear.style.display = 'block';
  noResults.style.display = 'none';
  filtersSection.style.display = 'block';
  resultsTableSection.style.display = 'block';

  // Reset to first page and apply filter
  currentPage = 1;
  currentFilter = 'all';
  filterButtons.forEach(btn => btn.classList.remove('active'));
  filterButtons[0].classList.add('active');
  applyFilter();

  // Scroll to results
  document.querySelector('.table-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready (or immediately if already loaded)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM is already loaded, call initApp directly
  console.log('⚠️ DOMContentLoaded already fired, calling initApp directly');
  initApp();
}

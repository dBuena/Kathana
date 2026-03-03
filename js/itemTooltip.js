/**
 * Item Tooltip System
 * Handles tooltips for items in Item Drops and Loot Grades sections
 */

function initializeItemTooltip(itemElement, itemId) {
  if (!itemId || itemId <= 0) return;

  itemElement.addEventListener('mouseenter', (e) => {
    // Remove existing tooltip if present
    const existing = document.querySelector('.item-tooltip');
    if (existing) existing.remove();

    // Get item data from dataParser
    const item = typeof dataParser !== 'undefined' && dataParser.getItemById
      ? dataParser.getItemById(itemId)
      : null;

    if (!item) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'item-tooltip';

    // Get item name
    const itemName = getLocalizedName ? getLocalizedName(item) : (item.name || 'Unknown Item');

    // Get item type name from itemTypeMap
    const itemType = getItemTypeName ? getItemTypeName(getCorrectItemType ? getCorrectItemType(item) : item.type) : 'Unknown';

    // Build tooltip HTML
    let tooltipHTML = `<strong><span style="color: #58a6ff;">${escapeHtml(itemName)}</span></strong>`;
    tooltipHTML += `<br><span style="color: #888; font-size: 11px;">Item: ${itemType}</span>`;

    // Get the correct item type - try multiple sources
    let itemTypeValue = null;

    // Try to get correct type from global itemToTypeMap (from app.js)
    if (typeof itemToTypeMap !== 'undefined' && item.id) {
      const itemIdStr = String(item.id);
      if (itemIdStr in itemToTypeMap) {
        itemTypeValue = itemToTypeMap[itemIdStr];
      }
    }

    // Fallback to getCorrectItemType function if available
    if (itemTypeValue === null && typeof getCorrectItemType === 'function') {
      itemTypeValue = getCorrectItemType(item);
    }

    // Final fallback to item properties
    if (itemTypeValue === null) {
      itemTypeValue = item.type || item.sType || 0;
    }

    // Check if it's a weapon (types 1, 2, 4, 8, 16, 32, 64, 128) or armor (types 10-15, 17, 256, 257, 258, 259, 260, 261)
    const isWeapon = [1, 2, 4, 8, 16, 32, 64, 128].includes(itemTypeValue);
    const isArmor = [10, 11, 12, 13, 14, 15, 17, 256, 257, 258, 259, 260, 261].includes(itemTypeValue);

    // Get effect parameters
    const param1 = item.iEffect1Param1 || 0;
    const param2 = item.iEffect1Param2 || 0;

    if (isWeapon && (param1 > 0 || param2 > 0)) {
      tooltipHTML += `<br><span style="color: #ff6b6b;">Damage: ${param1}-${param2}</span>`;
    } else if (isArmor && (param1 > 0 || param2 > 0)) {
      // For armor, use the first param as defense value
      const defense = Math.max(param1, param2); // Use the higher value for defense
      tooltipHTML += `<br><span style="color: #3fb950;">Defense: ${defense}</span>`;
    }

    // Display durability if available
    if (item.durability && item.durability > 0) {
      tooltipHTML += `<br>Durability: ${item.durability}`;
    }

    // Display level requirement
    if (item.byteLimitLevel && item.byteLimitLevel > 0) {
      tooltipHTML += `<br><span style="color: #ff9800;">Level Requirement: ${item.byteLimitLevel}</span>`;
    }

    // Display prices with special formatting
    if (item.buy_price !== undefined && item.buy_price !== null) {
      let buyPriceText = item.buy_price === 0 ? 'Priceless' : item.buy_price.toLocaleString();
      tooltipHTML += `<br><span style="color: #3fb950;">Buying Price: ${buyPriceText}</span>`;
    }
    if (item.sell_price !== undefined && item.sell_price !== null) {
      let sellPriceText = item.sell_price === -1 ? 'Cannot be sold' : item.sell_price.toLocaleString();
      tooltipHTML += `<br><span style="color: #d29922;">Sell Price: ${sellPriceText}</span>`;
    }

    // Display description
    const desc = item[`${typeof currentLanguage !== 'undefined' ? currentLanguage : 'phil'}_desc`]
      || item.phil_desc
      || item.desc
      || '';
    if (desc) {
      tooltipHTML += `<br><span style="color: #b0b0b0; font-size: 11px; margin-top: 4px; display: block;">${escapeHtml(desc).substring(0, 100)}${escapeHtml(desc).length > 100 ? '...' : ''}</span>`;
    }

    tooltip.innerHTML = tooltipHTML;
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(26, 26, 26, 0.95);
      color: #fff;
      padding: 10px 12px;
      border: 1px solid #4a5568;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
      max-width: 250px;
      white-space: normal;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      line-height: 1.4;
    `;

    document.body.appendChild(tooltip);

    // Position tooltip on mouse move (right side of cursor)
    const moveHandler = (event) => {
      tooltip.style.left = (event.clientX + 16) + 'px'; // 16px right of cursor
      tooltip.style.top = (event.clientY - tooltip.offsetHeight / 2) + 'px';
    };

    itemElement.addEventListener('mousemove', moveHandler);
    itemElement.addEventListener('mouseleave', () => {
      itemElement.removeEventListener('mousemove', moveHandler);
      tooltip.remove();
    }, { once: true });
  });
}

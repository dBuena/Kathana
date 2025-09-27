document.addEventListener("DOMContentLoaded", () => {
  let itemsCache = {}; // cache tooltips by itemId

  // Load items.json only when needed
  async function fetchItem(itemId) {
    if (itemsCache[itemId]) return itemsCache[itemId]; // already cached

    // Fetch items.json (you could also fetch tooltip.html?id=xxx if you want)
    const response = await fetch("items.json");
    const items = await response.json();

    // Index items by ID for quick access
    items.forEach(item => {
      itemsCache[item.ID] = item;
    });

    return itemsCache[itemId];
  }

  // Attach hover listeners to all item links
  document.querySelectorAll(".item-link").forEach(link => {
    const itemId = link.getAttribute("data-item-id");

    // Enable bootstrap tooltip
    link.setAttribute("data-bs-toggle", "tooltip");
    link.setAttribute("data-bs-html", "true");
    link.setAttribute("title", "Loading..."); // default placeholder

    let tooltip = new bootstrap.Tooltip(link);

    // Load content when hovered for the first time
    link.addEventListener("mouseenter", async () => {
      if (itemsCache[itemId]) {
        tooltip.setContent({
          ".tooltip-inner": `
            <h5>${itemsCache[itemId].ItemName}</h5>
            <p>${itemsCache[itemId].Description}</p>
            Atk: ${itemsCache[itemId].iEffect1Param1}-${itemsCache[itemId].iEffect1Param2}<br>
            Class: ${itemsCache[itemId].ClassLimit}
          `
        });
        return;
      }

      const item = await fetchItem(itemId);
      if (item) {
        tooltip.setContent({
          ".tooltip-inner": `
            <h5>${item.ItemName}</h5>
            <p>${item.Description}</p>
            Atk: ${item.iEffect1Param1}-${item.iEffect1Param2}<br>
            Class: ${item.ClassLimit}
          `
        });
      } else {
        tooltip.setContent({
          ".tooltip-inner": `<span style="color:red">Item not found</span>`
        });
      }
    });
  });
});

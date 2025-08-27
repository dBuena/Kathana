// --- app.js ---

// CONFIG: world → canvas (516x516) scaling
const CONFIG = {
  world: {
    // If true, use max X/Y seen across all inputs as world bounds.
    // If false, use fixed width/height below (common: 1024x1024).
    autodetect: true,
    width: 1022,
    height: 1022,
    originX: 0,
    originY: 0
  },
  canvas: {
    width: 488,
    height: 488, //516x516
    offsetX: -10,
    offsetY: -5
  }
};

let locationsData = { monsters: {}, npcs: {}, portals: {} };
let monsterNames = {};
let activeTooltip = null;

// bounds for autodetect scaling (consider all categories)
const spawnBounds = { maxX: 1, maxY: 1 };

// Accordion toggle: click to open; click again to close
function toggleAccordion(id) {
  const target = document.getElementById(id);
  if (target.classList.contains('active')) {
    target.classList.remove('active');
  } else {
    document.querySelectorAll('.accordion-content').forEach(el => el.classList.remove('active'));
    target.classList.add('active');
  }
}

// Load all sources
async function loadLocations() {
  try {
    // Monster names
    const nameRes = await fetch('ETmonsternames.json');
    if (nameRes.ok) {
      const names = await nameRes.json();
      names.forEach(entry => {
        monsterNames[String(entry.id)] = entry.label;
      });
    }

    // Monsters from NPCGener.txt
    const genRes = await fetch('ETNPCGener.txt');
    if (!genRes.ok) throw new Error('Failed to load NPCGener.txt');
    const genText = await genRes.text();
    parseNPCGener(genText);

    // NPCs from NPCLocation.json (world grid coords)
    const npcRes = await fetch('ETNPCLocation.json');
    if (npcRes.ok) {
      const npcData = await npcRes.json();
      parseNPCLocation(npcData);
    }

    // Portals from PortalLocation.json (world grid coords)
    const portalRes = await fetch('ETPortalLocation.json');
    if (portalRes.ok) {
      const portalData = await portalRes.json();
      parsePortalLocation(portalData);
    }

    // Fill accordions
    populateSidebar('monsters');
    populateSidebar('npcs');
    populateSidebar('portals');
  } catch (err) {
    console.error(err);
    alert('Failed to load map data.');
  }
}

// Parse NPCGener.txt (Monsters only)
function parseNPCGener(text) {
  // Split blocks by #'s
  const blocks = text.split('#').slice(1);

  blocks.forEach(block => {
    const monsterMatches = [...block.matchAll(/Monster\d+:\s*(\d+)/g)];
    const xMatch = block.match(/Segment0X:\s*(\d+)/);
    const yMatch = block.match(/Segment0Y:\s*(\d+)/);

    if (monsterMatches.length && xMatch && yMatch) {
      const x = parseInt(xMatch[1], 10);
      const y = parseInt(yMatch[1], 10);

      // Update autodetect bounds
      if (x > spawnBounds.maxX) spawnBounds.maxX = x;
      if (y > spawnBounds.maxY) spawnBounds.maxY = y;

      monsterMatches.forEach(m => {
        const id = String(m[1]);
        if (!locationsData.monsters[id]) {
          locationsData.monsters[id] = {
            label: monsterNames[id] || `Monster ${id}`,
            locations: []
          };
        }
        locationsData.monsters[id].locations.push({ x, y });
      });
    }
  });
}

// Parse NPCLocation.json
function parseNPCLocation(data) {
  if (!data || !Array.isArray(data.npcs)) return;
  locationsData.npcs = {};
  data.npcs.forEach(npc => {
    const x = Number(npc.x), y = Number(npc.y);
    locationsData.npcs[String(npc.id)] = {
      label: npc.label,
      locations: [{ x, y }]
    };
    if (x > spawnBounds.maxX) spawnBounds.maxX = x;
    if (y > spawnBounds.maxY) spawnBounds.maxY = y;
  });
}

// Parse PortalLocation.json
function parsePortalLocation(data) {
  if (!data || !Array.isArray(data.portals)) return;
  locationsData.portals = {};
  data.portals.forEach(portal => {
    const x = Number(portal.x), y = Number(portal.y);
    locationsData.portals[String(portal.id)] = {
      label: portal.label,
      locations: [{ x, y }]
    };
    if (x > spawnBounds.maxX) spawnBounds.maxX = x;
    if (y > spawnBounds.maxY) spawnBounds.maxY = y;
  });
}

// Sidebar builder
function populateSidebar(category) {
  const container = document.getElementById(category);
  container.innerHTML = '';

  const cat = locationsData[category];
  if (!cat || Object.keys(cat).length === 0) {
    container.innerHTML = '<i>No data</i>';
    return;
  }

  for (const [id, entry] of Object.entries(cat)) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.textContent = entry.label;
    item.onclick = () => placeAllPins(id, category);
    container.appendChild(item);
  }
}

// World → Canvas pixels (516×516)
function worldToPixel(x, y) {
  const canvasW = CONFIG.canvas.width;
  const canvasH = CONFIG.canvas.height;

  const worldW = CONFIG.world.autodetect
    ? Math.max(spawnBounds.maxX - CONFIG.world.originX, 1)
    : CONFIG.world.width;

  const worldH = CONFIG.world.autodetect
    ? Math.max(spawnBounds.maxY - CONFIG.world.originY, 1)
    : CONFIG.world.height;

  //const px = ((x - CONFIG.world.originX) / worldW) * canvasW;
  //const py = ((y - CONFIG.world.originY) / worldH) * canvasH;
    const px = ((x - CONFIG.world.originX) / worldW) * canvasW + CONFIG.canvas.offsetX;
    const py = ((y - CONFIG.world.originY) / worldH) * canvasH + CONFIG.canvas.offsetY;

  return { px, py };
}

// Place pins for a given entry
function placeAllPins(key, category) {
  const canvas = document.getElementById('mapCanvas');
  const cat = locationsData[category];
  const entry = cat[key];
  if (!entry) return;

  // Remove existing pins for this key
  canvas.querySelectorAll(`.pin[data-name="${key}"]`).forEach(pin => {
    if (pin.tooltip && document.body.contains(pin.tooltip)) {
      document.body.removeChild(pin.tooltip);
    }
    pin.remove();
  });

  const { label, locations } = entry;

  locations.forEach(({ x, y }) => {
    const { px, py } = worldToPixel(x, y);

    const pin = document.createElement('div');
    pin.className = `pin ${category === 'monsters' ? 'monster' : category === 'npcs' ? 'npc' : 'portal'}`;
    pin.dataset.name = key;
    pin.dataset.x = x;
    pin.dataset.y = y;
    pin.style.left = `${px}px`;
    pin.style.top  = `${py}px`;

    // Remove on click
    pin.onclick = (e) => {
      e.stopPropagation();
      if (pin.tooltip && document.body.contains(pin.tooltip)) {
        document.body.removeChild(pin.tooltip);
      }
      pin.remove();
    };

    // Tooltip on hover
    pin.onmouseover = () => {
      if (activeTooltip) return;
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = `${label} (${x}, ${y})`;

      const rect = pin.getBoundingClientRect();
      tip.style.left = `${rect.left + window.scrollX}px`;
      tip.style.top  = `${rect.top - 26 + window.scrollY}px`;

      document.body.appendChild(tip);
      pin.tooltip = tip;
      activeTooltip = tip;
    };
    pin.onmouseout = () => {
      if (pin.tooltip && document.body.contains(pin.tooltip)) {
        document.body.removeChild(pin.tooltip);
      }
      if (activeTooltip === pin.tooltip) activeTooltip = null;
      pin.tooltip = null;
    };

    canvas.appendChild(pin);
  });
}

// Clear all pins
function clearAllPins() {
  const canvas = document.getElementById('mapCanvas');
  canvas.querySelectorAll('.pin').forEach(pin => {
    if (pin.tooltip && document.body.contains(pin.tooltip)) {
      document.body.removeChild(pin.tooltip);
    }
    pin.remove();
  });
  activeTooltip = null;
}

// Boot
window.onload = loadLocations;

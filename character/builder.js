'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// TRIBE DATA
// ─────────────────────────────────────────────────────────────────────────────

const TRIBES = [
  { id: 'naga',      name: 'Naga / Kinnara',     base: { muscle: 12, nerve: 10, heart: 11, mind: 10 } },
  { id: 'asura',     name: 'Asura / Rakshasa',   base: { muscle: 11, nerve: 12, heart: 10, mind: 10 } },
  { id: 'yaksa',     name: 'Yaksa / Gandharva',  base: { muscle: 11, nerve: 11, heart: 11, mind: 10 } },
  { id: 'deva',      name: 'Deva / Garuda',      base: { muscle: 10, nerve: 10, heart: 10, mind: 13 } },
];

const STATS = [
  { key: 'muscle', label: 'Muscle', color: 'muscle' },
  { key: 'nerve',  label: 'Nerve',  color: 'nerve'  },
  { key: 'heart',  label: 'Heart',  color: 'heart'  },
  { key: 'mind',   label: 'Mental', color: 'mind'   },
];

// Equipment slots: [type, icon, label, allowed_itemTypes]
const EQUIPMENT_SLOTS = [
  { type: 'weapon', icon: '⚔️',  label: 'Main Hand', allowed: [0, 1, 2] }, // 1H, 2H, Staff
  { type: 'shield', icon: '🛡️',  label: 'Off Hand', allowed: [0, 3] },     // 1H weapons or shields
  { type: 'body',   icon: '🧥',  label: 'Body', allowed: [3, 4] },         // Heavy/Light armor
  { type: 'leg',    icon: '👖',  label: 'Leg', allowed: [3, 4] },          // Heavy/Light armor
  { type: 'belt',   icon: '🔗',  label: 'Belt', allowed: [3, 4] },         // Heavy/Light armor
  { type: 'head',   icon: '👑',  label: 'Head', allowed: [3, 4] },         // Heavy/Light armor
  { type: 'hand',   icon: '🧤',  label: 'Hand', allowed: [3, 4] },         // Heavy/Light armor
  { type: 'foot',   icon: '👞',  label: 'Foot', allowed: [3, 4] },         // Heavy/Light armor
];

// Item type categories
const ITEM_TYPE_CATEGORY = {
  0: 'weapon',  // 1H
  1: 'weapon',  // 2H
  2: 'magic',   // Staff
  3: 'armor',   // Heavy armor/shield
  4: 'armor',   // Light armor/helm
};

// Refine bonuses
const REFINE_TABLE = [
  [ 4,  8, 12, 16, 20,  24,  32,  40,  50,  60,  72,  84,  96, 108, 120], // 0: 1H
  [ 6, 12, 18, 24, 30,  36,  48,  60,  75,  90, 108, 126, 144, 162, 180], // 1: 2H
  [ 9, 18, 27, 36, 48,  60,  75,  96, 126, 162, 207, 252, 297, 342, 387], // 2: Staff/Heavy
  [ 3,  6,  9, 12, 16,  20,  25,  32,  42,  54,  69,  84,  99, 114, 129], // 3: Light
];

const ITEM_TYPE_ROW = { 0: 0, 1: 1, 2: 2, 3: 2, 4: 3 };

// Constants
const MAX_CREATION_CHAKRA = 7;
const JOB1_LEVEL = 10;
const JOB2_LEVEL = 45;
const MAX_LEVEL  = 200;

// ─────────────────────────────────────────────────────────────────────────────
// ITEMS
// ─────────────────────────────────────────────────────────────────────────────

let ALL_ITEMS = [];

async function loadItems() {
  try {
    const res = await fetch('items.json');
    ALL_ITEMS = await res.json();
  } catch (e) {
    console.warn('items.json not loaded:', e);
  }
}

// Check if weapon is 2-handed
function is2Handed(item) {
  return item[4] === 1; // itemType 1 = 2H weapon
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

const state = {
  tribe:     'naga',
  level:     1,
  hasClass1: false,
  hasClass2: false,
  creation:  { muscle: 0, nerve: 0, heart: 0, mind: 0 },
  levelPts:  { muscle: 0, nerve: 0, heart: 0, mind: 0 },
  equipment: {},
  modalSlot: null,
  modalSearch: '',
  modalRefine: 0,
  modalSelectedItem: null,
};

const initialState = JSON.parse(JSON.stringify(state));

// ─────────────────────────────────────────────────────────────────────────────
// FORMULAS
// ─────────────────────────────────────────────────────────────────────────────

function calcTotalCP(level, hasClass1) {
  let iPlusChakra = 0;
  if (hasClass1) iPlusChakra = Math.floor(level / 10) * 3;
  let total = 50 + (level - 1) * 5 + iPlusChakra;
  if (level > 99) {
    const iFactor = Math.floor((level - 100) / 10);
    total = 572 + iFactor * (60 + (iFactor - 1) * 10) + (level - (99 + 10 * iFactor)) * (6 + iFactor * 2);
  }
  return total;
}

function cpGain(level, hasClass1) {
  if (level <= 1) return 0;
  return calcTotalCP(level, hasClass1) - calcTotalCP(level - 1, hasClass1);
}

function refineBonus(itemType, refLevel) {
  if (!refLevel || refLevel <= 0) return 0;
  const row = ITEM_TYPE_ROW[itemType] ?? 0;
  return REFINE_TABLE[row]?.[refLevel - 1] ?? 0;
}

function calcMeleeDmg(tribe, stats, baseMin, baseMax, weaponCoeff) {
  const m = stats.muscle, n = stats.nerve;
  let sf, flat;
  if (tribe === 'asura' || tribe === 'rakshasa') {
    sf = Math.floor((m * 2 + n) / 3) + 100;
    flat = m - 11;
  } else if (tribe === 'yaksa' || tribe === 'gandharva') {
    sf = Math.floor((m * 13 + n * 2) / 10) + 100;
    flat = Math.floor(n * 8 / 10);
  } else {
    sf = Math.floor((m * 10 + n) / 10) + 100;
    flat = m - 10;
  }
  return {
    min: Math.max(1, Math.floor(weaponCoeff * sf * baseMin / 1000) + baseMin + flat),
    max: Math.max(1, Math.floor(weaponCoeff * sf * baseMax / 1000) + baseMax + flat),
  };
}

function calcBowDmg(stats, baseMin, baseMax, weaponCoeff) {
  const m = stats.muscle, n = stats.nerve;
  const sf = Math.floor((m + n * 2) / 3) + 100;
  const flat = n - 12;
  return {
    min: Math.max(1, Math.floor(weaponCoeff * sf * baseMin / 1000) + baseMin + flat),
    max: Math.max(1, Math.floor(weaponCoeff * sf * baseMax / 1000) + baseMax + flat),
  };
}

function calcStaffDmg(stats, baseMin, baseMax) {
  // Based on CMob2.cpp: Staff damage uses Nerves (capped at 350) with multiplier 200
  const STAFF_CORRECT = 200;
  const MAX_NERVES = 350;
  const n = Math.min(stats.nerve, MAX_NERVES);
  return {
    min: Math.max(1, Math.floor(STAFF_CORRECT * baseMin * n / 10000) + baseMin),
    max: Math.max(1, Math.floor(STAFF_CORRECT * baseMax * n / 10000) + baseMax),
  };
}

function calcElementalBonus(stats) {
  // Based on CMob2.cpp lines 1941-1966: Elemental scaling formula
  // Formula: ((Mind * 2.5 + Nerves + 100) * BaseDamage * 3 + 500) / 1000 + Mind - 12
  // This represents the multiplicative factor for elemental damage
  const mind = stats.mind;
  const nerve = stats.nerve;
  const multiplier = Math.floor(mind * 2.5 + nerve + 100);
  // Return the bonus as a separate value (difference from base)
  // For display purposes, we show the elemental scaling boost
  return Math.floor((multiplier - 100) / 10); // Simplified for display
}

function calcMagicBonus(mind) {
  // Legacy function kept for compatibility - now calls calcElementalBonus
  // Shows the elemental damage scaling bonus
  return Math.floor(mind * 2.5 / 10);
}

function calcAR(nerve) {
  return Math.floor(14 * Math.sqrt(nerve));
}

function calcDR(nerve) {
  return Math.floor(12 * Math.sqrt(nerve));
}

function calcCharDef(muscle, nerve) {
  return Math.floor((muscle + nerve - 19) / 4);
}

function calcDmgReduction(defense) {
  if (defense <= 0) return 0;
  return defense / (defense + 150) * 100;
}

function estimateHPTP(stats) {
  const coeff = state.hasClass2 ? { hp: 1100, tp: 110 } : state.hasClass1 ? { hp: 900, tp: 90 } : { hp: 800, tp: 75 };
  const heart = stats.heart, mind = stats.mind;
  const isDeva = (state.tribe === 'deva' || state.tribe === 'garuda');
  const hp = Math.max(1, Math.floor(coeff.hp * Math.pow(heart, 1.75) / 1000 + 5 * heart));
  const tp = Math.max(0, isDeva
    ? Math.floor(coeff.tp * Math.pow(mind,  1.75) / 1000 + 4 * mind  - 10)
    : Math.floor(coeff.tp * Math.pow(heart, 1.75) / 1000 + 4 * heart - 10));
  return { hp, tp };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTED STATE
// ─────────────────────────────────────────────────────────────────────────────

const tribeData  = () => TRIBES.find(t => t.id === state.tribe);
const baseStats  = () => Object.assign({}, tribeData().base);
const statSum    = s  => s.muscle + s.nerve + s.heart + s.mind;
const totalCP    = () => calcTotalCP(state.level, state.hasClass1);
const usedCP     = () => statSum(finalStats());
const remainingCP= () => totalCP() - usedCP();

function finalStats() {
  const b = baseStats();
  return {
    muscle: b.muscle + state.creation.muscle + state.levelPts.muscle,
    nerve:  b.nerve  + state.creation.nerve  + state.levelPts.nerve,
    heart:  b.heart  + state.creation.heart  + state.levelPts.heart,
    mind:   b.mind   + state.creation.mind   + state.levelPts.mind,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD DOM
// ─────────────────────────────────────────────────────────────────────────────

function buildTribeList() {
  const container = document.getElementById('tribe-list');
  TRIBES.forEach(tribe => {
    const li = document.createElement('li');
    li.className = 'tribe-item' + (tribe.id === state.tribe ? ' active' : '');
    li.id = 'tribe-' + tribe.id;
    li.textContent = tribe.name;
    li.onclick = () => selectTribe(tribe.id);
    container.appendChild(li);
  });
}

function buildStatsGrid() {
  const container = document.getElementById('stats-grid');
  container.innerHTML = '';
  const b = baseStats();
  const f = finalStats();

  STATS.forEach(stat => {
    const k = stat.key;
    const card = document.createElement('div');
    card.className = `stat-card ${stat.color}`;
    const creation = state.creation[k];
    const levelPts = state.levelPts[k];

    card.innerHTML = `
      <div class="stat-label">${stat.label} ${f[k]}</div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">+${creation} +${levelPts}</div>
      <div style="border: 1px solid var(--border); border-radius: 4px; padding: 6px; margin-bottom: 8px; background-color: rgba(42, 47, 61, 0.3);">
        <div class="stat-controls" style="margin-bottom:4px">
          <button class="stat-btn" onclick="adjustCreation('${k}', -1)">−</button>
          <button class="stat-btn" onclick="adjustCreation('${k}', +1)">+</button>
        </div>
        <div class="stat-ctrl-val" style="font-size:10px">Base Stats</div>
      </div>
      <div style="border: 1px solid var(--border); border-radius: 4px; padding: 6px; background-color: rgba(42, 47, 61, 0.3);">
        <div class="stat-controls" style="margin-bottom:4px; gap: 4px;">
          <button class="stat-btn" onclick="adjustLevelPts('${k}', -1)">−</button>
          <button class="stat-btn" onclick="adjustLevelPts('${k}', +1)">+</button>
          <button class="stat-btn" style="flex: 1; font-size: 12px; font-weight: 700;" onclick="adjustLevelPts('${k}', +10)">[10]</button>
        </div>
        <div class="stat-ctrl-val" style="font-size:10px">Level</div>
      </div>`;
    container.appendChild(card);
  });
}

function buildEquipmentGrid() {
  const container = document.getElementById('equipment-grid');
  container.innerHTML = '';

  EQUIPMENT_SLOTS.forEach(slot => {
    const div = document.createElement('div');
    div.className = 'equipment-slot' + (state.equipment[slot.type] ? ' filled' : '');
    div.id = 'slot-' + slot.type;

    // Disable off-hand if main hand is 2H weapon
    const isOffHandDisabled = slot.type === 'shield' && state.equipment.weapon && is2Handed(state.equipment.weapon.item);
    if (isOffHandDisabled) {
      div.classList.add('disabled');
      div.style.pointerEvents = 'none';
      div.style.opacity = '0.5';
      div.onclick = null;
    } else {
      div.onclick = () => openItemModal(slot.type);
    }

    const eq = state.equipment[slot.type];
    if (eq) {
      const item = eq.item;
      const cat = ITEM_TYPE_CATEGORY[item[4]];
      const statStr = cat === 'armor' ? `DEF ${item[2]}` : `${item[2]}–${item[3]}`;
      div.innerHTML = `
        <div class="slot-icon">${slot.icon}</div>
        <div class="slot-label">${slot.label}</div>
        <div class="slot-item-name">${item[1].substring(0, 12)}</div>
        <div class="slot-refine">+${eq.refine}</div>`;
    } else {
      div.innerHTML = `
        <div class="slot-icon">${slot.icon}</div>
        <div class="slot-label">${slot.label}</div>`;
    }

    container.appendChild(div);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────

function selectTribe(id) {
  state.tribe = id;
  state.creation = { muscle: 0, nerve: 0, heart: 0, mind: 0 };
  state.levelPts  = { muscle: 0, nerve: 0, heart: 0, mind: 0 };
  document.querySelectorAll('.tribe-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tribe-' + id).classList.add('active');
  render();
}

function onLevelChange(val) {
  state.level = parseInt(val, 10);
  if (state.level < JOB1_LEVEL) { state.hasClass1 = false; state.hasClass2 = false; }
  if (state.level < JOB2_LEVEL) { state.hasClass2 = false; }
  clampLevelPts();
  render();
}

function toggleClass1() {
  if (state.level < JOB1_LEVEL) return;
  state.hasClass1 = !state.hasClass1;
  if (!state.hasClass1) state.hasClass2 = false;
  clampLevelPts();
  render();
}

function toggleClass2() {
  if (state.level < JOB2_LEVEL || !state.hasClass1) return;
  state.hasClass2 = !state.hasClass2;
  render();
}

function adjustCreation(key, delta) {
  const next = state.creation[key] + delta;
  const creationUsed = Object.values(state.creation).reduce((a,b)=>a+b, 0);
  if (next < 0) return;
  if (delta > 0 && creationUsed >= MAX_CREATION_CHAKRA) return;
  if (delta > 0 && remainingCP() <= 0) return;
  state.creation[key] = next;
  render();
}

function adjustLevelPts(key, delta) {
  const next = state.levelPts[key] + delta;
  if (next < 0) return;
  if (delta > 0 && remainingCP() <= 0) return;
  state.levelPts[key] = next;
  render();
}

function clampLevelPts() {
  const total = calcTotalCP(state.level, state.hasClass1);
  const baseSum = statSum(baseStats());
  const creatSum = Object.values(state.creation).reduce((a,b)=>a+b, 0);
  let available = Math.max(0, total - baseSum - creatSum);
  let used = Object.values(state.levelPts).reduce((a,b)=>a+b, 0);
  if (used <= available) return;
  let toRemove = used - available;
  for (const k of ['mind', 'heart', 'nerve', 'muscle']) {
    if (toRemove <= 0) break;
    const rm = Math.min(state.levelPts[k], toRemove);
    state.levelPts[k] -= rm;
    toRemove -= rm;
  }
}

function openItemModal(slotType) {
  state.modalSlot = slotType;
  state.modalSearch = '';
  state.modalRefine = state.equipment[slotType]?.refine ?? 0;
  document.getElementById('item-search').value = '';
  document.getElementById('refine-slider').value = state.modalRefine;
  updateRefineValue(state.modalRefine);
  document.getElementById('modalTitle').textContent = `Select Item — ${EQUIPMENT_SLOTS.find(s => s.type === slotType)?.label || 'Item'}`;
  renderItemList();
  const modal = new bootstrap.Modal(document.getElementById('itemModal'));
  modal.show();
}

function updateRefineValue(val) {
  state.modalRefine = parseInt(val, 10);
  document.getElementById('refine-value').textContent = state.modalRefine;
}

function renderItemList() {
  const query = document.getElementById('item-search')?.value?.toLowerCase() || '';
  const slotType = state.modalSlot;
  const slot = EQUIPMENT_SLOTS.find(s => s.type === slotType);

  let items = ALL_ITEMS.filter(item => {
    if (!item || item[1] === undefined) return false;
    const itemType = item[4];
    if (!slot.allowed.includes(itemType)) return false;
    return !query || item[1].toLowerCase().includes(query);
  });

  const listEl = document.getElementById('item-list');
  listEl.innerHTML = '';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item-entry';
    const isCurrentlyEquipped = state.equipment[slotType]?.item[0] === item[0];
    const isTemporarilySelected = state.modalSelectedItem && state.modalSelectedItem[0] === item[0];
    if (isCurrentlyEquipped || isTemporarilySelected) div.classList.add('selected');

    const cat = ITEM_TYPE_CATEGORY[item[4]];
    const statStr = cat === 'armor' ? `DEF ${item[2]}` : `${item[2]}–${item[3]}`;

    div.innerHTML = `<span>${item[1]}</span><span class="item-entry-stat">${statStr}</span>`;
    div.onclick = () => {
      document.querySelectorAll('.item-entry').forEach(e => e.classList.remove('selected'));
      div.classList.add('selected');
      state.modalSelectedItem = item;
    };
    listEl.appendChild(div);
  });

  if (items.length === 0) {
    listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-dim)">No items found</div>';
  }
}

function confirmItemSelection() {
  if (state.modalSelectedItem) {
    state.equipment[state.modalSlot] = {
      item: state.modalSelectedItem,
      refine: state.modalRefine
    };
    state.modalSelectedItem = null;
  }
  bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
  render();
}

function resetAll() {
  state.tribe = initialState.tribe;
  state.level = initialState.level;
  state.hasClass1 = initialState.hasClass1;
  state.hasClass2 = initialState.hasClass2;
  state.creation = JSON.parse(JSON.stringify(initialState.creation));
  state.levelPts = JSON.parse(JSON.stringify(initialState.levelPts));
  state.equipment = {};
  document.querySelectorAll('.tribe-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tribe-naga').classList.add('active');
  render();
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────────────────────

function render() {
  const b    = baseStats();
  const f    = finalStats();
  const tcp  = totalCP();
  const ucp  = usedCP();
  const rcp  = remainingCP();
  const tribe= tribeData();

  // Level
  document.getElementById('level-display').innerHTML = `${state.level} / <span style="font-size:16px">/200</span>`;
  document.getElementById('level-slider').value = state.level;
  document.getElementById('cp-gain-val').textContent = state.level === 1 ? '—' : '+' + cpGain(state.level, state.hasClass1);

  // CP
  document.getElementById('cp-total').textContent     = tcp;
  document.getElementById('cp-used').textContent      = ucp;
  document.getElementById('cp-remaining').textContent = rcp;
  const pct = Math.min(100, Math.round((ucp / tcp) * 100));
  const barEl = document.getElementById('cp-bar');
  barEl.style.width = pct + '%';
  barEl.classList.toggle('over', rcp < 0);
  document.getElementById('cp-remaining-block').classList.toggle('over', rcp < 0);

  // Class
  const job1Locked = state.level < JOB1_LEVEL;
  const job2Locked = state.level < JOB2_LEVEL || !state.hasClass1;
  const cb1 = document.getElementById('class1-cb');
  const cb2 = document.getElementById('class2-cb');
  document.getElementById('class1-check').classList.toggle('locked', job1Locked);
  document.getElementById('class2-check').classList.toggle('locked', job2Locked);
  if (cb1) { cb1.checked = state.hasClass1; cb1.disabled = job1Locked; }
  if (cb2) { cb2.checked = state.hasClass2; cb2.disabled = job2Locked; }

  // Stats - rebuild grid to show current values
  buildStatsGrid();

  // Equipment
  buildEquipmentGrid();
  renderEquipmentDetails(f);

  // Summary Stats
  const accuracy = calcAR(f.nerve);
  const evasion = calcDR(f.nerve);
  const baseDef = calcCharDef(f.muscle, f.nerve);
  const { hp, tp } = estimateHPTP(f);

  // Check for equipped weapon and staff
  const weaponEquipped = state.equipment.weapon?.item;
  const isStaffEquipped = weaponEquipped && is2Handed(weaponEquipped) === false && weaponEquipped[4] === 2;

  // Calculate attack rate (weapon damage) or magic attack (for staff)
  let attackStat = 0;
  if (weaponEquipped) {
    // Get refined weapon stats (with refinement bonus applied)
    const refinedWeapon = itemStats(weaponEquipped, state.equipment.weapon.refine);
    if (isStaffEquipped) {
      // Magic attack = refined magic damage + elemental scaling bonus
      const staffDmg = calcStaffDmg(f, refinedWeapon.min, refinedWeapon.max);
      const elBonus = calcElementalBonus(f);
      attackStat = Math.floor((staffDmg.min + staffDmg.max) / 2) + elBonus;
    } else {
      // Melee attack = refined weapon damage with stat multipliers
      const melee = calcMeleeDmg(tribe, f, refinedWeapon.min, refinedWeapon.max, 10);
      attackStat = Math.floor((melee.min + melee.max) / 2);
    }
  }

  // Calculate armor defense - sum from ALL equipped armor slots
  let armorDef = 0;
  ['head', 'body', 'hand', 'leg', 'foot', 'belt', 'shield'].forEach(slot => {
    if (state.equipment[slot]?.item) {
      armorDef += state.equipment[slot].item[2] || 0;
    }
  });

  const totalDef = baseDef + armorDef;

  // Update UI
  const arLabel = document.getElementById('cf-ar-label');
  if (arLabel) arLabel.textContent = isStaffEquipped ? 'Magic Dmg' : 'Melee Dmg';

  document.getElementById('cf-ar').textContent = attackStat || '—';
  document.getElementById('cf-accuracy').textContent = accuracy;
  document.getElementById('cf-evasion').textContent = evasion;
  document.getElementById('cf-def').textContent = totalDef > 0 ? totalDef : baseDef + ' (base)';
  document.getElementById('cf-hp').textContent = hp.toLocaleString();
  document.getElementById('cf-tp').textContent = tp.toLocaleString();
}

function renderEquipmentDetails(stats) {
  const w = state.equipment.weapon;
  const a = state.equipment.shield || state.equipment.head || state.equipment.body || state.equipment.hand || state.equipment.leg || state.equipment.foot || state.equipment.belt;

  // Weapon
  if (w) {
    const ws = itemStats(w.item, w.refine);
    const cat = ITEM_TYPE_CATEGORY[w.item[4]];
    let dmgHTML = '';
    if (cat === 'magic') {
      const d = calcStaffDmg(stats, ws.min, ws.max);
      const elBonus = calcElementalBonus(stats);
      dmgHTML = `<div class="combat-row"><span class="label">Staff Dmg</span><span class="value magic">${d.min}–${d.max}</span></div>
        <div class="combat-row"><span class="label">Elemental Scaling</span><span class="value magic">+${elBonus}</span></div>`;
    } else {
      const d = calcMeleeDmg(state.tribe, stats, ws.min, ws.max, 10);
      dmgHTML = `<div class="combat-row"><span class="label">Melee Dmg</span><span class="value melee">${d.min}–${d.max}</span></div>`;
    }
    document.getElementById('weapon-details').innerHTML = dmgHTML;
    document.getElementById('weapon-details-block').style.display = 'block';
  } else {
    document.getElementById('weapon-details-block').style.display = 'none';
  }

  // Armor - sum from all equipped armor slots
  if (a) {
    let totalArmorDef = 0;
    ['head', 'body', 'hand', 'leg', 'foot', 'belt', 'shield'].forEach(slot => {
      if (state.equipment[slot]?.item) {
        totalArmorDef += state.equipment[slot].item[2] || 0;
      }
    });
    const def = calcCharDef(stats.muscle, stats.nerve) + totalArmorDef;
    const dmgRed = calcDmgReduction(def);
    document.getElementById('armor-details').innerHTML = `
      <div class="combat-row"><span class="label">Armor DEF</span><span class="value">${totalArmorDef}</span></div>
      <div class="combat-row"><span class="label">Total DEF</span><span class="value">${def}</span></div>
      <div class="combat-row"><span class="label">Dmg Reduction</span><span class="value">${dmgRed.toFixed(1)}%</span></div>`;
    document.getElementById('armor-details-block').style.display = 'block';
  } else {
    document.getElementById('armor-details-block').style.display = 'none';
  }
}

function itemStats(item, refLevel) {
  const bonus = refineBonus(item[4], refLevel);
  const cat = ITEM_TYPE_CATEGORY[item[4]];
  return {
    min: (item[2] || 0) + bonus,
    max: (cat === 'armor' ? (item[2] || 0) : (item[3] || item[2] || 0)) + bonus,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

function init() {
  buildTribeList();
  buildStatsGrid();
  loadItems();
  render();

  // Set up search input event listener
  const searchInput = document.getElementById('item-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderItemList);
  }
}

init();

window._tantra = { state, TRIBES, ALL_ITEMS };

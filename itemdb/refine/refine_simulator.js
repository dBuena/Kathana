// ── Data from source ───────────────────────────────────────────────────────────

// g_pRefineTable[row][level-1]  Basedef.cpp:421
const REFINE_TABLE = [
  [ 4,  8, 12, 16, 20,  24,  32,  40,  50,  60,  72,  84,  96, 108, 120], // 0: 1H
  [ 6, 12, 18, 24, 30,  36,  48,  60,  75,  90, 108, 126, 144, 162, 180], // 1: 2H
  [ 9, 18, 27, 36, 48,  60,  75,  96, 126, 162, 207, 252, 297, 342, 387], // 2: Staff / Heavy Armor
  [ 3,  6,  9, 12, 16,  20,  25,  32,  42,  54,  69,  84,  99, 114, 129], // 3: Light Armor
];
const TYPE_ROW   = [0, 1, 2, 2, 3];
const TYPE_ICONS = ['⚔️','🗡️','🪄','🛡️','🪖'];
const TYPE_STAT  = ['Damage','Damage','Magic Atk','Defense','Defense'];

// REFINE_MAIN[stoneRow][level]  Basedef.h:1018  (-1 = impossible / not usable)
const REFINE_MAIN = [
  [ 80,  70,  60,  45,  30,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0], // 0: Illa
  [100, 100,  90,  75,  65,  55,  40,  10,   0,   0,   0,   0,   0,   0,   0], // 1: Azis
  [100, 100, 100, 100,  80,  70,  60,  20,  10,   5,   0,   0,   0,   0,   0], // 2: Surapa
  [ 40,  30,  25,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0], // 3: Dipa Illa
  [100, 100, 100, 100, 100, 100, 100,  80,  50,  30,  20,  10,   0,   0,   0], // 4: Prajati
  [100, 100, 100, 100, 100, 100, 100, 100, 100,  -1,  -1,  -1,  -1,  -1,  -1], // 5: Sambadu
  [ -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  30,  20,  10], // 6: Gavi
];

// REFINE_SUB[10]  Basedef.h:1028 — addon stones, capped at 90%
const REFINE_SUB_BASE = [100, 100, 100, 80, 70, 40, 10, 5, 3, 1];
const REFINE_SUB      = REFINE_SUB_BASE.map(r => Math.min(90, r));

const ADDON_NAMES = {
  1:'Raga Mani',2:'Nila Mani',3:'Visazan',4:'Luvati',5:'Om Yantra',
  6:'Manipura',7:'Vishuda',8:'Anahata',9:'Azna',10:'En Raga Mani',
  11:'En Nila Mani',12:'En Visazan',13:'En Luvati'
};

// Failure thresholds  Basedef.h:393-394
const REFINE_INIT_LVL    = 4;  // fail → reset to +0
const REFINE_DISAP_LVL   = 7;  // fail → item destroyed
const MAX_REFINE_LVL     = 15;
const MAX_ADDON_SLOTS    = 10;

// Helper stone metadata (effects confirmed from server.cpp; param values in binary data)
const HELPER_INFO = {
  '6551': { cls:'eff-jade', tag:'Chattou',
    desc:'At reset zone (+4–+6) fail = no level drop. At danger zone (+7+) fail = drops to +6 instead of being destroyed.' },
  '6556': { cls:'eff-prot', tag:'Kuntu',
    desc:'<b>Keeps the Kuntu stone from being consumed on failure — does NOT protect your item.</b> The item still resets or gets destroyed normally.<br><small style="color:#f08080">⚠ Not the same as Chattou. Chattou saves the item; Kuntu only saves the stone.</small>' },
};

// ── State ──────────────────────────────────────────────────────────────────────
let state          = { level:0, attempts:0, successes:0, fails:0, destroyed:false };
let addonState     = { slots:[], attempts:0, successes:0, fails:0 };
let autoTimer      = null;
let addonAutoTimer = null;

// ── Helpers ────────────────────────────────────────────────────────────────────
const getTableRow = () => TYPE_ROW[+document.getElementById('itemType').value];
const getStoneRow = () => +document.getElementById('stoneSelect').value;
const getItemName = () => document.getElementById('itemSearch').value.trim() || 'Item';
const getItemType = () => +document.getElementById('itemType').value;
const getHelper   = () => document.getElementById('helperStone').value;

// True base stats (at +0) — always stored separately from what the inputs display
let trueBaseMin = 10, trueBaseMax = 12;
const getBaseMin = () => trueBaseMin;
const getBaseMax = () => getItemType() >= 3 ? trueBaseMin : trueBaseMax;

// Bonus at a given start level for the current item type
function startBonus(lvl) {
  return lvl > 0 ? REFINE_TABLE[getTableRow()][lvl - 1] : 0;
}

// Sync the input fields to show stats at the selected start level
function updateBaseInputs() {
  const bonus = startBonus(getStartLevel());
  document.getElementById('baseMin').value = trueBaseMin + bonus;
  document.getElementById('baseMax').value = trueBaseMax + bonus;
}

// Called when the user manually edits a base stat input
function onBaseStatChange() {
  const bonus = startBonus(getStartLevel());
  trueBaseMin = Math.max(1, (+document.getElementById('baseMin').value || 1) - bonus);
  trueBaseMax = Math.max(1, (+document.getElementById('baseMax').value || 1) - bonus);
  update();
}

function statMinAt(level) {
  return level <= 0 ? getBaseMin() : getBaseMin() + REFINE_TABLE[getTableRow()][level - 1];
}
function statMaxAt(level) {
  return level <= 0 ? getBaseMax() : getBaseMax() + REFINE_TABLE[getTableRow()][level - 1];
}
function statRangeAt(level) {
  const mn = statMinAt(level), mx = statMaxAt(level);
  return mn === mx ? `${mn}` : `${mn}-${mx}`;
}
function getVanantaBonus()      { return Math.floor(+document.getElementById('vanantaSlider').value  / 10); }
function getAddonVanantaBonus() { return Math.floor(+document.getElementById('vanantaSlider2').value / 10); }
function rateAt(sr, level) {
  if (level < 0 || level >= MAX_REFINE_LVL) return -1;
  const base = REFINE_MAIN[sr][level];
  if (base <= 0) return base;
  return Math.min(100, base + getVanantaBonus());
}
function failZone(level) {
  if (level < REFINE_INIT_LVL)  return 'safe';
  if (level < REFINE_DISAP_LVL) return 'reset';
  return 'danger';
}
function failZoneText(level) {
  switch(failZone(level)) {
    case 'safe':   return '✔ Safe zone — fail has no effect (no level loss)';
    case 'reset':  return '⚠ Reset zone — fail resets item to +0  (REFINE_INITIALIZE_LEVEL = 4)';
    default:       return '☠ Danger zone — fail DESTROYS item!  (REFINE_DISAPEAR_LEVEL = 7)';
  }
}

// Jade / Chattou (6551) — exact logic from RefiningItem()
function jadeFailResult(level) {
  if (level >= REFINE_INIT_LVL && level < REFINE_DISAP_LVL) {
    return { newLevel: level, code: 'protect' };      // nDecLevel = 0 → no level drop
  }
  if (level >= REFINE_DISAP_LVL) {
    const nDecLevel = level - 6;                      // eTNAfn_RefiningJade branch
    const nLevel    = level - nDecLevel;              // = 6
    if (nLevel > 0) return { newLevel: nLevel, code: 'drop' };
    if (nLevel === 0) return { newLevel: 0, code: 'init' };
    return { newLevel: -1, code: 'destroyed' };
  }
  return { newLevel: level, code: 'safe' };
}

// ── Core Roll ─────────────────────────────────────────────────────────────────
function doRefine() {
  if (state.destroyed) return null;
  const sr    = getStoneRow();
  const level = state.level;
  const rate  = rateAt(sr, level);
  const h     = getHelper();
  state.attempts++;

  if (rate < 0 || rate === 0) return { result:'invalid', level };

  if (Math.random() * 100 < rate) {
    state.level++; state.successes++;
    return { result:'success', from:level, to:state.level, rate };
  }

  state.fails++;

  if (h === '6551') {
    const j = jadeFailResult(level);
    if (j.code === 'destroyed') { state.destroyed = true; state.level = -1; }
    else state.level = j.newLevel;
    return { result:`fail-jade-${j.code}`, from:level, to:state.level, rate };
  }

  // Kuntu (6556): stone is kept on fail, but item still follows normal destruction rules
  if (h === '6556') {
    const zone = failZone(level);
    if (zone === 'safe')   return { result:'fail-kuntu-safe',   from:level, to:level, rate };
    if (zone === 'reset')  { state.level = 0; return { result:'fail-kuntu-reset', from:level, to:0, rate }; }
    state.destroyed = true; state.level = -1;
    return { result:'fail-kuntu-destroyed', from:level, rate };
  }

  const zone = failZone(level);
  if (zone === 'safe')   return { result:'fail-safe',      from:level, to:level, rate };
  if (zone === 'reset')  { state.level = 0; return { result:'fail-reset', from:level, to:0, rate }; }
  state.destroyed = true; state.level = -1;
  return { result:'fail-destroyed', from:level, rate };
}

// ── Log ────────────────────────────────────────────────────────────────────────
function addLog(elId, msg, cls) {
  const el  = document.getElementById(elId);
  const div = document.createElement('div');
  div.className   = `log-entry ${cls}`;
  div.textContent = msg;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}
function mainLog(msg, cls) {
  addLog('log', `[${String(state.attempts).padStart(4,'0')}] ${msg}`, cls);
  document.getElementById('logCount').textContent =
    `${state.attempts} attempts — ${state.successes} success / ${state.fails} fail`;
}

// ── Actions ────────────────────────────────────────────────────────────────────
function refineOnce() {
  if (state.destroyed) return;
  const res = doRefine();
  if (!res) return;
  const sl = TYPE_STAT[getItemType()];
  const msgs = {
    'invalid':             [`Stone not usable at +${res.level}.`, 'log-warn'],
    'success':             [`SUCCESS  +${res.from} → +${res.to}  |  ${sl}: ${statRangeAt(res.to)}  [${res.rate}%]`, 'log-ok'],
    'fail-safe':           [`Fail (safe)  +${res.from} — no change  [${res.rate}%]`, 'log-info'],
    'fail-reset':          [`FAIL  +${res.from} → +0  — reset!  [${res.rate}%]`, 'log-init'],
    'fail-jade-protect':   [`FAIL (Chattou)  +${res.from} → +${res.to}  — Chattou blocked loss!  [${res.rate}%]`, 'log-warn'],
    'fail-jade-drop':      [`FAIL (Chattou)  +${res.from} → +6  — Chattou prevented destroy  [${res.rate}%]`, 'log-warn'],
    'fail-jade-init':      [`FAIL (Chattou)  +${res.from} → +0  — Chattou reduced loss  [${res.rate}%]`, 'log-init'],
    'fail-jade-safe':      [`Fail (Chattou/safe)  +${res.from} — no change  [${res.rate}%]`, 'log-info'],
    'fail-jade-destroyed': [`☠ FAIL (Chattou)  +${res.from} → DESTROYED  [${res.rate}%]`, 'log-gone'],
    'fail-kuntu-safe':     [`Fail (Kuntu)  +${res.from} — no change, Kuntu stone kept  [${res.rate}%]`, 'log-info'],
    'fail-kuntu-reset':    [`FAIL (Kuntu)  +${res.from} → +0  — reset! Kuntu stone kept  [${res.rate}%]`, 'log-init'],
    'fail-kuntu-destroyed':[`☠ FAIL (Kuntu)  +${res.from} → DESTROYED — Kuntu stone was kept, but item is gone  [${res.rate}%]`, 'log-gone'],
    'fail-destroyed':      [`☠ FAIL  +${res.from} → DESTROYED  [${res.rate}%]`, 'log-gone'],
  };
  const [msg, cls] = msgs[res.result] || [`Unknown result: ${res.result}`, 'log-info'];
  mainLog(msg, cls);
  update();
}

function applyVanantaUI(sliderId, bar1Id, bar2Id, valId, bonusId) {
  const v     = +document.getElementById(sliderId).value;
  const bonus = Math.floor(v / 10);

  // Bar 1: covers 0–50
  const b1 = document.getElementById(bar1Id);
  b1.style.width = (Math.min(v, 50) * 2) + '%';
  b1.classList.toggle('active', v > 0);

  // Bar 2: covers 51–100
  const b2 = document.getElementById(bar2Id);
  b2.style.width = (v > 50 ? (v - 50) * 2 : 0) + '%';
  b2.classList.toggle('active', v > 50);

  document.getElementById(valId).textContent = `${v} / 100`;
  const bonusEl = document.getElementById(bonusId);
  bonusEl.textContent = `+${bonus}% rate`;
  bonusEl.style.color = bonus > 0 ? 'var(--fail)' : 'var(--muted)';
}

function onVananta() {
  applyVanantaUI('vanantaSlider', 'vanantaBar1', 'vanantaBar2', 'vanantaVal', 'vanantaBonus');
  update();
}

function onAddonVananta() {
  applyVanantaUI('vanantaSlider2', 'vanantaBar3', 'vanantaBar4', 'vanantaVal2', 'vanantaBonus2');
  updateAddonRate();
}

function onTypeChange() {
  const isArmor = getItemType() >= 3;
  document.getElementById('baseMax').style.display    = isArmor ? 'none' : '';
  document.getElementById('baseMaxSep').style.display = isArmor ? 'none' : '';
  updateBaseInputs();
  update();
}
function onHelperChange() {
  const h  = getHelper();
  const el = document.getElementById('helperDesc');
  if (!h || !HELPER_INFO[h]) { el.style.display='none'; update(); return; }
  const info = HELPER_INFO[h];
  el.style.display = 'block';
  el.innerHTML = `<span class="effect-badge ${info.cls}">${info.tag}</span>
    <div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.5">${info.desc}</div>`;
  update();
}

function getStartLevel() { return +document.getElementById('startLevel').value; }

function onStartLevel() {
  state.level     = getStartLevel();
  state.destroyed = false;
  updateBaseInputs();
  update();
}

function resetItem() {
  stopAuto();
  const lvl = getStartLevel();
  state = { level:lvl, attempts:0, successes:0, fails:0, destroyed:false };
  document.getElementById('log').innerHTML = `<div class="log-entry log-info">— Item reset to +${lvl} —</div>`;
  document.getElementById('logCount').textContent = '';
  update();
}

function startAuto() {
  const target = +document.getElementById('targetLevel').value;
  if (state.destroyed || state.level >= target) return;
  autoTimer = setInterval(() => {
    if (state.destroyed || state.level >= target) {
      stopAuto();
      if (state.level >= target) mainLog(`✔ Auto done — reached +${state.level}.`, 'log-ok');
      update(); return;
    }
    const rate = rateAt(getStoneRow(), state.level);
    if (rate <= 0) {
      stopAuto();
      mainLog(`✘ Auto stopped — stone not usable at +${state.level}. Choose a stronger stone.`, 'log-warn');
      update(); return;
    }
    refineOnce();
  }, 80);
  update();
}
function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } update(); }

// ── UI update ─────────────────────────────────────────────────────────────────
function update() {
  const type  = getItemType();
  const level = state.level;
  const sr    = getStoneRow();
  const sl    = TYPE_STAT[type];

  document.getElementById('baseStatLabel').textContent = `Base ${sl}`;
  document.getElementById('thStat').textContent        = sl;
  document.getElementById('itemIcon').textContent      = TYPE_ICONS[type];

  const banner  = document.getElementById('destroyedBanner');
  const display = document.getElementById('itemDisplay');

  if (state.destroyed) {
    document.getElementById('dispName').textContent  = '[ DESTROYED ]';
    document.getElementById('dispLevel').textContent = '☠';
    document.getElementById('dispLevel').style.color = '#f44';
    document.getElementById('dispStat').innerHTML    = '';
    banner.style.display  = 'block';
    display.style.opacity = '0.4';
  } else {
    document.getElementById('dispName').textContent  = getItemName();
    document.getElementById('dispLevel').textContent = `+${level}`;
    document.getElementById('dispLevel').style.color =
      level >= REFINE_DISAP_LVL ? 'var(--fail)' : level >= REFINE_INIT_LVL ? 'var(--init)' : '#fff';
    const bonus = level > 0 ? ` (+${REFINE_TABLE[getTableRow()][level-1]})` : ' (base)';
    document.getElementById('dispStat').innerHTML =
      `${sl}: <b>${statRangeAt(level)}</b> <span style="color:var(--muted);font-size:11px">${bonus}</span>`;
    banner.style.display  = 'none';
    display.style.opacity = '1';
  }

  const rate = state.destroyed ? -1 : rateAt(sr, level);
  const rv = document.getElementById('rateValue');
  const rb = document.getElementById('rateBar');
  if (rate < 0) {
    rv.textContent = 'N/A'; rv.style.color = 'var(--muted)';
    rb.style.width = '0%'; rb.style.background = 'var(--muted)';
  } else {
    const col = rate >= 70 ? 'var(--success)' : rate >= 30 ? 'var(--init)' : 'var(--fail)';
    rv.textContent = `${rate}%`; rv.style.color = col;
    rb.style.width = `${rate}%`; rb.style.background = col;
  }
  document.getElementById('failConsequence').textContent =
    state.destroyed ? '' : failZoneText(level);

  document.getElementById('sAttempts').textContent = state.attempts;
  document.getElementById('sSuccess').textContent  = state.successes;
  document.getElementById('sFails').textContent    = state.fails;

  const busy    = autoTimer !== null;
  const blocked = !state.destroyed && rate <= 0;
  document.getElementById('btnRefine').disabled = state.destroyed || busy || blocked;
  document.getElementById('btnAuto').disabled   = state.destroyed || busy || blocked;
  document.getElementById('btnStop').disabled   = !busy;

  buildPreviewTable();
}

function buildPreviewTable() {
  const tbody = document.getElementById('previewBody');
  const row   = getTableRow();
  tbody.innerHTML = '';
  for (let lv = 0; lv <= MAX_REFINE_LVL; lv++) {
    const isCur = lv === state.level && !state.destroyed;
    const bonus = lv > 0 ? REFINE_TABLE[row][lv-1] : 0;
    const zone  = failZone(lv);
    const tr    = document.createElement('tr');
    if (isCur) tr.className = 'cur-row';

    const td = (t,c) => { const el=document.createElement('td'); el.textContent=t; if(c) el.className=c; return el; };
    tr.appendChild(td(`+${lv}${isCur?' ◀':''}`));
    tr.appendChild(td(statRangeAt(lv)));
    tr.appendChild(td(bonus > 0 ? `+${bonus}` : '—', bonus > 0 ? 'c-gain' : 'c-zero'));

    for (let si = 0; si < 7; si++) {
      const r = lv < MAX_REFINE_LVL ? REFINE_MAIN[si][lv] : -2;
      const [t, c] = r===-2 ? ['MAX','c-max'] : r<0 ? ['—','c-zero'] : r===0 ? ['0%','c-zero']
        : [`${r}%`, r>=70?'c-ok': r>=30?'c-warn':'c-bad'];
      tr.appendChild(td(t, c));
    }

    const [zt, zc] = lv===MAX_REFINE_LVL ? ['—','c-max']
      : zone==='safe'  ? ['No effect','c-safe']
      : zone==='reset' ? ['→ +0','c-reset']
      :                  ['☠ Destroy','c-dang'];
    tr.appendChild(td(zt, zc));
    tbody.appendChild(tr);
  }
}

// ── Addon refine ──────────────────────────────────────────────────────────────
function updateAddonRate() {
  const idx  = addonState.slots.length;
  const rate = idx < MAX_ADDON_SLOTS ? Math.min(100, REFINE_SUB[idx] + getAddonVanantaBonus()) : 0;
  document.getElementById('addonSlotNum').textContent = idx + 1;
  document.getElementById('addonRateVal').textContent = `${rate}%`;
  const col = rate>=70?'var(--success)': rate>=30?'var(--init)':'var(--fail)';
  const rb  = document.getElementById('addonRateBar');
  rb.style.width = `${rate}%`; rb.style.background = col;
  document.getElementById('addonRateNote').textContent =
    idx >= MAX_ADDON_SLOTS ? 'All 10 slots filled — maximum reached.'
    : 'Fail: stone consumed, slot not added. Item is NOT damaged.';
  buildAddonSlots();
  buildAddonRateTable();
  updateAddonBtns();
}

function buildAddonSlots() {
  const c = document.getElementById('addonSlots');
  c.innerHTML = '';
  for (let i = 0; i < MAX_ADDON_SLOTS; i++) {
    const filled = i < addonState.slots.length;
    const div = document.createElement('div');
    div.className = `addon-slot${filled?' filled':''}`;
    div.innerHTML = `<div class="slot-num">Slot ${i+1}</div>
      <div class="slot-name">${filled ? addonState.slots[i] : 'Empty'}</div>`;
    c.appendChild(div);
  }
}

function buildAddonRateTable() {
  const tbody = document.getElementById('addonRateBody');
  tbody.innerHTML = '';
  const curSlot = addonState.slots.length;
  for (let i = 0; i < MAX_ADDON_SLOTS; i++) {
    const base      = REFINE_SUB_BASE[i];
    const effective = Math.min(100, REFINE_SUB[i] + getAddonVanantaBonus());
    const isCur     = i === curSlot;
    const tr = document.createElement('tr');
    if (isCur) tr.className = 'cur-row';
    const col = effective>=70?'c-ok': effective>=30?'c-warn':'c-bad';
    const status = i < curSlot ? '✔ Filled' : isCur ? '← Next' : '';
    tr.innerHTML = `<td>${i+1}${isCur?' ◀':''}</td><td>${base}%</td><td class="${col}">${effective}%</td>
      <td style="font-size:11px;color:var(--muted)">${status}</td>`;
    tbody.appendChild(tr);
  }
}

function applyAddon() {
  const idx = addonState.slots.length;
  if (idx >= MAX_ADDON_SLOTS) {
    addLog('addon-log', 'All 10 slots are full.', 'log-warn'); return;
  }
  const stoneVal  = +document.getElementById('addonStone').value;
  const stoneName = ADDON_NAMES[stoneVal];
  const rate      = Math.min(100, REFINE_SUB[idx] + getAddonVanantaBonus());
  addonState.attempts++;
  if (Math.random() * 100 < rate) {
    addonState.slots.push(stoneName); addonState.successes++;
    addLog('addon-log', `[${String(addonState.attempts).padStart(4,'0')}] ✔ SUCCESS  Slot ${idx+1} — ${stoneName}  [${rate}%]`, 'log-addon');
  } else {
    addonState.fails++;
    addLog('addon-log', `[${String(addonState.attempts).padStart(4,'0')}] ✗ FAIL  Slot ${idx+1} — ${stoneName} — stone consumed  [${rate}%]`, 'log-fail');
  }
  updateAddonStats();
  updateAddonRate();
}

function updateAddonStats() {
  document.getElementById('aAttempts').textContent = addonState.attempts;
  document.getElementById('aSuccess').textContent  = addonState.successes;
  document.getElementById('aFails').textContent    = addonState.fails;
}

function updateAddonBtns() {
  const busy = addonAutoTimer !== null;
  const full = addonState.slots.length >= MAX_ADDON_SLOTS;
  document.getElementById('btnAddonApply').disabled = full || busy;
  document.getElementById('btnAddonAuto').disabled  = full || busy;
  document.getElementById('btnAddonStop').disabled  = !busy;
}

function startAddonAuto() {
  const target = +document.getElementById('addonTarget').value;
  if (addonState.slots.length >= target) return;
  addonAutoTimer = setInterval(() => {
    if (addonState.slots.length >= target || addonState.slots.length >= MAX_ADDON_SLOTS) {
      stopAddonAuto();
      if (addonState.slots.length >= target)
        addLog('addon-log', `✔ Auto done — ${addonState.slots.length} slot(s) filled.`, 'log-addon');
      updateAddonRate(); return;
    }
    applyAddon();
  }, 80);
  updateAddonBtns();
}

function stopAddonAuto() {
  if (addonAutoTimer) { clearInterval(addonAutoTimer); addonAutoTimer = null; }
  updateAddonBtns();
}

function resetAddons() {
  stopAddonAuto();
  addonState = { slots:[], attempts:0, successes:0, fails:0 };
  document.getElementById('addon-log').innerHTML = '<div class="log-entry log-info">— Addons reset —</div>';
  updateAddonStats();
  updateAddonRate();
}

// ── Tabs ───────────────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach((b,i) =>
    b.classList.toggle('active', ['main','addon'][i] === name));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  if (name === 'addon') updateAddonRate();
}

// ── Init ───────────────────────────────────────────────────────────────────────
update();
updateAddonRate();
initItemSearch();

// ── Item Database ──────────────────────────────────────────────────────────────
// [id, name, p1 (min dmg / defense), p2 (max dmg, 0 = armor), itemType (0-4, null=unknown)]
const ITEMS = [[4001, "Old Sword", 4, 5, 0], [4002, "Long Sword", 6, 7, 0], [4003, "Shamshir", 11, 13, 0], [4004, "Earth Shamshir", 11, 13, 0], [4005, "Pata", 19, 21, 0], [4006, "Kindjal", 27, 29, 0], [4007, "Ara", 32, 36, 0], [4008, "Khora", 40, 44, 0], [4009, "Talwar", 46, 50, 0], [4010, "Talwar of The Spirits", 46, 50, 0], [4011, "Zastra", 51, 57, 0], [4012, "Scimitar", 57, 63, 0], [4013, "Sarpa", 63, 69, 0], [4014, "Zakukana", 68, 76, 0], [4015, "Dagger", 4, 5, 0], [4016, "Jambiya", 7, 11, 0], [4017, "Kris", 12, 18, 0], [4018, "Asira", 17, 25, 0], [4019, "Zahati", 20, 31, 0], [4020, "Khanjar", 24, 36, 0], [4021, "Suraka", 29, 43, 0], [4022, "Jasa", 32, 49, 0], [4023, "Sinamusti", 36, 54, 0], [4024, "Krpana", 40, 59, 0], [4025, "Khaskara", 43, 65, 0], [4026, "Old Hand Axe", 4, 6, 0], [4027, "Hand Axe", 6, 9, 0], [4028, "Parashu", 13, 17, 0], [4029, "Earth Parashu", 15, 17, 0], [4030, "Suvas", 21, 29, 0], [4031, "Kisu", 30, 40, 0], [4032, "Kuriza", 36, 49, 0], [4033, "Subadi", 43, 58, 0], [4034, "Hirana", 49, 66, 0], [4035, "Ksarika", 57, 78, 0], [4036, "Vahasti", 64, 86, 0], [4037, "Prazas", 68, 92, 0], [4038, "Kalaparashu", 74, 101, 0], [4039, "Mas", 14, 17, 0], [4040, "Kaja", 23, 28, 0], [4041, "Danda", 32, 39, 0], [4042, "Gada", 38, 47, 0], [4043, "Lagda", 45, 55, 0], [4044, "Ghana", 54, 66, 0], [4045, "Drogana", 63, 77, 0], [4046, "Musara", 72, 88, 0], [4047, "Lagdahasta", 81, 99, 0], [4048, "Hand Axe of Satvan", 7, 10, 0], [4049, "Dagger of Dvanta", 6, 7, 0], [4050, "Vishnu's Wrath", 1, 1, null], [4051, "Shiva's Chaos", 1, 1, null], [4052, "Brahma's Force", 1, 1, null], [4053, "Avrahta", 80, 88, 0], [4054, "Kalanaka", 53, 79, 0], [4055, "Chid", 87, 118, 0], [4056, "Pariga", 90, 110, 0], [4057, "Nheutou", 93, 108, 0], [4058, "Rhomphaia", 65, 99, 0], [4059, "Khudama", 105, 138, 0], [4060, "Gatova Guna", 104, 128, 0], [4061, "Azuri", 108, 133, 0], [4062, "Khrati", 80, 122, 0], [4063, "Taguka", 128, 162, 0], [4064, "Khapouta", 121, 150, 0], [4065, "Sashaka", 126, 165, 0], [4066, "Katara", 96, 147, 0], [4067, "Muka", 154, 189, 0], [4068, "Tuphara", 142, 175, 0], [4069, "Kshanika", 147, 201, 0], [4070, "Ajani", 110, 170, 0], [4071, "Ayas", 177, 216, 0], [4072, "Kutsa", 166, 201, 0], [4111, "Basic Cane", 4, 6, 2], [4112, "Cane", 6, 8, 2], [4113, "Jamia", 13, 16, 2], [4114, "Jamia of The Earth", 13, 16, 2], [4115, "Rambha", 24, 29, 2], [4116, "Vajradhara", 35, 42, 2], [4117, "Vajra", 43, 53, 2], [4118, "Zalas", 54, 66, 2], [4119, "Pinaka", 63, 77, 2], [4120, "Vettra", 69, 84, 2], [4121, "Kalavettra", 78, 95, 2], [4122, "Staff of Mantraka", 7, 9, 2], [4123, "Dordanda", 84, 103, 2], [4124, "Pumati Akama", 91, 111, 2], [4125, "Khasa", 97, 120, 2], [4126, "Matrika", 105, 131, 2], [4127, "Hatha", 115, 139, 2], [4141, "Blade of Bahamut", 6, 7, 0], [4142, "Shamshir of Adana", 11, 13, 0], [4143, "Pata of Grapa", 19, 21, 0], [4144, "Kindjal of Deadly Poison", 27, 29, 0], [4145, "Ara of Deadly Poison", 32, 36, 0], [4146, "Rada Kora of Adana", 38, 42, 0], [4147, "Talwar of The Warrior", 46, 50, 0], [4148, "Talwar of Primitive Warrior", 51, 55, 0], [4149, "Sumati Scimitar of Bahamut", 55, 61, 0], [4150, "Rada Sarpa of Adana", 59, 65, 0], [4151, "Rada Zakukana of Grapa", 63, 69, 0], [4152, "Short Blade of Bahamut", 4, 5, 0], [4153, "Jambiya of Adana", 7, 11, 0], [4154, "Kris of Grapa", 12, 18, 0], [4155, "Asira of Ajaka", 17, 25, 0], [4156, "Hima Kindjar", 24, 36, 0], [4157, "Suraka of The Muscle", 29, 43, 0], [4158, "Suraka of The Wild Beast", 29, 43, 0], [4159, "Gatokas Jasa of Ajaka", 31, 47, 0], [4160, "Sumati Sinamusti of Bahamut", 35, 52, 0], [4161, "Rada Krpana Adana", 37, 56, 0], [4162, "Rada Kaskara of Grapa", 40, 59, 0], [4163, "Hand Axe of Bahamut", 6, 9, 0], [4164, "Parashu of Adana", 13, 17, 0], [4165, "Suvas of Grapa", 21, 29, 0], [4166, "Kisu of Primative Warrior", 30, 40, 0], [4167, "Gatokaga Kuriza of Bahamut", 36, 49, 0], [4168, "Hirana of Deadly Poison", 49, 66, 0], [4169, "Sumati Hirana of Grapa", 49, 66, 0], [4170, "Gatokaga Ksarika of Ajaka", 55, 75, 0], [4171, "Sumadi Bahasti of Bahamut", 62, 83, 0], [4172, "Rada Prazas of Adana", 66, 89, 0], [4173, "Rada Kalaparashu of Grapa", 70, 95, 0], [4174, "Mas of Adana", 14, 17, 0], [4175, "Kaja of Mara", 23, 28, 0], [4176, "Danda of Ajaka", 32, 39, 0], [4177, "Ghana of The Muscle", 54, 66, 0], [4178, "Lagda of Tapas", 45, 55, 0], [4179, "Hima Ghana", 54, 66, 0], [4180, "Ghana of Mantra", 54, 66, 0], [4181, "Sumati Musara of Bahamut", 68, 83, 0], [4182, "Rada Lagdahasta of Adana", 74, 91, 0], [4183, "Staff of Bahamut", 6, 8, 2], [4184, "Earth Zamia", 13, 16, 2], [4185, "Rambha of Grapa", 24, 29, 2], [4186, "Agni Vajradhara", 35, 42, 2], [4187, "Hima Zalas", 54, 66, 2], [4188, "Rautii Zalas", 54, 66, 2], [4189, "Sumati Pinaka of Grapa", 60, 74, 2], [4190, "Gatokaga Vettra of Ajaka", 67, 82, 2], [4191, "Sumati Kalavettra of Bahamut", 71, 87, 2], [4192, "Kindjal of Charge", 27, 29, 0], [4193, "Strong Ara", 32, 36, 0], [4194, "Bisa Dantaka", 46, 50, 0], [4195, "Strong Kisu", 30, 40, 0], [4196, "Agni Kisu", 30, 40, 0], [4197, "Ru Vajradhara", 35, 42, 2], [4198, "Vajra of The Dead", 43, 53, 2], [4199, "Datu Avrahta", 88, 96, 1], [4201, "Datu Kalanaka", 58, 86, 1], [4202, "Datu Chid", 93, 126, 1], [4203, "Datu Pariga", 101, 123, 1], [4204, "Datu Dordanda (Clone)", 92, 113, 1], [4205, "Datu Dordanda", 92, 113, 1], [4206, "Datu Nheutou", 105, 125, 1], [4207, "Datu Rhomphaia", 83, 115, 1], [4208, "Datu Gatova Guna", 124, 148, 1], [4209, "Datu Khudama", 123, 158, 1], [4210, "Datu Azuri", 128, 153, 1], [4211, "Datu Khrati", 100, 142, 1], [4212, "Datu Taguka", 148, 182, 1], [4213, "Datu Khapouta", 141, 170, 1], [4214, "Forbidden Sword of Azuri", 116, 141, 0], [4215, "Forbidden Dagger of Khrati", 88, 130, 0], [4216, "Forbidden Axe of Taguka", 136, 170, 0], [4217, "Forbidden Weapon of Khapouta", 129, 158, 0], [4218, "Datu Sashaka", 150, 189, 0], [4219, "Datu Katara", 120, 171, 0], [4220, "Datu Muka", 178, 213, 0], [4221, "Datu Tuphara", 166, 199, 0], [4226, "Datu Kshanika", 178, 223, 0], [4227, "Datu Ajani", 133, 190, 0], [4228, "Datu Ayas", 186, 227, 0], [4229, "Datu Kutsa", 190, 226, 0], [4251, "Datu Pumati Akama", 95, 115, 1], [4252, "Datu Khasa", 117, 140, 1], [4253, "Forbidden Staff of Khasa", 105, 128, 0], [4254, "Datu Matrika", 125, 151, 2], [4256, "Datu Hatha", 118, 144, 2], [4281, "Sword of Zarku Rudhira", 35, 43, 0], [4282, "Axe of Ulkamuka Kaura", 40, 48, 0], [4283, "Hammer of Srbinda Satvan", 38, 45, 0], [4291, "Strong Sword of Vartan", 15, 17, 0], [4292, "Sword of the Great Bear", 30, 35, 0], [4301, "Para", 30, 33, 1], [4302, "Paraga", 47, 51, 1], [4303, "Pattra", 60, 66, 1], [4304, "Kukri", 73, 81, 1], [4305, "Asirata", 90, 99, 1], [4306, "Chandrapata", 103, 114, 1], [4307, "Ananta Pata", 116, 129, 1], [4308, "Kunta", 11, 17, 1], [4309, "Pattiza", 22, 34, 1], [4310, "Trizra", 37, 56, 1], [4311, "Braha", 52, 78, 1], [4312, "Trizika", 67, 101, 1], [4313, "Angkus", 87, 130, 1], [4314, "Angkus of Spirit", 87, 130, 1], [4315, "Ardenu", 102, 154, 1], [4316, "Buji", 114, 171, 1], [4317, "Tomara", 126, 189, 1], [4318, "Kanaka Jakti", 138, 207, 1], [4319, "Zaruparashu", 21, 29, 1], [4320, "Tabarzin", 32, 43, 1], [4321, "Berdysh", 50, 68, 1], [4322, "Tarbar", 64, 87, 1], [4323, "Rohiparaz", 81, 110, 1], [4324, "Parazvada", 96, 130, 1], [4325, "Parazudara", 111, 150, 1], [4326, "Mahoraska", 126, 170, 1], [4327, "Old Gauntlet", 3, 4, 0], [4328, "Gauntlet", 8, 9, 0], [4329, "Varti", 15, 18, 0], [4330, "Earth Varti", 15, 18, 0], [4331, "Nakhara", 25, 31, 0], [4332, "Musti", 35, 43, 0], [4333, "Kesarin", 43, 52, 0], [4334, "Karasna", 53, 65, 0], [4335, "Katar", 61, 74, 0], [4336, "Katar of Spirit", 61, 74, 0], [4337, "Karanka", 69, 84, 0], [4338, "Parazpa", 77, 94, 0], [4339, "Padanaka", 85, 103, 0], [4340, "Yadas", 93, 113, 0], [4341, "Nirvana's Gloves", 9, 10, 0], [4342, "Kanjin", 133, 147, 1], [4343, "Jaktima", 154, 230, 1], [4344, "Vifla", 141, 190, 1], [4345, "Potra", 106, 129, 0], [4346, "Vikoj", 152, 174, 1], [4347, "Khatu", 178, 264, 1], [4348, "Khakara", 160, 223, 1], [4349, "Madanti", 119, 150, 0], [4350, "Ahksara", 176, 203, 1], [4351, "Tagukabatou", 186, 256, 1], [4352, "Atari", 215, 289, 1], [4353, "Ratuni", 132, 173, 0], [4354, "Pazuta", 152, 201, 0], [4355, "Parjaba", 227, 315, 1], [4356, "Pasana", 250, 317, 1], [4357, "Nikartu", 203, 243, 1], [4358, "Rahari", 173, 224, 0], [4359, "Hasta", 286, 342, 1], [4360, "Arka", 272, 367, 1], [4361, "Vidaka", 230, 285, 1], [4411, "Bip", 21, 26, 2], [4412, "Arana", 39, 47, 2], [4413, "Bhramadanda", 53, 65, 2], [4414, "Masuvera", 67, 82, 2], [4415, "Pataka", 81, 99, 2], [4416, "Pataka of The Earth", 81, 99, 2], [4417, "Yasticala", 95, 116, 2], [4418, "Basayasti", 106, 129, 2], [4419, "Vettrayasti", 120, 147, 2], [4420, "Sidhazana", 131, 160, 2], [4421, "Udanda", 131, 160, 2], [4422, "Dotra", 141, 173, 2], [4423, "Byotra", 146, 179, 2], [4424, "Sunietora", 162, 193, 2], [4425, "Kona", 181, 210, 2], [4426, "Tinajakara", 201, 230, 2], [4441, "Para of Adana", 30, 33, 1], [4442, "Paraga of Grapa", 47, 51, 1], [4443, "Strong Pattra", 60, 66, 1], [4444, "Rauti Kukri", 73, 81, 1], [4445, "Sumati Asirata of Grapa", 86, 96, 1], [4446, "Sumati Chandrapata of Bahamut", 100, 110, 1], [4447, "Rada Ananta Pata of Grapa", 110, 121, 1], [4448, "Kunta of Adana", 11, 17, 1], [4449, "Patizza of Grapa", 22, 34, 1], [4450, "Trizra of Ajaka", 37, 56, 1], [4451, "Gatokaga Braha of Bahamut", 52, 78, 1], [4452, "Trijika of Destruction", 67, 101, 1], [4453, "Yakatu Engkus", 87, 130, 1], [4454, "Gatokaga Ardenu of Ajaka", 93, 140, 1], [4455, "Sumati Buji of Bahamut", 104, 156, 1], [4456, "Rada Tomara of Adana", 115, 173, 1], [4457, "Rada Kanaka Jakti of Grapa", 123, 184, 1], [4458, "Zaruparashu of Adana", 21, 29, 1], [4459, "Tabarzin of Grapa", 32, 43, 1], [4460, "Ru Berdysh", 50, 68, 1], [4461, "Gatokaga Tarbar of Bahamut", 64, 87, 1], [4462, "Rohiparaz of The Dead", 81, 110, 1], [4463, "Sumati Parazvada of Grapa", 93, 126, 1], [4464, "Sumati Parazudara of Bahamut", 107, 145, 1], [4465, "Rada Mahoraska of Grapa", 118, 159, 1], [4466, "Gauntlet of Bahamut", 8, 9, 0], [4467, "Varti of Adana", 15, 18, 0], [4468, "Nakhara of Mara", 25, 31, 0], [4469, "Musti of Ajaka", 30, 37, 0], [4470, "Gatokaki Kesarin of Bahamut", 38, 46, 0], [4471, "Tapas Karasna", 53, 65, 0], [4472, "Karasna of Guhsu", 53, 65, 0], [4473, "Gatokaga Karanka of Ajaka", 60, 74, 0], [4474, "Sumati Parazpa of Bahamut", 68, 83, 0], [4475, "Rada Padanaka of Adana", 76, 92, 0], [4476, "Rada Yadas of Grapa", 83, 102, 0], [4477, "Hima Berdysh", 50, 68, 1], [4478, "Strong Berdysh", 50, 68, 1], [4479, "Trizika of Life", 67, 101, 1], [4480, "Pattra of Destruction", 60, 66, 1], [4481, "Pattra of Fortune", 60, 66, 1], [4482, "Datu Vikoj", 159, 185, 1], [4483, "Datu Khatu", 189, 278, 1], [4484, "Datu Khakara", 171, 236, 1], [4485, "Datu Madanti", 125, 158, 1], [4486, "Datu Ratuni", 156, 197, 1], [4487, "Datu Atari", 245, 319, 1], [4488, "Datu Tagukabatou", 216, 286, 1], [4489, "Datu Ahksara", 206, 233, 1], [4490, "Forbidden Claw of Ratuni", 144, 185, 0], [4491, "Forbidden Spear of Atari", 227, 301, 0], [4492, "Forbidden Axe of Tagukabatou", 198, 268, 0], [4493, "Forbidden Sword of Ahksara", 188, 215, 0], [4494, "Datu Pazuta", 182, 231, 0], [4495, "Datu Pasana", 286, 353, 1], [4496, "Datu Parjaba", 263, 351, 1], [4497, "Datu Nikartu", 239, 279, 1], [4501, "Datu Arka", 301, 380, 1], [4502, "Datu Vidaka", 260, 302, 1], [4503, "Datu Hasta", 313, 387, 1], [4504, "Datu Rahari", 210, 262, 0], [4551, "Bip of Grapa", 21, 26, 2], [4552, "Arana of Ajaka", 39, 47, 2], [4553, "Gatokaga Bhramadanda of Bahamut", 53, 65, 2], [4554, "Agni Masuvera", 67, 82, 2], [4555, "Pataka of Flame", 81, 99, 2], [4556, "Gatokaga Yasticala of Ajaka", 92, 112, 2], [4557, "Sumati Bazayasti of Bahamut", 102, 125, 2], [4558, "Rada Vettrayasti of Adana", 109, 134, 2], [4559, "Rada Sidhajana of Grapa", 116, 142, 2], [4560, "Datu Kanjin", 146, 161, 1], [4561, "Datu Jaktima", 169, 253, 1], [4562, "Datu Vifla", 155, 209, 1], [4563, "Datu Potra", 116, 141, 1], [4564, "Datu Dotra", 151, 184, 1], [4565, "Datu Byotra", 154, 188, 1], [4566, "Datu Sunietora", 192, 223, 1], [4567, "Forbidden Staff of Sunietora", 174, 205, 0], [4568, "Datu Kona", 217, 246, 2], [4570, "Datu Tinajakara", 210, 236, 2], [4581, "Sword of Ananga", 0, 0, 1], [4582, "Sword of Ananga Dvanta", 50, 57, 1], [4583, "Spear of Zarku", 0, 0, 1], [4584, "Balasta Spear", 0, 0, 1], [4589, "Kaladanda of Meghamalin", 0, 0, 2], [4601, "Danva", 15, 22, 1], [4602, "Capa", 29, 44, 1], [4603, "Pakala", 44, 66, 1], [4604, "Hastacapa", 55, 83, 1], [4605, "Urnacapa", 73, 109, 1], [4606, "Rhodapacapa", 85, 127, 1], [4607, "Darapacapa", 97, 145, 1], [4608, "Vakuracapa", 106, 159, 1], [4609, "Fuspacapa", 118, 177, 1], [4610, "Khandiva", 134, 198, 1], [4611, "Bao", 150, 219, 1], [4612, "Jargin", 169, 246, 1], [4613, "Astra", 191, 275, 1], [4646, "Danva of Adana", 15, 22, 1], [4647, "Capa of Grapa", 29, 44, 1], [4648, "Pakala of Ajaka", 44, 66, 1], [4649, "Strong Hastacapa", 55, 83, 1], [4650, "Hastacapa of Deadly Poison", 55, 83, 1], [4651, "Agni Urnacapa", 73, 109, 1], [4652, "Sumati Darapacapla of Bahamut", 90, 135, 1], [4653, "Rada Bakurakapa of Grapa", 96, 144, 1], [4654, "Datu Fuspakapa", 129, 194, 1], [4655, "Datu Khandiva", 146, 209, 1], [4656, "Datu Bao", 174, 243, 1], [4657, "Forbidden Bow of Bao", 158, 227, 0], [4658, "Datu Jargin", 205, 282, 1], [4660, "Datu Astra", 224, 293, 1], [5001, "Chori Armor", 20, 0, 3], [5002, "Acchada Armor", 30, 0, 3], [5003, "Acchada Armor of Protection", 30, 0, 3], [5004, "Varman Armor", 40, 0, 3], [5005, "Trana Plate", 108, 0, 3], [5006, "Jalaka Plate", 129, 0, 3], [5007, "Amsatra Plate", 184, 0, 3], [5008, "Amsatra Plate of Darkness", 184, 0, 3], [5009, "Tanuvarman Plate", 220, 0, 3], [5010, "Kalatanuvarman Plate", 265, 0, 3], [5011, "Vadati Suit", 75, 0, 3], [5012, "Jayati Suit", 90, 0, 3], [5013, "Prathana Suit", 129, 0, 3], [5014, "Prathana Suit of Darnkess", 129, 0, 3], [5015, "Karyanimaya Suit", 154, 0, 3], [5016, "Tars Garb", 86, 0, 3], [5017, "Samyuga Garb", 103, 0, 3], [5018, "Pradana Garb", 147, 0, 3], [5019, "Pradana Garb of Darkness", 147, 0, 3], [5020, "Zastrakali Garb", 176, 0, 3], [5021, "Varabana Robe", 64, 0, 3], [5022, "Visamnnaha Robe", 76, 0, 3], [5023, "Kajcuka Robe", 109, 0, 3], [5024, "Kajcuka Robe of Darkness Robe", 109, 0, 3], [5025, "Jalavala Robe", 130, 0, 3], [5026, "Vanutija Plate", 90, 0, 3], [5027, "Varahaja Plate", 154, 0, 3], [5028, "Tanadatt Suit", 63, 0, 3], [5029, "Nuhavati Suit", 108, 0, 3], [5030, "Muresan Garb", 72, 0, 3], [5031, "Rajastanv Garb", 123, 0, 3], [5032, "Gayatri Robe", 54, 0, 3], [5033, "Sahasrara Robe", 91, 0, 3], [5034, "Vikavaka Plate", 265, 0, 3], [5035, "Kakuta Suit", 184, 0, 3], [5036, "Samahana Garb", 211, 0, 3], [5037, "Jalabant Robe", 156, 0, 3], [5038, "Aruta Plate", 303, 0, 3], [5039, "Shinra Suit", 211, 0, 3], [5040, "Kharyadin Garb", 242, 0, 3], [5041, "Vharumica Robe", 179, 0, 3], [5042, "Piezur Armor", 347, 0, 3], [5043, "Soupuro Suit", 241, 0, 3], [5044, "Adier Garb", 276, 0, 3], [5045, "Sitah Robe", 205, 0, 3], [5046, "Bahulra Armor", 399, 0, 3], [5047, "Amuti Suit", 277, 0, 3], [5048, "Guda Garb", 319, 0, 3], [5049, "Nugama Robe", 235, 0, 3], [5050, "Mahas Armor", 458, 0, 3], [5051, "Rakuta Armor", 316, 0, 3], [5052, "Balavita Robe", 362, 0, 3], [5053, "Nukarna Robe", 269, 0, 3], [5071, "Gana of Bahamut", 20, 0, 3], [5072, "Acchada Armor of Adana", 30, 0, 3], [5073, "Varman Armor of Grapa", 40, 0, 3], [5074, "Trana Plate of Ajaka", 108, 0, 3], [5075, "Gatokaga Jalaka Plate of Bahamut", 129, 0, 3], [5076, "Sumati Amsatra Plate of Grapa", 184, 0, 3], [5077, "Sumati Tanuvarman Plate of Bahamut", 220, 0, 3], [5078, "Rada Kalatanuvarman Plate of Grapa", 265, 0, 3], [5079, "Vadati Suit of Ajaka", 75, 0, 3], [5080, "Gatokaga Jayati Suit of Bahamut", 90, 0, 3], [5081, "Sumati Pratana Suit of Grapa", 129, 0, 3], [5082, "Sumati Karyanimaya Suit of Bahamut", 154, 0, 3], [5083, "Tars Garb of Ajaka", 86, 0, 3], [5084, "Gatokaga Samyuga Garb of Bahamut", 103, 0, 3], [5085, "Sumati Pradana Garb of Grapa", 147, 0, 3], [5086, "Sumati Zastrakali Garb of Bahamut", 176, 0, 3], [5087, "Varabana Robe of Ajaka", 64, 0, 3], [5088, "Gatokaga Visamnnaha Robe of Bahamut", 76, 0, 3], [5089, "Sumati Kajcuka Robe of Grapa", 109, 0, 3], [5090, "Sumati Jalavala Robe of Bahamut", 130, 0, 3], [5091, "Forbidden plate of Aruta", 303, 0, 3], [5092, "Forbidden suit of Shinra", 211, 0, 3], [5093, "Forbidden garb of Kharyadin", 242, 0, 3], [5094, "Forbidden robe of Vharumica", 179, 0, 3], [5095, "Forbidden Plate of Piezur", 365, 0, 3], [5096, "Forbidden Suit of Soupuro", 259, 0, 3], [5097, "Forbidden Garb of Adier", 294, 0, 3], [5098, "Forbidden Robe of Sitah", 223, 0, 3], [5099, "Forbidden Armor from the Sun", 265, 0, 3], [5100, "Ranti Kalatanubarman Armor", 235, 0, 3], [5101, "Havana Kalatanubarman Armor", 235, 0, 3], [5102, "Kanada Bahulra Armor", 426, 0, 3], [5103, "Kanada Amuti Suit", 304, 0, 3], [5104, "Kanada Guda Garb", 346, 0, 3], [5105, "Kanada Nugama Robe", 262, 0, 3], [5106, "Agni Mayas Armor", 458, 0, 3], [5107, "Agni Laguta Armor", 316, 0, 3], [5108, "Agni Arbita Robe", 362, 0, 3], [5109, "Agni Nukarna Robe", 269, 0, 3], [5110, "Hima Mayasi Armor", 458, 0, 3], [5111, "Hima Laguta Armor", 316, 0, 3], [5112, "Hima Arbita Robe", 362, 0, 3], [5113, "Hima Nukarna Robe", 269, 0, 3], [5114, "Mayasi Luvati Armor", 458, 0, 3], [5115, "Laguta Luvati Armor", 316, 0, 3], [5116, "Arbita Luvati Armor", 362, 0, 3], [5117, "Nukarna Luvati Armor", 269, 0, 3], [5141, "Eka Armor", 458, 0, 3], [5142, "Adbaya", 316, 0, 3], [5143, "Ganeza Robe", 362, 0, 3], [5144, "Adbati Robe", 269, 0, 3], [5149, "Chori Armor", 22, 0, 3], [5151, "Chori Pants", 16, 0, 3], [5152, "Acchada Pants", 24, 0, 3], [5153, "Varman Pants", 30, 0, 3], [5154, "Trana Pants", 64, 0, 3], [5155, "Jalaka Pants", 77, 0, 3], [5156, "Amsatra Pants", 110, 0, 3], [5157, "Tanuvarman Pants", 132, 0, 3], [5158, "Kalatanuvarman Pants", 159, 0, 3], [5159, "Vadati Pants", 45, 0, 3], [5160, "Jayati Pants", 54, 0, 3], [5161, "Pratana Pants", 77, 0, 3], [5162, "Karyanimaya Pants", 92, 0, 3], [5163, "Tars Pants", 51, 0, 3], [5164, "Samyuga Pants", 61, 0, 3], [5165, "Pradana Pants", 88, 0, 3], [5166, "Zastrakali Pants", 105, 0, 3], [5167, "Varabana Pants", 38, 0, 3], [5168, "Visamnnaha Pants", 45, 0, 3], [5169, "Kajcuka Pants", 65, 0, 3], [5170, "Jalavala Pants", 78, 0, 3], [5171, "Vanutija Pants", 54, 0, 3], [5172, "Varahaja Pants", 92, 0, 3], [5173, "Tanadatt Pants", 37, 0, 3], [5174, "Nuhavati Pants", 64, 0, 3], [5175, "Muresan Pants", 43, 0, 3], [5176, "Rajastanv Pants", 73, 0, 3], [5177, "Gayatri Pants", 32, 0, 3], [5178, "Sahasrara Pants", 54, 0, 3], [5179, "Vikavaka Pants", 158, 0, 3], [5180, "Kakuta Pants", 110, 0, 3], [5181, "Samahana Pants", 126, 0, 3], [5182, "Jalabant Pants", 93, 0, 3], [5183, "Aruta Pants", 181, 0, 3], [5184, "Shinra Pants", 126, 0, 3], [5185, "Kharyadin Pants", 145, 0, 3], [5186, "Vharumica Pants", 107, 0, 3], [5187, "Piezur Pants", 207, 0, 3], [5188, "Soupuro Pants", 144, 0, 3], [5189, "Adier Pants", 167, 0, 3], [5190, "Sitah Pants", 123, 0, 3], [5191, "Bahulra Pants", 239, 0, 3], [5192, "Amuti Pants", 166, 0, 3], [5193, "Guda Pants", 191, 0, 3], [5194, "Nugama Pants", 141, 0, 3], [5196, "Zvas of Buhamut", 16, 0, 3], [5197, "Acchada Pants of Adana", 24, 0, 3], [5198, "Varman Pants of Grapa", 30, 0, 3], [5199, "Trana Pants of Ajaka", 64, 0, 3], [5200, "Gatokaga Jalaka Pants of Bahamut", 77, 0, 3], [5201, "Sumati Amsatra Pants of Grapa", 110, 0, 3], [5202, "Sumati Tanuvarman Pants of Bahamut", 132, 0, 3], [5203, "Rada Kalatanuvarman Pants of Grapa", 159, 0, 3], [5204, "Vadati Pants of Ajaka", 45, 0, 3], [5205, "Gatokaga Jayati Pants of Bahamut", 54, 0, 3], [5206, "Sumati Pratana Pants of Grapa", 77, 0, 3], [5207, "Sumati Karyanimaya Pants of Bahamut", 92, 0, 3], [5208, "Tars Pants of Ajaka", 51, 0, 3], [5209, "Gatokaga Samyuga Pants of Bahamut", 61, 0, 3], [5210, "Sumati Pradana Pants of Grapa", 88, 0, 3], [5211, "Sumati Zastrakali Pants of Bahamut", 105, 0, 3], [5212, "Varabana Pants of Ajaka", 38, 0, 3], [5213, "Gatokaga Visamnnaha Pants of Bahamut", 45, 0, 3], [5214, "Sumati Kajcuka Pants of Grapa", 65, 0, 3], [5215, "Sumati Jalavala Pants of Bahamut", 78, 0, 3], [5216, "Forbidden Pants of Piezur", 225, 0, 3], [5217, "Forbidden Pants of Soupuro", 162, 0, 3], [5218, "Forbidden Pants of Adier", 185, 0, 3], [5219, "Forbidden Pants of Sitah", 141, 0, 3], [5220, "Forbidden Pants from the Sun", 159, 0, 3], [5221, "Ranti Kalatanubarman Pants", 141, 0, 3], [5222, "Hanaka Kalatanubarman Pants", 141, 0, 3], [5223, "Kanada Bahulra Pants", 266, 0, 3], [5224, "Kanada Amuti Pants", 193, 0, 3], [5225, "Kanada Guda Pants", 218, 0, 3], [5226, "Kanada Nugama Pants", 168, 0, 3], [5227, "Agni Mayas Pants", 273, 0, 3], [5228, "Agni Laguta Pants", 191, 0, 3], [5229, "Agni Arbita Pants", 218, 0, 3], [5230, "Agni Nukarna Pants", 161, 0, 3], [5231, "Hima Mayasi Pants", 273, 0, 3], [5232, "Hima Laguta Pants", 191, 0, 3], [5233, "Hima Arbita Pants", 218, 0, 3], [5234, "Hima Nukarna Pants", 161, 0, 3], [5235, "Mayasi Luvati Pants", 273, 0, 3], [5236, "Laguta Luvati Pants", 191, 0, 3], [5237, "Arbita Luvati Pants", 218, 0, 3], [5238, "Nukarna Luvati Pants", 161, 0, 3], [5241, "Eka Pants", 273, 0, 3], [5242, "Adbaya Pants", 191, 0, 3], [5243, "Ganeza Pants", 218, 0, 3], [5244, "Adbati Pants", 161, 0, 3], [5249, "Chori Pants", 18, 0, 3], [5251, "Head Band", 4, 0, 4], [5252, "Trate", 8, 0, 4], [5253, "Zipra", 12, 0, 4], [5254, "Zipura Helm", 32, 0, 3], [5255, "Jala Helm", 38, 0, 3], [5256, "Mukuta Helm", 55, 0, 3], [5257, "Shishak Helm", 66, 0, 3], [5258, "Shishak of Darkness", 66, 0, 3], [5259, "Hirizipra Helm", 79, 0, 3], [5260, "Ziromani Hood", 22, 0, 3], [5261, "Maya Hood", 27, 0, 3], [5262, "Bitaka Hood", 38, 0, 3], [5263, "Yuvaraja Hood", 46, 0, 3], [5264, "Yuvaraja of Darkness", 46, 0, 3], [5265, "Lothana Crown", 25, 0, 3], [5266, "Sazirsan Crown", 30, 0, 3], [5267, "Savestana Crown", 44, 0, 3], [5268, "Kezakezi Crown", 52, 0, 3], [5269, "Kezakezi of Darkness", 52, 0, 3], [5270, "Darbi Hat", 19, 0, 3], [5271, "Pana Hat", 22, 0, 3], [5272, "Kalapana Hat", 32, 0, 3], [5273, "Darbikara Hat", 39, 0, 3], [5274, "Darbikara of Darkness", 39, 0, 3], [5275, "Zipura of Saranu", 45, 0, 3], [5276, "Ziromani of Saranu", 32, 0, 3], [5277, "Lothana of Saranu", 36, 0, 3], [5278, "Darbi of Saranu", 27, 0, 3], [5279, "Vanutija Helm", 27, 0, 3], [5300, "Varahaja Helm", 46, 0, 3], [5301, "Tanadatt Hood", 18, 0, 3], [5302, "Nuhavati Hood", 32, 0, 3], [5303, "Mount Murae Crown", 21, 0, 3], [5304, "Rajastanv Crown", 36, 0, 3], [5305, "Gayatri Hat", 16, 0, 3], [5306, "Sahasrara Hat", 27, 0, 3], [5307, "Vikavaka Helm", 79, 0, 3], [5308, "Kakuta Hood", 55, 0, 3], [5309, "Samahana Crown", 63, 0, 3], [5310, "Jalabant Hat", 46, 0, 3], [5311, "Aruta Helm", 90, 0, 3], [5312, "Shinra Hood", 63, 0, 3], [5313, "Kharyadin Crown", 72, 0, 3], [5314, "Vharumica Hat", 53, 0, 3], [5315, "Piezur Helm", 102, 0, 3], [5316, "Soupuro Hood", 72, 0, 3], [5317, "Adier Crown", 82, 0, 3], [5318, "Sitah Hat", 61, 0, 3], [5321, "Jirastra of Bahamut", 4, 0, 4], [5322, "Trate of Adana", 8, 0, 4], [5323, "Zipra of Grapa", 12, 0, 4], [5324, "Zipra of Ajaka", 32, 0, 3], [5325, "Gatokaga Jalaka of Bahamut", 38, 0, 3], [5326, "Sumati Mukuta of Grapa", 55, 0, 3], [5327, "Sumati Shishak of Bahamut", 66, 0, 3], [5328, "Rada Hirizipra of Grapa", 79, 0, 3], [5329, "Ziromani of Ajaka", 22, 0, 3], [5330, "Gatokaga Maya of Bahamut", 27, 0, 3], [5331, "Sumati Bitika of Grapa", 38, 0, 3], [5332, "Sumati Yuvaraja of Bahamut", 46, 0, 3], [5333, "Lothana of Ajaka", 25, 0, 3], [5334, "Gatokaga Sazirsan of Bahamut", 30, 0, 3], [5335, "Sumati Savestana of Grapa", 44, 0, 3], [5336, "Sumati Kezakezi of Bahamut", 52, 0, 3], [5337, "Darbi of Ajaka", 19, 0, 3], [5338, "Gatokaga Pana of Bahamut", 22, 0, 3], [5339, "Sumati Kalapana of Grapa", 32, 0, 3], [5340, "Sumati Darbikara of Bahamut", 39, 0, 3], [5379, "Brahman Valastha", 79, 0, 4], [5380, "Brahman Thisya", 55, 0, 4], [5381, "Brahman Hotra", 63, 0, 4], [5382, "Brahman Sadaka", 46, 0, 4], [5383, "Vishnite Valastha", 79, 0, 4], [5384, "Vishnite Thisya", 55, 0, 4], [5385, "Vishnite Hotra", 63, 0, 4], [5386, "Vishnite Sadaka", 46, 0, 4], [5387, "Shivan Valastha", 79, 0, 4], [5388, "Shivan Thisya", 55, 0, 4], [5389, "Shivan Hotra", 63, 0, 4], [5390, "Shivan Sadaka", 46, 0, 4], [5391, "Eka", 136, 0, 3], [5392, "Advaya", 95, 0, 3], [5393, "Ganeja", 109, 0, 3], [5394, "Advati", 80, 0, 3], [5399, "Head Band", 6, 0, 4], [5401, "Chori Gloves", 3, 0, 4], [5402, "Acchada Gloves", 5, 0, 4], [5403, "Varman Gloves", 7, 0, 4], [5404, "Trana Gauntlets", 21, 0, 3], [5405, "Jalaka Gauntlets", 25, 0, 3], [5406, "Amsatra Gauntlets", 36, 0, 3], [5407, "Tanuvarman Gauntlets", 44, 0, 3], [5408, "Kalatanuvarman Gauntlets", 53, 0, 3], [5409, "Vadati Knuckle Guards", 15, 0, 3], [5410, "Jayati Knuckle Guards", 18, 0, 3], [5411, "Pratana Knuckle Guards", 25, 0, 3], [5412, "Karyanimaya Knuckle Guards", 30, 0, 3], [5413, "Tars Gloves", 17, 0, 3], [5414, "Samyuga Gloves", 20, 0, 3], [5415, "Pradana Gloves", 29, 0, 3], [5416, "Zastrakali Gloves", 35, 0, 3], [5417, "Varabana Mittens", 12, 0, 3], [5418, "Visamnnaha Mittens", 15, 0, 3], [5419, "Kajcuka Mittens", 21, 0, 3], [5420, "Jalavala Mittens", 26, 0, 3], [5421, "Vanutija Gauntlets", 18, 0, 3], [5422, "Varahaja Gauntlets", 30, 0, 3], [5423, "Tanadatt Knuckle Guards", 12, 0, 3], [5424, "Nuhavati Knuckle Guards", 21, 0, 3], [5425, "Muresan Gloves", 14, 0, 3], [5426, "Rajastanv Gloves", 24, 0, 3], [5427, "Gayatri Mittens", 10, 0, 3], [5428, "Sahasrara Mittens", 18, 0, 3], [5429, "Vikavaka Gauntlets", 53, 0, 3], [5430, "Kakuta Knuckle Guards", 36, 0, 3], [5431, "Samahana Gloves", 42, 0, 3], [5432, "Jalabant Mittens", 31, 0, 3], [5433, "Aruta Gauntlets", 60, 0, 3], [5434, "Shinra Knuckle Guards", 42, 0, 3], [5435, "Kharyadin Gloves", 48, 0, 3], [5436, "Vharumica Mittens", 35, 0, 3], [5437, "Piezur Gauntlets", 68, 0, 3], [5438, "Soupuro Knuckle Guards", 49, 0, 3], [5439, "Adier Gloves", 55, 0, 3], [5440, "Sitah Mittens", 39, 0, 3], [5441, "Bahulra Gauntlets", 79, 0, 3], [5442, "Amuti Knuckle Guards", 57, 0, 3], [5443, "Guda Gloves", 63, 0, 3], [5444, "Nugama Mittens", 47, 0, 3], [5446, "Naka of Bahamut", 3, 0, 4], [5447, "Acchada Gloves of Adana", 5, 0, 4], [5448, "Varman Gloves of Grapa", 7, 0, 4], [5449, "Trana Gauntlets of Ajaka", 21, 0, 3], [5450, "Gatokaga Jalaka Gauntlets of Bahamut", 25, 0, 3], [5451, "Sumati Amsatra Gauntlets of Grapa", 36, 0, 3], [5452, "Sumati Tanuvarman Gauntlets of Bahamut", 44, 0, 3], [5453, "Rada Kalatanuvarman Gauntlets of Grapa", 53, 0, 3], [5454, "Vadati Knuckle Guards of Ajaka", 15, 0, 3], [5455, "Gatokaga Jayati Knuckle Guards of Bahamut", 18, 0, 3], [5456, "Sumati Pratana Knuckle Guards of Grapa", 25, 0, 3], [5457, "Sumati Karyanimaya Knuckle Guards of Bahamut", 30, 0, 3], [5458, "Tars Gloves of Ajaka", 17, 0, 3], [5459, "Gatokaga Samyuga Gloves of Bahamut", 20, 0, 3], [5460, "Sumati Pradana Gloves of Grapa", 29, 0, 3], [5461, "Sumati Zastrakali Gloves of Bahamut", 35, 0, 3], [5462, "Varabana Mittens of Ajaka", 12, 0, 3], [5463, "Gatokaga Visamnnaha Mittens of Bahamut", 15, 0, 3], [5464, "Sumati Kajcuka Mittens of Grapa", 21, 0, 3], [5465, "Sumati Jalavala Mittens of Bahamut", 26, 0, 3], [5466, "Forbidden Gauntlets of Aruta", 60, 0, 3], [5467, "Forbidden Knuckle Guards of Shinra", 42, 0, 3], [5468, "Forbidden Gloves of Kharyadin", 48, 0, 3], [5469, "Forbidden Mittens of Vharumica", 35, 0, 3], [5470, "Forbidden Gloves from the Sun", 53, 0, 4], [5471, "Ranti Kalatanubarman Gloves", 47, 0, 3], [5472, "Habaka Kalatanubarman Gloves", 47, 0, 3], [5473, "Kanada Bahulra Gauntlets", 88, 0, 3], [5474, "Kanada Amuti Knuckle Guards", 64, 0, 3], [5475, "Kanada Guda Gloves", 72, 0, 3], [5476, "Kanada Nugama Mittens", 56, 0, 3], [5477, "Forbidden Gauntlets of Piezur", 74, 0, 3], [5478, "Forbidden Knuckle Guards of Soupuro", 55, 0, 3], [5479, "Forbidden Gloves of Adier", 61, 0, 3], [5480, "Forbidden Mittens of Sitah", 45, 0, 3], [5481, "Hima Mayasi Gloves", 91, 0, 3], [5482, "Hima Laguta Gloves", 63, 0, 3], [5483, "Hima Arbita Gloves", 72, 0, 3], [5484, "Hima Nukarna Gloves", 54, 0, 3], [5485, "Mayasi Luvati Gloves", 91, 0, 4], [5486, "Laguta Luvati Gloves", 63, 0, 3], [5487, "Arbita Luvati Gloves", 72, 0, 4], [5488, "Nukarna Luvati Gloves", 54, 0, 4], [5491, "Eka Gloves", 91, 0, 3], [5492, "Adbaya Gloves", 63, 0, 3], [5493, "Ganeza Gloves", 72, 0, 3], [5494, "Adbati Gloves", 54, 0, 3], [5499, "Chori Gloves", 4, 0, 4], [5501, "Hira", 1, 0, 4], [5502, "Chabi", 3, 0, 4], [5503, "Chabi of Holy Army", 5, 0, 4], [5504, "Leather Hira", 4, 0, 4], [5505, "Roha Chabi", 6, 0, 4], [5506, "Kalapana", 8, 0, 4], [5507, "Bratina", 11, 0, 4], [5508, "Bekazar", 5, 0, 0], [5509, "Horror Halloween Belt I", 150, 0, 4], [5510, "Horror Halloween Belt II", 150, 0, 4], [5511, "Horror Halloween Belt III", 150, 0, 4], [5512, "Horror Halloween Belt IV", 150, 0, 4], [5546, "Hira of Bahamut", 1, 0, 4], [5547, "Chabi of Grapa", 3, 0, 4], [5548, "Leather Hira of Caulitara", 4, 0, 4], [5549, "Roha Chabi of Life", 6, 0, 4], [5550, "Roha Chabi of Spells", 6, 0, 4], [5551, "Rada Bratina of Grapa", 11, 0, 4], [5552, "Hero's Waistband", 11, 0, 4], [5553, "Belt of the Great Bear", 11, 0, 4], [5591, "Eka Belt", 25, 0, 3], [5592, "Adbaya Belt", 20, 0, 3], [5593, "Ganeza Belt", 23, 0, 3], [5594, "Adbati Belt", 17, 0, 3], [5596, "Belt of Cali", 11, 0, 0], [5597, "Belt of Cali", 11, 0, 0], [5598, "Belt of Cali", 11, 0, 0], [5599, "Belt of Cali", 11, 0, 0], [5601, "Chori Shoes", 3, 0, 4], [5602, "Acchada", 5, 0, 4], [5603, "Varman", 8, 0, 4], [5604, "Aruta Greaves", 60, 0, 3], [5605, "Shinra Boots", 42, 0, 3], [5606, "Paduka of God's Force", 16, 0, 4], [5607, "Kharyadin Shoes", 48, 0, 3], [5608, "Piezur Greaves", 69, 0, 3], [5609, "Soupuro Boots", 49, 0, 3], [5610, "Adier Shoes", 55, 0, 4], [5611, "Sitah Sandals", 39, 0, 3], [5612, "Bahulra Greaves", 79, 0, 3], [5613, "Amuti Boots", 57, 0, 3], [5614, "Guda Shoes", 63, 0, 4], [5615, "Nugama Sandals", 47, 0, 3], [5616, "Vharumica Sandals", 35, 0, 3], [5617, "Trana Greaves", 21, 0, 3], [5618, "Jalaka Greaves", 25, 0, 3], [5619, "Amsatra Greaves", 36, 0, 3], [5620, "Tanuvarman Greaves", 44, 0, 3], [5622, "Vadati Boots", 15, 0, 3], [5623, "Jayati Boots", 18, 0, 3], [5624, "Pratana Boots", 25, 0, 3], [5625, "Karyanimaya Boots", 30, 0, 3], [5626, "Tars Shoes", 17, 0, 3], [5627, "Samyuga Shoes", 20, 0, 3], [5628, "Pradana Shoes", 29, 0, 3], [5629, "Zastrakali Shoes", 35, 0, 3], [5630, "Varabana Sandals", 12, 0, 3], [5631, "Visamnnaha Sandals", 15, 0, 3], [5632, "Kajcuka Sandals", 21, 0, 3], [5633, "Jalavala Sandals", 26, 0, 3], [5634, "Jalabant Sandals", 31, 0, 3], [5635, "Vanutija Greaves", 18, 0, 3], [5636, "Varahaja Greaves", 30, 0, 3], [5637, "Tanadatt Boots", 12, 0, 3], [5638, "Nuhavati Boots", 21, 0, 3], [5639, "Muresan Shoes", 14, 0, 3], [5640, "Rajastanv Shoes", 24, 0, 3], [5641, "Gayatri Sandals", 10, 0, 3], [5642, "Sahasrara Sandals", 18, 0, 3], [5643, "Vikavaka Greaves", 52, 0, 3], [5644, "Kakuta Boots", 36, 0, 3], [5645, "Samahana Shoes", 42, 0, 3], [5646, "Patika of Bahamut", 4, 0, 4], [5647, "Leather Upana of Adana", 7, 0, 4], [5648, "Arapada of Adana", 10, 0, 4], [5649, "Bapada of Ajaka", 13, 0, 4], [5650, "Gatokaga Paduka Bahamut", 16, 0, 4], [5651, "Sumati Padutra of Grapa", 19, 0, 4], [5652, "Sumati Hiriwupauna", 22, 0, 4], [5653, "Trana Grieves of Ajaka", 21, 0, 3], [5654, "Gatokaga Jalka Grieves of Bahamut", 25, 0, 3], [5655, "Sumati Amsatra Grieves of Grapa", 36, 0, 3], [5656, "Sumati Tanuvarman Grieves of Bahamut", 44, 0, 3], [5657, "Rada Kalatanuvarman Grieves of Grapa", 44, 0, 3], [5658, "Vadati Boots of Ajaka", 15, 0, 3], [5659, "Gatokaga Jayati Boots of Bahamut", 18, 0, 3], [5660, "Sumati Pratana Boots of Grapa", 25, 0, 3], [5661, "Sumati Karyanimaya Boots of Bahamut", 30, 0, 3], [5662, "Tars Shoes of Ajaka", 17, 0, 3], [5663, "Gatokaga Samyuga Shoes of Bahamut", 20, 0, 3], [5664, "Sumati Pradana Shoes of Grapa", 29, 0, 3], [5665, "Sumati Zastrakali Shoes of Bahamut", 35, 0, 3], [5666, "Varabana Sandals of Ajaka", 12, 0, 3], [5667, "Gatokaga Visamnnaha Sandals of Bahamut", 15, 0, 3], [5668, "Sumati Kajcuka Sandals of Grapa", 21, 0, 3], [5669, "Sumati Jalavala Sandals of Bahamut", 26, 0, 3], [5671, "Forbidden Greaves of Aruta", 60, 0, 3], [5672, "Forbidden Boots of Shinra", 42, 0, 3], [5673, "Forbidden Shoes of Kharyadin", 48, 0, 3], [5674, "Forbidden Sandals of Vharumica", 35, 0, 3], [5675, "Forbidden Greaves of Piezur", 75, 0, 3], [5676, "Forbidden Boots of Soupuro", 55, 0, 3], [5677, "Forbidden Shoes of Adier", 61, 0, 3], [5678, "Forbidden Sandals of Sitah", 45, 0, 3], [5679, "Kanada Bahulra Greaves", 88, 0, 3], [5680, "Kanada Amuti Boots", 64, 0, 3], [5681, "Kanada Guda Shoes", 72, 0, 3], [5682, "Kanada Nugama Sandals", 56, 0, 3], [5683, "Rauti Mahas Shoes", 90, 0, 3], [5684, "Rauti Rakuta Boots", 62, 0, 3], [5685, "Rauti Balavita Shoes", 72, 0, 4], [5686, "Rauti Nukarna Sandals", 55, 0, 3], [5691, "Eka Shoes", 90, 0, 3], [5692, "Adbaya Shoes", 62, 0, 3], [5693, "Ganeza Shoes", 72, 0, 3], [5694, "Adbati Shoes", 55, 0, 3], [5699, "Chori Shoes", 4, 0, 4], [5701, "Wooden Buckler", 21, 0, 3], [5702, "Dhala", 38, 0, 3], [5703, "Kalkan", 54, 0, 3], [5704, "Phalaka", 64, 0, 3], [5705, "Carman", 77, 0, 3], [5706, "Silver Carman", 92, 0, 3], [5707, "Chagala Carman", 110, 0, 3], [5708, "Iron Carman", 132, 0, 3], [5709, "Zata Khandra", 158, 0, 3], [5710, "Kieta", 191, 0, 3], [5711, "Kabasa", 229, 0, 3], [5712, "Parakin", 272, 0, 3], [5746, "Wooden Buckler of Bahamut", 21, 0, 3], [5747, "Dara of Adana", 38, 0, 3], [5748, "Kalkan of Grapa", 54, 0, 3], [5749, "Phalaka of Life", 64, 0, 3], [5750, "Carman of Wild Beast", 77, 0, 3], [5751, "Carman of Warrior", 77, 0, 3], [5752, "Sumati Chagala Kalkan of Bahamut", 110, 0, 3], [5753, "Rada Iron Kalkan of Grapa", 132, 0, 3], [5754, "Yakat Phalaka", 64, 0, 3], [5755, "Sabitri Phalaka", 64, 0, 3], [5756, "Forbidden Shield of Kieta", 191, 0, 3], [5757, "Forbidden Shield of Kabasa", 289, 0, 3], [5801, "Charm of the Panda", 100, 0, null], [5802, "Charm of the Eagle", 1, 0, null], [5803, "Charm of Samudra", 2, 0, null], [5804, "Charm of Surya", 200, 0, null], [5805, "Charm of Pranas", 10, 0, null], [5806, "Charm of Amsha", 3, 0, null], [5807, "Charm of Vedha", 75, 0, null], [5808, "Charm of Ghosha", 75, 0, null], [5809, "Charm of Gruta", 5, 0, null], [5810, "Charm of Ara", 5, 0, null], [5811, "Charm of Chakra Darani", 4, 0, null], [5812, "Charm of Darani I", 10, 0, null], [5813, "Charm of Darani II", 10, 0, null], [5814, "Charm of Darani III", 10, 0, null], [5815, "Charm of Darani IV", 10, 0, null], [5816, "Kathana Charm I", 20, 0, null], [5817, "Kathana Charm II", 20, 0, null], [5818, "Kathana Charm III", 20, 0, null], [5819, "Kathana Charm IV", 20, 0, null]];
// ── Item Search ────────────────────────────────────────────────────────────────
let pickerHighlight = -1;

function filterItems() {
  const q    = document.getElementById('itemSearch').value.toLowerCase().trim();
  const list = document.getElementById('itemPickerList');
  pickerHighlight = -1;
  list.innerHTML = '';

  const matches = q
    ? ITEMS.filter(it => it[1].toLowerCase().includes(q)).slice(0, 60)
    : [];

  if (!matches.length) { list.style.display = 'none'; return; }

  matches.forEach((it, idx) => {
    const li = document.createElement('li');
    const isArmor = it[3] === 0;
    li.textContent = it[1];
    li.dataset.idx = idx;
    li.addEventListener('mousedown', e => { e.preventDefault(); selectItem(it); });
    list.appendChild(li);
  });
  list._matches = matches;
  list.style.display = 'block';
}

function pickerKeyDown(e) {
  const list = document.getElementById('itemPickerList');
  if (list.style.display === 'none') return;
  const items = list.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    pickerHighlight = Math.min(pickerHighlight + 1, items.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    pickerHighlight = Math.max(pickerHighlight - 1, 0);
  } else if (e.key === 'Enter' && pickerHighlight >= 0) {
    e.preventDefault();
    selectItem(list._matches[pickerHighlight]);
    return;
  } else if (e.key === 'Escape') {
    list.style.display = 'none'; return;
  } else { return; }

  items.forEach((li, i) => li.classList.toggle('hl', i === pickerHighlight));
  items[pickerHighlight]?.scrollIntoView({ block: 'nearest' });
}

function selectItem(it) {
  const isArmor = it[3] === 0;
  document.getElementById('itemSearch').value = it[1];
  document.getElementById('itemPickerList').style.display = 'none';
  document.getElementById('startLevel').value = '0';
  trueBaseMin = Math.max(1, it[2]);
  trueBaseMax = Math.max(1, isArmor ? it[2] : it[3]);
  // Auto-set item type if known (it[4])
  if (it[4] !== null && it[4] !== undefined) {
    document.getElementById('itemType').value = String(it[4]);
  } else if (isArmor && getItemType() < 3) {
    document.getElementById('itemType').value = '3';
  } else if (!isArmor && getItemType() >= 3) {
    document.getElementById('itemType').value = '0';
  }
  updateBaseInputs();
  resetItem();
}

function initItemSearch() {
  const input = document.getElementById('itemSearch');
  input.addEventListener('keydown', pickerKeyDown);
  document.addEventListener('click', e => {
    if (!document.getElementById('itemPicker').contains(e.target))
      document.getElementById('itemPickerList').style.display = 'none';
  });
}

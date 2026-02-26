document.addEventListener("DOMContentLoaded", () => {
  // Wait for skill data to load and window.skillDataRaw to be available
  if (typeof skillDataPromise !== 'undefined' && skillDataPromise) {
    skillDataPromise.then(() => {
      let waited = 0;
      const maxWait = 5000; // 5 seconds fallback
      const checkSkillDataRaw = () => {
        console.log('[DEBUG] Waiting for skillDataRaw:', waited);
        if (window.skillDataRaw && window.skillDataRaw.length > 0) {
          console.log('[DEBUG] skillDataRaw loaded, initializing archery');
          initializearchery();
        } else if (waited >= maxWait) {
          console.warn('[DEBUG] skillDataRaw not loaded after timeout, initializing archery anyway');
          initializearchery();
        } else {
          waited += 50;
          setTimeout(checkSkillDataRaw, 50);
        }
      };
      checkSkillDataRaw();
    });
  } else {
    initializearchery();
  }
});
function initializearchery() {
  const levelSelect = document.getElementById("charLevel-global");
  const pointsEl = document.getElementById("points-global");
  const resetBtn = document.getElementById("reset-global");
  const tree = document.getElementById("tree-archery");

  if (!levelSelect || !pointsEl || !tree) return;

  const state = character.masteries.archery;

  // Populate level dropdown only once
  if (levelSelect.options.length === 0) {
    for (let lvl = 45; lvl <= 110; lvl++) {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = lvl;
      levelSelect.appendChild(opt);
    }
    levelSelect.value = character.level;
  }

  // Helper functions
  function spentPoints() {
    return state.skills.reduce((sum, s) => sum + s.val, 0);
  }

  function unlocked(skill) {
    // Use pcskill.json requirements if available
    if (skill.skillDataId && typeof getSkillRequirements === 'function' && window.skillDataRaw) {
      const reqs = getSkillRequirements(skill.skillDataId);
      if (reqs.length === 0) return true; // No prerequisites
      return reqs.every(req => {
        // Find the grid skill that matches the required skillDataId
        const parent = state.skills.find(s => s.skillDataId === req.skillId);
        if (!parent) return true; // Req skill not in this tree, skip
        return parent.val >= req.reqLevel;
      });
    }
    // Fallback to hardcoded req array
    return skill.req.every(id => {
      const parent = state.skills.find(s => s.id === id);
      return parent.max === 0 || parent.val > 0;
    });
  }

  function gridCenter(col, row) {
    return { x: col * 96 - 48, y: row * 96 - 48 };
  }

  function drawConnector(layer, fromId, toId) {
    const from = state.skills.find(s => s.id === fromId);
    const to = state.skills.find(s => s.id === toId);
    if (!from || !to) return;

    const a = gridCenter(from.col, from.row);
    const b = gridCenter(to.col, to.row);

    const v = document.createElement("div");
    v.className = "connector vertical";
    v.style.left = `${a.x - 2}px`;
    v.style.top = `${Math.min(a.y, b.y)}px`;
    v.style.height = `${Math.abs(a.y - b.y)}px`;

    const h = document.createElement("div");
    h.className = "connector horizontal";
    h.style.left = `${Math.min(a.x, b.x)}px`;
    h.style.top = `${b.y - 2}px`;
    h.style.width = `${Math.abs(a.x - b.x)}px`;

    layer.appendChild(v);
    layer.appendChild(h);
  }

  function render() {
    tree.innerHTML = "";

    const connectorLayer = document.createElement("div");
    connectorLayer.className = "connector-layer";
    tree.appendChild(connectorLayer);

    state.skills.forEach(skill => {
      skill.req.forEach(parent => {
        drawConnector(connectorLayer, parent, skill.id);
      });
    });

    // Calculate global available points once before the loop
    const masteryNames = Object.keys(character.masteries);
    const totalSpent = masteryNames.reduce((sum, mastery) => sum + character.getSpentPoints(mastery), 0);
    const availablePoints = character.level - totalSpent;

    state.skills.forEach(skill => {
      // Apply max level from skill data if skill has a skillDataId
      if (skill.skillDataId) {
        const dataMaxLevel = getSkillMaxLevel(skill.skillDataId);
        if (dataMaxLevel > 0) {
          skill.max = dataMaxLevel;
        }
      }

      const div = document.createElement("div");
      div.className = "skill";
      div.style.gridColumn = skill.col;
      div.style.gridRow = skill.row;

      if (!unlocked(skill)) div.classList.add("locked");
      if (skill.val === skill.max && skill.max > 0) div.classList.add("maxed");

      div.innerHTML = `
        <div class="icon-wrapper">
          ${skill.icon ? `<div class="icon" style="background-image: url('skill_icons/${skill.icon}');"></div>` : '<div class="icon"></div>'}
          <div class="controls">
            <button class="btn-skill plus">+</button>
            <button class="btn-skill minus">−</button>
          </div>
        </div>
        <div class="level">${skill.val} / ${skill.max}</div>
      `;

      // Add tooltip if skillDataId exists
      if (skill.skillDataId) {
        let skillLevel = skill.val > 0 ? skill.val : 1;
        let skillName = skill.id;
        let skillDesc = "";
        let effect1 = "N/A";
        let effect2 = "N/A";
        // Use skillData.js functions for info
        const skillInfo = typeof getSkillInfo === 'function' ? getSkillInfo(skill.skillDataId) : null;
        if (skillInfo) {
          skillName = skillInfo.name || skillName;
          skillDesc = skillInfo.description || "";
        }
        // Get effect params using skillData.js
        if (typeof getSkillEffectParams === 'function' && window.skillDataRaw) {
          const effectParams = getSkillEffectParams(skill.skillDataId, skillLevel);
          effect1 = effectParams.iEffect1Param1 !== null ? effectParams.iEffect1Param1 : "N/A";
          effect2 = effectParams.iEffect1Param2 !== null ? effectParams.iEffect1Param2 : "N/A";
        }
        div.addEventListener('mouseenter', (e) => {
          // Remove existing tooltip if present
          const existing = document.querySelector('.custom-tooltip');
          if (existing) existing.remove();
          const tooltip = document.createElement('div');
          tooltip.className = 'custom-tooltip';
          tooltip.innerHTML = `<strong>${skillName} - Level ${skillLevel}</strong><br>${skillDesc ? `<br>${skillDesc}` : ''}<br><br>${effect1} - ${effect2}`;
          tooltip.style.cssText = `
            position: fixed;
            background: #1a1a1a;
            color: #fff;
            padding: 8px 12px;
            border: 1px solid #666;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            max-width: 200px;
            white-space: normal;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          `;
          document.body.appendChild(tooltip);
          // Position tooltip on mouse move (right side of cursor)
          const moveHandler = (event) => {
            tooltip.style.left = (event.clientX + 16) + 'px'; // 16px right of cursor
            tooltip.style.top = (event.clientY - tooltip.offsetHeight / 2) + 'px';
          };
          div.addEventListener('mousemove', moveHandler);
          div.addEventListener('mouseleave', () => {
            div.removeEventListener('mousemove', moveHandler);
            tooltip.remove();
          }, { once: true });
        });
      }

      const plus = div.querySelector(".plus");
      const minus = div.querySelector(".minus");

      // Determine if + button should be enabled based on level requirement
      let canAdd = true;
      if (skill.skillDataId && skill.val < skill.max) {
        canAdd = character.canAddSkillPoint('archery', skill.id, skill.val, character.level);
      }

      plus.disabled = availablePoints <= 0 || skill.val >= skill.max || skill.max === 0 || !unlocked(skill) || !canAdd;
      minus.disabled = skill.val <= 0;

      plus.onclick = (e) => {
        e.stopPropagation();
        // If skillDataRaw is loaded, enforce level requirement for next rank
        if (window.skillDataRaw) {
          const skillRanks = window.skillDataRaw.filter(s => s.ID === skill.skillDataId);
          const nextRank = skill.val; // next rank is current val (0-based)
          const nextRankInfo = skillRanks[nextRank];
          if (nextRankInfo && character.level >= nextRankInfo.byteReqLevel) {
            addPoint(skill.id);
          }
        } else {
          // Fallback: allow adding point if not at max
          if (skill.val < skill.max) {
            addPoint(skill.id);
          }
        }
      };

      minus.onclick = (e) => {
        e.stopPropagation();
        removePoint(skill.id);
      };

      tree.appendChild(div);
    });

    pointsEl.textContent = availablePoints;
  }

  function addPoint(id) {
    const masteryNames = Object.keys(character.masteries);
    const totalSpent = masteryNames.reduce((sum, mastery) => sum + character.getSpentPoints(mastery), 0);
    const availablePoints = character.level - totalSpent;
    const s = state.skills.find(x => x.id === id);
    if (availablePoints <= 0 || s.val >= s.max) return;
    s.val++;
    render();
  }

  function removePoint(id) {
    const s = state.skills.find(x => x.id === id);
    if (s.val <= 0) return;
    s.val--;
    render();
  }

  function recalcPoints() {
    const newLevel = Number(levelSelect.value);
    character.setLevel(newLevel);
    render();
  }

  levelSelect.addEventListener("change", recalcPoints);
  render();

  // Add Reset Skill Points button handler
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset all masteries
      Object.keys(character.masteries).forEach(mastery => {
        character.resetSkillPoints(mastery);
      });
      render();
    });
  }
}


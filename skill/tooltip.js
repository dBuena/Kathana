/**
 * Shared Tooltip System
 * Handles tooltips for skill nodes across all masteries
 */

function initializeSkillTooltip(skillElement, skill) {
  if (!skill.skillDataId) return;

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

  skillElement.addEventListener('mouseenter', (e) => {
    // Remove existing tooltip if present
    const existing = document.querySelector('.custom-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = `<strong>${skillName} - Level ${skillLevel}</strong><br>${skillDesc ? `<br>${skillDesc}` : ''}<br><br>${effect1} - ${effect2}`;
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(26, 26, 26, 0.8);
      color: #fff;
      padding: 8px 12px;
      border: 1px solid #cac850;
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

    skillElement.addEventListener('mousemove', moveHandler);
    skillElement.addEventListener('mouseleave', () => {
      skillElement.removeEventListener('mousemove', moveHandler);
      tooltip.remove();
    }, { once: true });
  });
}

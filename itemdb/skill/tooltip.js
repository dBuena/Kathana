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
  let byteReqLevel = 0;
  let idReqSkill1 = 0;
  let iCoolDownTime = 0;
  let prereqSkillName = "";

  // Get skill description from skilldesc.json
  const skillDescInfo = typeof getSkillDesc === 'function' ? getSkillDesc(skill.skillDataId) : null;
  if (skillDescInfo) {
    skillName = skillDescInfo.name || skillName;
    skillDesc = skillDescInfo.philippine_desc || "";
  }

  // Get skill info (includes byteReqLevel, idReqSkill1, and iCoolDownTime)
  const skillInfo = typeof getSkillInfo === 'function' ? getSkillInfo(skill.skillDataId) : null;
  if (skillInfo) {
    byteReqLevel = skillInfo.byteReqLevel || 0;
    idReqSkill1 = skillInfo.idReqSkill1 || 0;
    iCoolDownTime = skillInfo.iCoolDownTime || 0;
    // Get prerequisite skill name
    if (idReqSkill1 > 0 && typeof getSkillNameById === 'function') {
      prereqSkillName = getSkillNameById(idReqSkill1);
    }
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

    // Build tooltip HTML with dynamic prerequisite skill display
    let tooltipHTML = `<strong><span style="color: #6bff7f;">${skillName}</span> - Level ${skillLevel}</strong>`;
    if (skillDesc) {
      tooltipHTML += `<br>${skillDesc}`;
    }
    tooltipHTML += `<br><span style="color: #ff6b6b;">Required Level ${byteReqLevel}</span>`;
    if (idReqSkill1 > 0 && prereqSkillName) {
      tooltipHTML += `<br>Need to learn ${prereqSkillName}`;
    }
    // Display cooldown or passive skill
    if (iCoolDownTime === 0) {
      tooltipHTML += `<br>Passive Skill`;
    } else {
      const cooldownSeconds = (iCoolDownTime / 1000).toFixed(1);
      tooltipHTML += `<br>Cooldown ${cooldownSeconds}s`;
    }
    tooltipHTML += `<br>${effect1} - ${effect2}`;

    tooltip.innerHTML = tooltipHTML;
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

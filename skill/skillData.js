// Skill Data Manager - Loads and caches skill information from pcskill.json and skilldesc.json
let skillDataCache = {};
let skillMaxLevelCache = {};
let skillDataLoaded = false;
let skillDataPromise = null;

// Skill Description Cache - Loads from skilldesc.json
let skillDescCache = {};
let skillDescLoaded = false;
let skillDescPromise = null;

// Load skill data from pcskill.json
function loadSkillData() {
  if (skillDataPromise) return skillDataPromise;
  
  skillDataPromise = fetch('pcskill.json')
    .then(response => response.json())
    .then(skills => {
      // Assign global skill data for other scripts
      window.skillDataRaw = skills;
      // Build lookup map by ID and count occurrences for max level
      const seen = {};
      const levelCounts = {};
      skills.forEach(skill => {
        // Count occurrences of each skill ID
        levelCounts[skill.ID] = (levelCounts[skill.ID] || 0) + 1;
        // Store first occurrence as primary data
        if (!seen[skill.ID]) {
          skillDataCache[skill.ID] = {
            id: skill.ID,
            name: skill.szName,
            description: (skill['Note(NotUsedField)'] && typeof skill['Note(NotUsedField)'] === 'string') 
              ? skill['Note(NotUsedField)'] 
              : 'No description',
            level: skill.byteMaxLevel,
            reqLevel: skill.byteReqLevel
          };
          seen[skill.ID] = true;
        }
      });
      // Store max levels (count of how many times each skill appears)
      Object.assign(skillMaxLevelCache, levelCounts);
      skillDataLoaded = true;
      console.log(`Skill data loaded: ${Object.keys(skillDataCache).length} unique skills cached`);
      console.log(`Max levels calculated from pcskill.json`);
      return skillDataCache;
    })
    .catch(error => {
      console.error('Error loading skill data:', error);
      return {};
    });
  
  return skillDataPromise;
}

// Get skill info by ID
function getSkillInfo(skillId) {
  const skill = skillDataCache[skillId];
  if (skill) {
    // Find all ranks for this skillId
    let effect1 = null;
    let effect11 = null;
    let byteReqLevel = 0;
    let idReqSkill1 = 0;
    let iCoolDownTime = 0;
    if (typeof window.skillDataRaw !== 'undefined') {
      const skillRanks = window.skillDataRaw.filter(s => s.ID === skillId);
      // Use current rank or first rank
      const rank = skillRanks[0];
      if (rank) {
        effect1 = rank.iEffect1Param1;
        effect11 = rank.iEffect11Param2;
        byteReqLevel = rank.byteReqLevel || 0;
        idReqSkill1 = rank.idReqSkill1 || 0;
        iCoolDownTime = rank.iCoolDownTime || 0;
      }
    }
    return {
      ...skill,
      iEffect1Param1: effect1,
      iEffect11Param2: effect11,
      byteReqLevel: byteReqLevel,
      idReqSkill1: idReqSkill1,
      iCoolDownTime: iCoolDownTime
    };
  }
  return {
    id: skillId,
    name: 'Unknown Skill',
    description: 'No information available',
    level: 0,
    reqLevel: 0,
    iEffect1Param1: null,
    iEffect11Param2: null,
    byteReqLevel: 0,
    idReqSkill1: 0,
    iCoolDownTime: 0
  };
}

// Get skill name by ID
function getSkillNameById(skillId) {
  const skill = skillDataCache[skillId];
  if (skill) {
    return skill.name;
  }
  return null;
}

// Get max level for a skill by ID (based on occurrences in pcskill.json)
function getSkillMaxLevel(skillId) {
  return skillMaxLevelCache[skillId] || 0;
}

// Get effect params for a skill and level
function getSkillEffectParams(skillDataId, skillLevel) {
  if (!window.skillDataRaw) return { iEffect1Param1: null, iEffect1Param2: null };
  const skillRanks = window.skillDataRaw.filter(s => s.ID === skillDataId);
  // skillLevel is 1-based
  const rankInfo = skillRanks[skillLevel - 1] || skillRanks[skillRanks.length - 1] || {};
  console.log('[DEBUG] getSkillEffectParams:', {
    skillDataId,
    skillLevel,
    skillRanks,
    rankInfo,
    iEffect1Param1: rankInfo.iEffect1Param1,
    iEffect1Param2: rankInfo.iEffect1Param2
  });
  return {
    iEffect1Param1: typeof rankInfo.iEffect1Param1 !== 'undefined' ? rankInfo.iEffect1Param1 : null,
    iEffect1Param2: typeof rankInfo.iEffect1Param2 !== 'undefined' ? rankInfo.iEffect1Param2 : null
  };
}

// Get skill prerequisites from pcskill.json (uses first rank's data)
// Returns array of { skillId, reqLevel } objects
function getSkillRequirements(skillDataId) {
  if (!window.skillDataRaw) return [];
  const firstRank = window.skillDataRaw.find(s => s.ID === skillDataId);
  if (!firstRank) return [];

  const reqs = [];
  if (firstRank.idReqSkill1 && typeof firstRank.idReqSkill1 === 'number' && firstRank.idReqSkill1 > 0) {
    reqs.push({ skillId: firstRank.idReqSkill1, reqLevel: firstRank.byteReqSkill1_Lvl || 1 });
  }
  if (firstRank.idReqSkill2 && typeof firstRank.idReqSkill2 === 'number' && firstRank.idReqSkill2 > 0) {
    reqs.push({ skillId: firstRank.idReqSkill2, reqLevel: firstRank.byteReqSkill2_Lvl || 1 });
  }
  return reqs;
}

// Load skill descriptions from skilldesc.json
function loadSkillDesc() {
  if (skillDescPromise) return skillDescPromise;

  skillDescPromise = fetch('skilldesc.json')
    .then(response => response.json())
    .then(data => {
      // Build lookup map by ID
      if (data.skills && Array.isArray(data.skills)) {
        data.skills.forEach(skill => {
          skillDescCache[skill.id] = {
            id: skill.id,
            name: skill.name,
            philippine_desc: skill.philippine_desc || '',
            chi_desc: skill.chi_desc || '',
            jp_desc: skill.jp_desc || '',
            indonesia_desc: skill.indonesia_desc || '',
            taiwan_desc: skill.taiwan_desc || '',
            mexico_desc: skill.mexico_desc || '',
            desc: skill.desc || ''
          };
        });
      }
      skillDescLoaded = true;
      console.log(`Skill descriptions loaded: ${Object.keys(skillDescCache).length} skills cached`);
      return skillDescCache;
    })
    .catch(error => {
      console.error('Error loading skill descriptions:', error);
      return {};
    });

  return skillDescPromise;
}

// Get skill description by ID (from skilldesc.json)
function getSkillDesc(skillId) {
  const skill = skillDescCache[skillId];
  if (skill) {
    return skill;
  }
  return {
    id: skillId,
    name: 'Unknown Skill',
    philippine_desc: 'No description available',
    desc: 'No description available'
  };
}

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSkillData();
  loadSkillDesc();
});

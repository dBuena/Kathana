// Druka Character Object
const character = {
  name: "Abikara",
  level: 45,
  godPoints: 30,
  masteries: {
    blade: {
      skills: [
        // Main branch (column 1)
        { id: "b1_1", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_MANTRA01.bmp", skillDataId: 3301 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["b1_1"], icon: "ICON_SKILL_AO_CHANDRAROCA.bmp", skillDataId: 3321 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_P_Ramhas.bmp", skillDataId: 3303 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_CHANDRAFORCE.bmp", skillDataId: 3326 },

        // Column 2 branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AGNIARROW.bmp", skillDataId: 3315 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AV_AGNIGUNA.bmp", skillDataId: 3316 },
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b2_2"], icon: "ICON_SKILL_AO_AGNI.bmp", skillDataId: 3327 },
        { id: "b2_4", col: 2, row: 4, max: 0, val: 0, req: ["b2_3"], icon: "ICON_SKILL_AO_MAHOLKA.bmp", skillDataId: 3324 },
        { id: "b2_5", col: 2, row: 5, max: 0, val: 0, req: ["b2_4"], icon: "ICON_SKILL_AO_JAKTI.bmp", skillDataId: 3307 },
        
        // Column 3 branch
        { id: "b3_4", col: 3, row: 4, max: 0, val: 0, req: [], icon: "ICON_SKILL_HOLDFIRE.bmp", skillDataId: 3306 },
        { id: "b3_5", col: 3, row: 5, max: 0, val: 0, req: ["b3_4"], icon: "ICON_SKILL_AO_AGNIBLAZE.bmp", skillDataId: 3341 },
        { id: "b3_6", col: 3, row: 6, max: 0, val: 0, req: ["b3_5"], icon: "ICON_SKILL_AO_VARTATE.bmp", skillDataId: 3334 },

        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_agnisanatha 01.bmp", skillDataId: 3397 },
        { id: "b4_5", col: 4, row: 5, max: 0, val: 0, req: ["b3_4"], icon: "ICON_SKILL_AO_agnimaNi.bmp", skillDataId: 3335 }
      ]
      
    },
    archery: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_HIMA.bmp", skillDataId: 3304 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "ICON_SKILL_AV_INCRESESPEED_YAKSA.bmp", skillDataId: 3317 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_AO_HIMACHACRA.bmp", skillDataId: 3322 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_HIMARESMAN.bmp", skillDataId: 3343 },

        // Column 2 branches
        { id: "b3_1", col: 3, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_RU.bmp", skillDataId: 3305 },
        { id: "b3_2", col: 3, row: 2, max: 0, val: 0, req: ["b3_1"], icon: "ICON_SKILL_AV_RUGUNA.bmp", skillDataId: 3318 },
        { id: "b3_3", col: 3, row: 3, max: 0, val: 0, req: ["b3_2"], icon: "ICON_SKILL_AO_RAUTI.bmp", skillDataId: 3323 },
        { id: "b3_4", col: 3, row: 4, max: 0, val: 0, req: ["b3_3"], icon: "ICON_SKILL_P_LAKSROKA02.bmp", skillDataId: 3361 },
        { id: "b3_5", col: 3, row: 5, max: 0, val: 0, req: ["b3_4"], icon: "ICON_SKILL_AO_SUGAMA.bmp", skillDataId: 3333 },

        // Column 2 Sub branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_himasanatha 01.bmp", skillDataId: 3398 },
        { id: "b2_4", col: 2, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_HIMATIRIKA.bmp", skillDataId: 3312 },

        // Column 4 Sub branches
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_rusanatha 01.bmp", skillDataId: 3399 },
        { id: "b4_4", col: 4, row: 4, max: 0, val: 0, req: ["b3_3"], icon: "ICON_SKILL_AO_SIDHARU.bmp", skillDataId: 3308 }
      ]
    },
    support: {
      skills: [
        // Main branch (column 1)
        // magic
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_INCRESECHACRA_DEVA.bmp", skillDataId: 3310 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_AMBAKABIZATI.bmp", skillDataId: 3314 },

        // Column 2 branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_RANGE.bmp", skillDataId: 3302 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AV_TRETA03.bmp", skillDataId: 3311 },

        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_SPTA02.bmp", skillDataId: 3309 },
        { id: "b4_2", col: 4, row: 2, max: 0, val: 0, req: ["b4_1"], icon: "ICON_SKILL_AO_SPTARESMAN02.bmp", skillDataId: 3329 }
      ]
    },
    amara: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_100lv_03.bmp", skillDataId: 3313 }
        
      ]
    },
    god: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_TRIMU_P_KSHA3-1_MUJCATI.bmp", skillDataId: 3177 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "ICON_SKILL_TRIMU_P_KSHA3_PARA.bmp", skillDataId: 3276 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_TRIMU_P_KSHA2_CHEKA.bmp", skillDataId: 3275 },
        
        // Column 2 branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_TRIMU_P_KSHA1_VISTAMBHA.bmp", skillDataId: 3374 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_TRIMU_P_BRA3_KHILA.bmp", skillDataId: 3373 },
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b2_2"], icon: "ICON_SKILL_TRIMU_P_BRA2_UPASARGA.bmp", skillDataId: 3372 },

        // Column 3 branch
        { id: "b3_1", col: 3, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_TRIMU_P_BRA1_CINTANA.bmp", skillDataId: 3071 },
        { id: "b3_2", col: 3, row: 2, max: 0, val: 0, req: ["b3_1"], icon: "ICON_SKILL_TRIMU_P_AVA3_JAYINLAT.bmp", skillDataId: 3070 },
        { id: "b3_3", col: 3, row: 3, max: 0, val: 0, req: ["b3_2"], icon: "ICON_SKILL_TRIMU_P_AVA2_TAPASHRASA.bmp", skillDataId: 3069 },

        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_TRIMU_P_MAHA3_PAZ.bmp", skillDataId: 3067 },
        { id: "b4_2", col: 4, row: 2, max: 0, val: 0, req: ["b4_1"], icon: "ICON_SKILL_TRIMU_P_AVA1_ZAYASTE.bmp", skillDataId: 3168 },
        { id: "b4_3", col: 4, row: 3, max: 0, val: 0, req: ["b4_2"], icon: "ICON_SKILL_TRIMU_P_MAHA2_RAGGHAS.bmp", skillDataId: 3166 }
      ]
    }
  },

  // Get total skill points available based on level
  getAvailablePoints(mastery) {
    const spent = this.getSpentPoints(mastery);
    return this.level - spent;
  },

  // Get total spent points for a mastery
  getSpentPoints(mastery) {
    if (!this.masteries[mastery] || !this.masteries[mastery].skills) return 0;
    return this.masteries[mastery].skills.reduce((sum, skill) => sum + skill.val, 0);
  },

  // Set character level
  setLevel(newLevel) {
    this.level = newLevel;
    // Trigger update for all masteries if needed
    this.autoBalancePoints();
  },

  // Auto-balance points if new level is lower than spent points
  autoBalancePoints() {
    const masteryNames = ['blade', 'archery', 'support', 'amara', 'god'];
    
    masteryNames.forEach(mastery => {
      let totalSpent = this.getSpentPoints(mastery);
      
      if (totalSpent > this.level) {
        let overflow = totalSpent - this.level;
        const skills = this.masteries[mastery].skills;
        
        // Remove points from last skills first
        for (let i = skills.length - 1; i >= 0 && overflow > 0; i--) {
          const skill = skills[i];
          const remove = Math.min(skill.val, overflow);
          skill.val -= remove;
          overflow -= remove;
        }
      }
    });
  },

  // Reset a specific mastery
  resetMastery(mastery) {
    if (this.masteries[mastery] && this.masteries[mastery].skills) {
      this.masteries[mastery].skills.forEach(skill => {
        skill.val = 0;
      });
    }
  },

  // Reset all masteries
  resetAll() {
    const masteryNames = ['blade', 'archery', 'support', 'amara', 'god'];
    masteryNames.forEach(mastery => this.resetMastery(mastery));
  },

  // Export character data
  export() {
    return JSON.stringify(this, null, 2);
  },

  // Import character data
  import(jsonData) {
    const data = JSON.parse(jsonData);
    this.name = data.name || this.name;
    this.level = data.level || this.level;
    this.masteries = data.masteries || this.masteries;
  },

  // Check if a skill point can be added based on level requirement
    canAddSkillPoint(mastery, skillGridId, currentVal, charLevel) {
      if (!window.skillDataRaw) return true;
      // Find the skill object in the mastery grid
      const skillObj = this.masteries[mastery].skills.find(skill => skill.id === skillGridId);
      if (!skillObj) return false;
      const skillDataId = skillObj.skillDataId;
      // Find all ranks for this skillDataId
      const skillRanks = window.skillDataRaw.filter(s => s.ID === skillDataId);
      let maxAllowedRank = 0;
      for (let i = 0; i < skillRanks.length; i++) {
        if (charLevel >= skillRanks[i].byteReqLevel) {
          maxAllowedRank = i + 1;
        } else {
          break;
        }
      }
      return currentVal < maxAllowedRank;
    },

  // Reset skill points for a mastery
  resetSkillPoints(mastery) {
    this.resetMastery(mastery);
  },

  // Get spent god points
  getSpentGodPoints() {
    if (!this.masteries.god || !this.masteries.god.skills) return 0;
    return this.masteries.god.skills.reduce((sum, skill) => sum + skill.val, 0);
  },

  // Get available god points
  getAvailableGodPoints() {
    return this.godPoints - this.getSpentGodPoints();
  },

  // Get total spent points on non-god masteries
  getSpentNonGodPoints() {
    return ['blade', 'archery', 'support', 'amara'].reduce((sum, mastery) => sum + this.getSpentPoints(mastery), 0);
  },

  // Get available skill points (for non-god masteries)
  getAvailableSkillPoints() {
    return this.level - this.getSpentNonGodPoints();
  },
};

// Make character globally accessible to this page
window.character = character;

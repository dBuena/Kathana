// Druka Character Object
const character = {
  name: "Druka",
  level: 45,
  masteries: {
    blade: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_BEGA.bmp", skillDataId: 3124 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "ICON_SKILL_AV_VIRABA.bmp", skillDataId: 3142 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_AO_GAIL.bmp", skillDataId: 3141 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_CACOLAGROUND.bmp", skillDataId: 3126 },
        { id: "b1_5", col: 1, row: 5, max: 0, val: 0, req: ["b1_4"], icon: "ICON_SKILL_AO_ANTAKARA.bmp", skillDataId: 3161 },
        
        // Column 2 branches
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_AO_DIBANDA.bmp", skillDataId: 3107 },
        { id: "b2_4", col: 2, row: 4, max: 0, val: 0, req: ["b1_4"], icon: "ICON_SKILL_AO_HOLDPOISON.bmp", skillDataId: 3127 },
        { id: "b2_5", col: 2, row: 5, max: 0, val: 0, req: ["b1_5", "b2_4"], icon: "ICON_SKILL_AO_GATHANA.bmp", skillDataId: 3113 },
        { id: "b2_6", col: 2, row: 6, max: 0, val: 0, req: ["b2_5"], icon: "ICON_SKILL_AV_AKHILA.bmp", skillDataId: 3160 },
        
        // Column 3 branch
        { id: "b3_5", col: 3, row: 5, max: 0, val: 0, req: ["b2_5"], icon: "ICON_SKILL_AO_AGUPTA.bmp", skillDataId: 3104 },
        
        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_SWORDMASTER.bmp", skillDataId: 3105 },
        { id: "b4_2", col: 4, row: 2, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_NAKARAROKA.bmp", skillDataId: 3106 },
        { id: "b4_3", col: 4, row: 3, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_DVAIRADAROKA.bmp", skillDataId: 3199 }
      ]
    },
    archery: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_ATANIROCA.bmp", skillDataId: 3108 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "ICON_SKILL_AO_IRINTIRIKA.bmp", skillDataId: 3128 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_AO_PRANAARROW.bmp", skillDataId: 3143 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_PRANICA.bmp", skillDataId: 3162 },

        // Row 3 sub-branches (b1_3 → b2_3 → b3_3)
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_SACATARADA.bmp", skillDataId: 3129 },
        { id: "b3_3", col: 3, row: 3, max: 0, val: 0, req: ["b2_3"], icon: "ICON_SKILL_AV_BISARADA.bmp", skillDataId: 3130 }
      ]
    },
    support: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_BARUNAFORCE01.bmp", skillDataId: 3101 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "Icon_skill_av_orashield01.bmp", skillDataId: 3102 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "Icon_skill_ao_mantraskin01.bmp", skillDataId: 3110 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AV_SANUTAR.bmp", skillDataId: 3159 },

        // Column 2 branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AV_INCRESESPEED.bmp", skillDataId: 3121 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AV_SURYAFORCE.bmp", skillDataId: 3103 },
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b2_2", "b2_4"], icon: "ICON_SKILL_AO_AMBAKABIZATI.bmp", skillDataId: 3144 },
        
        // Column 3 branch
        { id: "b3_2", col: 3, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AV_JUVAS.bmp", skillDataId: 3114 },
        
        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_CHAYA02.bmp", skillDataId: 3122 }
      ]
    },
    amara: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_100lv_07.bmp", skillDataId: 3145 }
        
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
  }
};

// Make character globally accessible to this page
window.character = character;

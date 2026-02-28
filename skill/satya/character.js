// Druka Character Object
const character = {
  name: "Satya",
  level: 45,
  godPoints: 30,
  masteries: {
    blade: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_BASATI02.bmp", skillDataId: 3001 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "ICON_SKILL_AO_BALUKATRASH.bmp", skillDataId: 3026 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_AV_AROKAKIN.bmp", skillDataId: 3041 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_BALUKAMANTRA.bmp", skillDataId: 3007 },
        { id: "b1_5", col: 1, row: 5, max: 0, val: 0, req: ["b1_4"], icon: "ICON_SKILL_AO_NAUTI.bmp", skillDataId: 3043 },
        
        // Column 2 branches
        { id: "b2_4", col: 2, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_PRABEZA.bmp", skillDataId: 3027 },
        { id: "b2_5", col: 2, row: 5, max: 0, val: 0, req: ["b1_4"], icon: "Icon_skill_ao_stun01.bmp", skillDataId: 3021 },
        
        // Column 3 branch
        { id: "b3_1", col: 3, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_BARUNAFORCE.bmp", skillDataId: 3203 },
        { id: "b3_2", col: 3, row: 2, max: 0, val: 0, req: [], icon: "ICON_SKILL_AV_CATIN.bmp", skillDataId: 3058 },
        { id: "b3_5", col: 3, row: 5, max: 0, val: 0, req: ["b2_5"], icon: "ICON_SKILL_AO_BUKAMPA02.bmp", skillDataId: 3061 },
        
        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_XMASTER.bmp", skillDataId: 3004 },
        { id: "b4_2", col: 4, row: 2, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_SWORDMASTER.bmp", skillDataId: 3006 },
        { id: "b4_3", col: 4, row: 3, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_SPEARMASTER.bmp", skillDataId: 3005 },
        { id: "b4_5", col: 4, row: 5, max: 0, val: 0, req: ["b3_5"], icon: "ICON_SKILL_AO_SPARE01.bmp", skillDataId: 3012 }
      ]
    },
    archery: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_DORBAFORCE.bmp", skillDataId: 3002 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "ICON_SKILL_AO_ZAMA03.bmp", skillDataId: 3003 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_AV_UMASAMATE.bmp", skillDataId: 3099 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AV_PARACAMANA.bmp", skillDataId: 3032 },

        // Column 2
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_SAVITRIFORCE01.bmp", skillDataId: 3042 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AO_DORBAAGAINST.bmp", skillDataId: 3098 },
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b2_2"], icon: "ICON_SKILL_AV_STAMCARMAN.bmp", skillDataId: 3031 },

        //Column 4
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_sthiratA.bmp", skillDataId: 3016 }
      ]
    },
    support: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_ORAAMOR.bmp", skillDataId: 3010 },

        // Column 2 branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_CUNDALINIRISE.bmp", skillDataId: 3024 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AV_TARCA.bmp", skillDataId: 3009 },
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b2_2", "b2_4"], icon: "ICON_SKILL_AV_MAYAT.bmp", skillDataId: 3030 },
        
        // Column 3 branch
        { id: "b3_1", col: 3, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_DORBATRASH02.bmp", skillDataId: 3023 },
        { id: "b3_2", col: 3, row: 2, max: 0, val: 0, req: ["b3_1"], icon: "ICON_SKILL_AO_DORBATRASH.bmp", skillDataId: 3028 },
        { id: "b3_3", col: 3, row: 3, max: 0, val: 0, req: ["b3_2"], icon: "ICON_SKILL_AV_AZACA.bmp", skillDataId: 3029 },
        
        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_3", col: 4, row: 3, max: 0, val: 0, req: ["b3_2"], icon: "ICON_SKILL_AO_GRABH.bmp", skillDataId: 3013 }
      ]
    },
    amara: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_100lv_02.bmp", skillDataId: 3033 }
        
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

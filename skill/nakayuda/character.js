// Druka Character Object
const character = {
  name: "Nakayuda",
  level: 45,
  godPoints: 30,
  masteries: {
    blade: {
      skills: [
        // Main branch (column 1)
        //Attacks
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_GLOVEMASTER.bmp", skillDataId: 3201 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: ["root"], icon: "ICON_SKILL_AO_MANTRA.bmp", skillDataId: 3226 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: ["b1_2"], icon: "ICON_SKILL_AO_TRIPLEORAPUNCH.bmp", skillDataId: 3245 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: ["b1_3"], icon: "ICON_SKILL_AO_PAUVAPRYA.bmp", skillDataId: 3206 },

        // Column 2 branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_BARUNAFORCE.bmp", skillDataId: 3203 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AO_BISACRO.bmp", skillDataId: 3222 },
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b2_2"], icon: "ICON_SKILL_AO_PRAPAD.bmp", skillDataId: 3202 },
        { id: "b2_4", col: 2, row: 4, max: 0, val: 0, req: ["b2_3"], icon: "ICON_SKILL_AO_STUN.bmp", skillDataId: 3224 },
        { id: "b2_5", col: 2, row: 5, max: 0, val: 0, req: ["b2_4"], icon: "ICON_SKILL_AO_SURIAFIRECRACK.bmp", skillDataId: 3225 },

        // Column 3 branch
        { id: "b3_1", col: 3, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_MASEMASTER.bmp", skillDataId: 3205 },
        { id: "b3_2", col: 3, row: 2, max: 0, val: 0, req: ["b3_1"], icon: "ICON_SKILL_AO_TAPASASARA.bmp", skillDataId: 3227 },
        { id: "b3_3", col: 3, row: 3, max: 0, val: 0, req: ["b3_2"], icon: "ICON_SKILL_AO_JANATIPARA.bmp", skillDataId: 3262 },
        
        // Column 4 - Independent main branch (no sub branches, no connectors)
        { id: "b4_1", col: 4, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AV_KALATI.bmp", skillDataId: 3209 },
        { id: "b4_2", col: 4, row: 2, max: 0, val: 0, req: ["b4_1"], icon: "ICON_SKILL_AO_ZAMS.bmp", skillDataId: 3257 }

      ]
    },
    archery: {
      skills: [
        // Main branch (column 1)
        //Defenses
      ]
    },
    support: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_CUNDALINIRISE02.bmp", skillDataId: 3298 },
        { id: "b1_2", col: 1, row: 2, max: 0, val: 0, req: [], icon: "ICON_SKILL_AV_SCANDAPURI.bmp", skillDataId: 3299 },
        { id: "b1_3", col: 1, row: 3, max: 0, val: 0, req: [], icon: "ICON_SKILL_AV_INDRAZALA.bmp", skillDataId: 3215 },
        { id: "b1_4", col: 1, row: 4, max: 0, val: 0, req: [], icon: "ICON_SKILL_P_BALUCA02.bmp", skillDataId: 3297 },

        // Column 2 branches
        { id: "b2_1", col: 2, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AV_ORASHIELD.bmp", skillDataId: 3242 },
        { id: "b2_2", col: 2, row: 2, max: 0, val: 0, req: ["b2_1"], icon: "ICON_SKILL_AO_MANTRASKIN.bmp", skillDataId: 3243 },
        { id: "b2_3", col: 2, row: 3, max: 0, val: 0, req: ["b2_2"], icon: "ICON_SKILL_AV_DEHINUTARA.bmp", skillDataId: 3217 },
        
        // Column 3 branch
        { id: "b3_1", col: 3, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_ASTAKAROHATI02.bmp", skillDataId: 3211 },
        { id: "b3_2", col: 3, row: 2, max: 0, val: 0, req: [], icon: "ICON_SKILL_AO_JAHATI.bmp", skillDataId: 3256 }
        
      ]
    },
    amara: {
      skills: [
        // Main branch (column 1)
        { id: "root", col: 1, row: 1, max: 0, val: 0, req: [], icon: "ICON_SKILL_100lv_05.bmp", skillDataId: 3264 }
        
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

/**
 * KathanaDB Data Parser
 * Loads and parses Items, Monsters, and NPCs from TantraParam.xml
 */

class DataParser {
  constructor() {
    this.items = [];
    this.monsters = [];
    this.npcs = [];
    this.isLoaded = false;
  }

  /**
   * Load all data from TantraParam.xml
   */
  async loadData() {
    try {
      console.log('📂 Loading KathanaDB data...');

      // Load XML file
      const xmlResponse = await fetch('TantraParam.xml');
      if (!xmlResponse.ok) {
        throw new Error('Failed to load TantraParam.xml');
      }

      const xmlText = await xmlResponse.text();
      this.parseXML(xmlText);

      this.isLoaded = true;
      console.log(`✅ Loaded ${this.items.length} items, ${this.monsters.length} monsters, ${this.npcs.length} NPCs`);
      return {
        itemsCount: this.items.length,
        monstersCount: this.monsters.length,
        npcsCount: this.npcs.length
      };
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.showLoadingError();
      throw error;
    }
  }

  /**
   * Parse XML content
   */
  parseXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parse errors
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('XML Parse Error');
    }

    // Find Item worksheet
    const worksheets = xmlDoc.getElementsByTagName('Worksheet');

    for (let ws of worksheets) {
      const sheetName = ws.getAttribute('ss:Name');

      if (sheetName === 'Item') {
        this.parseItemSheet(ws);
      } else if (sheetName === 'Monster') {
        this.parseMonsterSheet(ws);
      } else if (sheetName === 'NPC') {
        this.parseNPCSheet(ws);
      }
    }
  }

  /**
   * Parse Item worksheet
   */
  parseItemSheet(worksheet) {
    const rows = worksheet.getElementsByTagName('Row');

    // Skip header row (first row)
    for (let i = 1; i < rows.length; i++) {
      const item = this.parseItemRow(rows[i]);
      if (item) {
        this.items.push(item);
      }
    }

    this.items.sort((a, b) => a.id - b.id);
    console.log(`✅ Parsed ${this.items.length} items`);
  }

  /**
   * Parse a single item row from XML
   */
  parseItemRow(row) {
    const cells = row.getElementsByTagName('Cell');

    const getCellValue = (index) => {
      if (index >= cells.length) return null;
      const dataEl = cells[index].getElementsByTagName('Data')[0];
      return dataEl ? dataEl.textContent.trim() : null;
    };

    try {
      const id = parseInt(getCellValue(1)) || 0;
      if (id <= 0) return null;

      return {
        id: id,
        name: getCellValue(2) || 'Unknown',
        kor_name: getCellValue(2) || '',
        kor_desc: getCellValue(3) || '',
        chi_name: getCellValue(4) || '',
        chi_desc: getCellValue(5) || '',
        phil_name: getCellValue(6) || '',
        phil_desc: getCellValue(7) || '',
        indo_name: getCellValue(8) || '',
        indo_desc: getCellValue(9) || '',
        jp_name: getCellValue(10) || '',
        jp_desc: getCellValue(11) || '',
        taiwan_name: getCellValue(12) || '',
        taiwan_desc: getCellValue(13) || '',
        mexico_name: getCellValue(14) || '',
        mexico_desc: getCellValue(15) || '',
        level: parseInt(getCellValue(16)) || 0,
        byteLimitLevel: parseInt(getCellValue(62)) || 0,
        class: parseInt(getCellValue(17)) || 0,
        type: parseInt(getCellValue(18)) || 0,
        buy_price: parseInt(getCellValue(19)) || 0,
        sell_price: parseInt(getCellValue(20)) || 0,
        cash_price: parseInt(getCellValue(21)) || 0,
        durability: parseInt(getCellValue(23)) || 0,
        stack_count: parseInt(getCellValue(24)) || 1
      };
    } catch (error) {
      console.error('Error parsing item row:', error);
      return null;
    }
  }

  /**
   * Parse Monster worksheet
   */
  parseMonsterSheet(worksheet) {
    const rows = worksheet.getElementsByTagName('Row');

    // Skip header row (first row)
    for (let i = 1; i < rows.length; i++) {
      const monster = this.parseMonsterRow(rows[i]);
      if (monster) {
        this.monsters.push(monster);
      }
    }

    this.monsters.sort((a, b) => a.id - b.id);
    console.log(`✅ Parsed ${this.monsters.length} monsters`);
  }

  /**
   * Parse a single monster row from XML
   */
  parseMonsterRow(row) {
    const cells = row.getElementsByTagName('Cell');

    const getCellValue = (index) => {
      if (index >= cells.length) return null;
      const dataEl = cells[index].getElementsByTagName('Data')[0];
      return dataEl ? dataEl.textContent.trim() : null;
    };

    try {
      // Monster worksheet structure (0-indexed):
      // Languages: [0]=chi, [1]=phil, [2]=indo, [3]=jp, [4]=taiwan, [5]=mexico, [6]=kor
      // [10]=ID, [11]=byteLevel, [21]=byteAggrCond, [34]=nPopDelayMin, [35]=nPopDelayMax
      // [45]=byteArmorType, [46]=nHP, [47]=byteHPRecovery, [48]=iAttackRate, [49]=iDodgeRate
      // [50]=iAC, [51-54]=resistances, [55-56]=speeds, [59]=nRewardGold, [60]=nRewardPrana
      // [61-68]=idSkill0-7, [82-97]=item drops, [98-101]=loot grades

      const id = parseInt(getCellValue(10)) || 0;
      if (id <= 0) return null;

      // Parse item drops (8 items with drop rates)
      const itemDrops = [];
      for (let i = 0; i < 8; i++) {
        const itemId = parseInt(getCellValue(82 + i * 2)) || 0;
        const dropRate = getCellValue(83 + i * 2) || '0';
        if (itemId > 0) {
          itemDrops.push({ itemId, dropRate });
        }
      }

      // Parse skills (8 skills)
      const skills = [];
      for (let i = 0; i < 8; i++) {
        const skillId = parseInt(getCellValue(61 + i)) || 0;
        if (skillId > 0) {
          skills.push(skillId);
        }
      }

      return {
        // Basic Info
        id: id,
        sID: id,
        name: getCellValue(1) || 'Unknown',  // Philippine name as default
        sName: getCellValue(1) || 'Unknown',
        chi_name: getCellValue(0) || '',
        phil_name: getCellValue(1) || '',
        indo_name: getCellValue(2) || '',
        jp_name: getCellValue(3) || '',
        taiwan_name: getCellValue(4) || '',
        mexico_name: getCellValue(5) || '',
        kor_name: getCellValue(6) || '',

        // Stats
        level: parseInt(getCellValue(11)) || 0,
        byteLevel: parseInt(getCellValue(11)) || 0,
        byteAggrCond: parseInt(getCellValue(21)) || 0,
        byteArmorType: parseInt(getCellValue(45)) || 0,

        // Spawning
        nPopDelayMin: parseInt(getCellValue(34)) || 0,
        nPopDelayMax: parseInt(getCellValue(35)) || 0,

        // HP
        hp: parseInt(getCellValue(46)) || 0,
        nHp: parseInt(getCellValue(46)) || 0,
        byteHPRecovery: parseInt(getCellValue(47)) || 0,

        // Combat
        iAttackRate: parseInt(getCellValue(48)) || 0,
        iDodgeRate: parseInt(getCellValue(49)) || 0,
        iAC: parseInt(getCellValue(50)) || 0,

        // Resistances
        iFireResist: parseInt(getCellValue(51)) || 0,
        iColdResist: parseInt(getCellValue(52)) || 0,
        iLightningResist: parseInt(getCellValue(53)) || 0,
        iPoisonResist: parseInt(getCellValue(54)) || 0,

        // Movement
        iWalkSpeed: parseInt(getCellValue(55)) || 0,
        iRunSpeed: parseInt(getCellValue(56)) || 0,

        // Rewards
        nRewardGold: parseInt(getCellValue(59)) || 0,
        exp: parseInt(getCellValue(60)) || 0,  // For backward compatibility
        nRewardPrana: parseInt(getCellValue(60)) || 0,
        gold: parseInt(getCellValue(59)) || 0,  // For backward compatibility

        // Skills
        skills: skills,

        // Item Drops
        itemDrops: itemDrops,

        // Loot Groups
        byteItem8Grade: parseInt(getCellValue(98)) || 0,
        sItem8DropRate: getCellValue(99) || '0',
        byteItem9Grade: parseInt(getCellValue(100)) || 0,
        sItem9DropRate: getCellValue(101) || '0'
      };
    } catch (error) {
      console.error('Error parsing monster row:', error);
      return null;
    }
  }

  /**
   * Parse NPC worksheet
   */
  parseNPCSheet(worksheet) {
    const rows = worksheet.getElementsByTagName('Row');

    // Skip header row (first row)
    for (let i = 1; i < rows.length; i++) {
      const npc = this.parseNPCRow(rows[i]);
      if (npc) {
        this.npcs.push(npc);
      }
    }

    this.npcs.sort((a, b) => a.id - b.id);
    console.log(`✅ Parsed ${this.npcs.length} NPCs`);
  }

  /**
   * Parse a single NPC row from XML
   */
  parseNPCRow(row) {
    const cells = row.getElementsByTagName('Cell');

    const getCellValue = (index) => {
      if (index >= cells.length) return null;
      const dataEl = cells[index].getElementsByTagName('Data')[0];
      return dataEl ? dataEl.textContent.trim() : null;
    };

    try {
      const id = parseInt(getCellValue(1)) || 0;
      if (id <= 0) return null;

      // NPC worksheet structure (0-indexed):
      // [0]: Note, [1]: ID, [2]: Note (duplicate)
      // [3]: kor_szName, [4]: chi_szName, [5]: philippine_szName
      // [6]: indonesia_szName, [7]: jp_szName, [8]: taiwan_szName
      // [9]: mexico_szName, [10]: byteSize, [11]: byteZone
      return {
        id: id,
        sID: id,
        name: getCellValue(3) || 'Unknown',  // Default to Korean name
        sName: getCellValue(3) || 'Unknown',
        kor_name: getCellValue(3) || '',
        chi_name: getCellValue(4) || '',
        phil_name: getCellValue(5) || '',
        indo_name: getCellValue(6) || '',
        jp_name: getCellValue(7) || '',
        taiwan_name: getCellValue(8) || '',
        mexico_name: getCellValue(9) || '',
        type: getCellValue(10) || 'Unknown',
        location: getCellValue(11) || 'Unknown'
      };
    } catch (error) {
      console.error('Error parsing NPC row:', error);
      return null;
    }
  }

  /**
   * Show loading error message
   */
  showLoadingError() {
    const resultsSection = document.getElementById('resultsSection');
    const noResults = document.getElementById('noResults');
    if (resultsSection && noResults) {
      resultsSection.style.display = 'block';
      noResults.innerHTML = '<p>❌ Failed to load database files. Ensure JSON files are in the same directory.</p>';
      noResults.style.display = 'block';
    }
  }

  /**
   * Search across all data types
   */
  search(query, limit = 50) {
    if (!query || query.trim().length < 3) {
      return { items: [], monsters: [], npcs: [] };
    }

    const lowerQuery = query.toLowerCase().trim();

    return {
      items: this.searchItems(lowerQuery, limit),
      monsters: this.searchMonsters(lowerQuery, limit),
      npcs: this.searchNPCs(lowerQuery, limit)
    };
  }

  /**
   * Search items
   */
  searchItems(query, limit = 50) {
    return this.items
      .filter(item => {
        const names = [
          item.phil_name || '',
          item.name || '',
          item.desc || '',
          String(item.id || '')
        ].join(' ').toLowerCase();
        return names.includes(query);
      })
      .slice(0, limit);
  }

  /**
   * Search monsters
   */
  searchMonsters(query, limit = 50) {
    return this.monsters
      .filter(monster => {
        const names = [
          monster.chi_name || '',
          monster.kor_name || '',
          monster.name || '',
          monster.sName || '',
          monster.jp_name || '',
          monster.taiwan_name || '',
          monster.mexico_name || '',
          monster.phil_name || '',
          monster.indo_name || '',
          String(monster.id || ''),
          String(monster.sID || '')
        ].join(' ').toLowerCase();
        return names.includes(query);
      })
      .slice(0, limit);
  }

  /**
   * Search NPCs
   */
  searchNPCs(query, limit = 50) {
    return this.npcs
      .filter(npc => {
        const names = [
          npc.name || '',
          npc.sName || '',
          npc.kor_name || '',
          npc.chi_name || '',
          npc.phil_name || '',
          npc.indo_name || '',
          npc.jp_name || '',
          npc.taiwan_name || '',
          npc.mexico_name || '',
          npc.type || '',
          npc.location || '',
          String(npc.id || ''),
          String(npc.sID || '')
        ].join(' ').toLowerCase();
        return names.includes(query);
      })
      .slice(0, limit);
  }

  /**
   * Get item by ID
   */
  getItemById(id) {
    return this.items.find(item => item.id === parseInt(id));
  }

  /**
   * Get icon for item
   */
  getItemIcon(itemId) {
    return this.iconMap[itemId] || 'placeholder.bmp';
  }
}

// Global parser instance
const dataParser = new DataParser();

// Auto-load data when page loads
window.addEventListener('load', () => {
  dataParser.loadData().then(() => {
    // Update menu with correct item counts after data is loaded
    if (typeof updateMenuWithCounts === 'function') {
      updateMenuWithCounts();
    }
  }).catch(error => {
    console.error('Failed to load data:', error);
  });
});

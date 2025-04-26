/**
 * @file LevelManager.js
 * @description Manages game level progression, tile generation, slime and gem distribution.
 *    Handles difficulty scaling based on current level and generates appropriate level layouts.
 * 
 * 
 * Called By: GameController
 * Calls: None
 */
export class LevelManager {
  /**
   * @constructor
   * @description Initializes the LevelManager
   * @param {Object} assets - Game assets reference
   * @param {number} totalFamesPerSecond - App ticker frame rate
   * @param {number} c_width - Canvas width for dimension-based calculations
   */
  constructor(assets, totalFamesPerSecond, c_width) {
    this.assets = assets;
    this.totalFamesPerSecond = totalFamesPerSecond;
    this.c_width = c_width;

    this.currentLevel = 1;
    this.maxLevel = 12;
    
    this.jumpDuration = 500;
    this.maxWalkSpeed = 5;
    this.maxRunSpeed = 15;
    
    // Calculate jump distances based on speed and frame rate
    this.xJumpDistanceW = this.jumpDuration / 1000 * this.totalFamesPerSecond * this.maxWalkSpeed;
    this.xJumpDistanceR = this.jumpDuration / 1000 * this.totalFamesPerSecond * this.maxRunSpeed;
    
    // Tile spacing parameters (based on jump distances)
    this.minTileSpace = this.xJumpDistanceW * 0.5;
    this.maxTileSpace = this.xJumpDistanceR * 0.9;

    // Tile size parameters (based on canvas width)
    this.minRoadTileWidth = c_width * 0.4;
    this.maxRoadTileWidth = c_width * 1.5;

    // Level sequence containers
    this.slimeSequence = [];  // Array of slime counts per tile [red, green, blue]
    this.tileSequence = [];   // Array of tile widths
    this.gemSequence = [];    // Array of gem types between tiles
    this.sequencePointer = 0; // Current position in sequences
    this.lastSpace = 0;       // Last generated space between tiles

    this.diamondAllocation = this._generateDiamondAllocation();
    this._createTileSequence();
    this._createSlimeSequence();
    this._createGemSequence();
  }

  /**
   * @private
   * @method _createSlimeSequence
   * @description Generates slime distribution across tiles based on current level
   *              Implements progressive difficulty:
   *              - Levels 1-3: Only blue slimes
   *              - Levels 4-6: Blue and green slimes
   *              - Levels 7-9: All slime types with increasing difficulty
   *              - Levels 10-12: Complex slime distributions
   */
  _createSlimeSequence() {
    this.slimeSequence = new Array(this.tileSequence.length).fill().map(() => [0, 0, 0]);
    const sortedTiles = [...this.tileSequence].sort((a, b) => a - b);
    const minWidth = sortedTiles[0];
    const maxWidth = sortedTiles[sortedTiles.length - 1];
    const widthRange = maxWidth - minWidth;

    // Helper function to get tile's width percentile
    const getTilePercentile = (width) => (width - minWidth) / widthRange;

    if (this.currentLevel <= 3) {
      // Level 1-3: Each tile has at least 1 blue slime + chance for second blue
      for (let i = 0; i < this.tileSequence.length; i++) {
        this.slimeSequence[i][2] = 1;
        if (Math.random() < 0.1 * this.currentLevel) {
          this.slimeSequence[i][2]++;
        }
      }
    }
    else if (this.currentLevel <= 6) {
      // Level 4-6: Total 12 blue slimes + green slime chances
      let blueSlimesRemaining = 12;

      // First pass: distributes minimum blue slimes
      for (let i = 0; i < this.tileSequence.length && blueSlimesRemaining > 0; i++) {
        this.slimeSequence[i][2]++;
        blueSlimesRemaining--;
      }

      // Second pass: adds remaining blue slimes randomly
      while (blueSlimesRemaining > 0) {
        const randomTile = Math.floor(Math.random() * this.tileSequence.length);
        this.slimeSequence[randomTile][2]++;
        blueSlimesRemaining--;
      }

      // Add green slimes
      for (let i = 0; i < this.tileSequence.length; i++) {
        if (Math.random() < 0.2 * (this.currentLevel - 3)) {
          this.slimeSequence[i][1]++;
        }
      }
    }
    else if (this.currentLevel <= 9) {
      const blueSlimesTotal = 12 + (this.currentLevel - 6) * 2;
      let blueSlimesRemaining = blueSlimesTotal;

      // Sort tiles by width for percentile-based placement
      const tilesWithIndices = this.tileSequence.map((width, idx) => ({ width, idx }))
        .sort((a, b) => a.width - b.width);

      // assign minimum one blue slime per tile
      for (const { idx } of tilesWithIndices) {
        this.slimeSequence[idx][2] = 1;
        blueSlimesRemaining--;
      }

      // add rest of the slimes
      for (const { width, idx } of tilesWithIndices) {
        const percentile = getTilePercentile(width);

        // 30-65% width range
        if (percentile > 0.3) {
          //add an additional blue slime
          if (blueSlimesRemaining > 0 && Math.random() < 0.5) {
            this.slimeSequence[idx][2]++;
            blueSlimesRemaining--;
          }
          const slimeType = Math.random() < 0.5 ? 0 : 1;
          this.slimeSequence[idx][slimeType] = 1;

        } else if (percentile >= 0.65) {
          if (Math.random() < 0.6) this.slimeSequence[idx][1] += 1;
          if (Math.random() < 0.6) this.slimeSequence[idx][0] += 1;
        }
      }
    }
    else {
      // Level 10-12
      const tilesWithIndices = this.tileSequence.map((width, idx) => ({ width, idx }))
        .sort((a, b) => a.width - b.width);

      for (const { width, idx } of tilesWithIndices) {
        const percentile = getTilePercentile(width);

        if (percentile < 0.1) {
          // 0-10%: no slimes
          continue;
        }
        else if (percentile < 0.2) {
          // 10-20%: one slime (blue or green)
          const slimeType = Math.random() < 0.5 ? 2 : 1;
          this.slimeSequence[idx][slimeType] = 1;
        }
        else if (percentile < 0.7) {
          // 20-70%: at least one of each type
          this.slimeSequence[idx][2] = 1;
          this.slimeSequence[idx][1] = Math.floor(Math.random() * 2) + 1;
          this.slimeSequence[idx][0] = 1;
        }
        else {
          // 70-100%: multiple slimes allowed
          const blueCount = 2 * (this.currentLevel - 9);
          const GreenRedCount = this.currentLevel - 9;

          this.slimeSequence[idx][2] = Math.floor(Math.random() * blueCount) + 2;
          this.slimeSequence[idx][1] = Math.floor(Math.random() * GreenRedCount) + 1;
          this.slimeSequence[idx][0] = Math.floor(Math.random() * GreenRedCount) + 1;
        }
      }
    }
  }

  /**
   * @private
   * @method _createTileSequence
   * @description Generates a sequence of tile widths based on current level
   *              Implements progressive difficulty:
   *              - Levels 1-3: Fewer, larger tiles
   *              - Levels 4-6: More tiles, some with smaller size
   *              - Levels 7-9: More tiles with greater variation
   *              - Levels 10-12: More tiles with 100% range
   */
  _createTileSequence() {
    this.tileSequence = [];
    const widthRange = this.maxRoadTileWidth - this.minRoadTileWidth;
    const tileCount = this.currentLevel * 2 + 10;
    let tileGroups = [];

    // Level 1-3: 8 tiles, starting at 70-100% range shrinking by 10% per level
    if (this.currentLevel <= 3) {
      const levelShrink = 0.1 * this.currentLevel;

      tileGroups = [
        { weight: 1.0, min: 0.7 - levelShrink, max: 1.0 }
      ];
    }
    // Level 4-6: 12 tiles, 49-100% range
    else if (this.currentLevel <= 6) {
      const levelShrink = 0.07 * (this.currentLevel - 3);
      const lvlMin = 0.49 - levelShrink;
      const lvlMid = lvlMin + (1 - lvlMin) / 2;

      //50% of tiles are 0-50%range, 50% of tiles are 50-100%range
      tileGroups = [
        { weight: 0.5, min: lvlMin, max: lvlMid },
        { weight: 0.5, min: lvlMid, max: 1.0 }
      ];
    }
    // Level 7-9: 16 tiles, 25-100% range 
    else if (this.currentLevel <= 9) {
      const levelShrink = 0.08 * (this.currentLevel - 6);
      const lvlMin = 0.49 - levelShrink;
      const range = 1 - lvlMin;

      // 30% of tiles are 0-30%range, 45% of tiles are 30-65%range, 25% of tiles are 65-100%range
      tileGroups = [
        { weight: 0.3, min: lvlMin, max: lvlMin + range * 0.3 },
        { weight: 0.45, min: lvlMin + range * 0.3, max: lvlMin + range * 0.65 },
        { weight: 0.25, min: lvlMin + range * 0.65, max: 1.0 }
      ];
    }
    // Level 10-12: 20 tiles, 0-100% range
    else {
      const levelShrink = 0.083 * (this.currentLevel - 9);
      const lvlMin = 0.25 - levelShrink;
      const range = 1 - lvlMin;

      // 20% of tiles are 0-20%, 60% of tiles are 20-60%, 20% of tiles are 60-100%
      tileGroups = [
        { weight: 0.2, min: lvlMin, max: lvlMin + range * 0.2 },
        { weight: 0.6, min: lvlMin + range * 0.2, max: lvlMin + range * 0.6 },
        { weight: 0.2, min: lvlMin + range * 0.6, max: 1.0 }
      ];
    }

    // Generate tiles based on selected groups
    for (let i = 0; i < tileCount; i++) {
      const group = this._selectWeightedGroup(tileGroups);
      const widthFactor = group.min + Math.random() * (group.max - group.min);
      this.tileSequence.push(this.minRoadTileWidth + (widthFactor * widthRange));
    }

    this._balanceTotalWidth();
  }

  /**
   * @private
   * @method _selectWeightedGroup
   * @description Selects a tile group based on weighted probabilities
   * @param {Array} groups - Array of tile group definitions with weights
   * @returns {Object} Selected tile group
   */
  _selectWeightedGroup(groups) {
    const totalWeight = groups.reduce((sum, g) => sum + g.weight, 0);
    let random = Math.random() * totalWeight;

    for (const group of groups) {
      if (random < group.weight) return group;
      random -= group.weight;
    }
    return groups[0];
  }

  /**
   * @private
   * @method _balanceTotalWidth
   * @description Adjusts tile widths to maintain consistent total level width
   *              based on current level
   */
  _balanceTotalWidth() {
    const targetWidth = this.c_width * (10 + this.currentLevel);
    const currentWidth = this.tileSequence.reduce((sum, w) => sum + w, 0);

    const ratio = targetWidth / currentWidth;
    this.tileSequence = this.tileSequence.map(w => Math.floor(w * ratio));
  }

  /**
   * @private
   * @method _getTileSpace
   * @description Calculates space between tiles based on current level
   * @returns {number} Space between tiles in pixels
   */
  _getTileSpace() {
    // Level 1-3: walking jump distance (75 + random(150-75))
    if (this.currentLevel <= 3)
      return Math.floor(Math.random() * (this.xJumpDistanceW - this.minTileSpace)) + this.minTileSpace;
    // Level 4-6: some walking, some running jump distance (75 + random(202.5-75))
    else if (this.currentLevel <= 6)
      return Math.floor(Math.random() * (this.maxTileSpace * 0.5 - this.minTileSpace)) + this.minTileSpace;
    // Level 7-12: all running speed jump distance (150 + random(405-75))
    else
      return Math.floor(Math.random() * (this.maxTileSpace - this.xJumpDistanceW)) + this.xJumpDistanceW;
  }

  /**
   * @private
   * @method _randomAllocation
   * @description Randomly allocates diamonds across difficulty levels
   * @param {number} maxAllowed - Maximum number of items to allocate
   * @returns {Array} Allocation array [easy, medium, hard]
   */
  _randomAllocation(maxAllowed) {
    let remaining = maxAllowed;
    let allocation = [0, 0, 0];
    while (remaining > 0) {
      const level = Math.floor(Math.random() * 3);
      if (allocation[level] < 2) { // Max 2 per level
        allocation[level]++;
        remaining--;
      }
    }
    return allocation;
  }

  /**
   * @private
   * @method _generateDiamondAllocation
   * @description Generates diamond distribution across all levels
   * @returns {Array} Diamond allocation per level
   */
  _generateDiamondAllocation() {
    // Level 1-3: No diamonds
    let allocation = [0,0,0];
    let temp = []
    // level 4-6: 1 diamond
    temp = this._randomAllocation(1);
    allocation = [...allocation, ...temp];
    // level 7-9: 3 diamonds
    temp = this._randomAllocation(3);
    allocation = [...allocation, ...temp];
    // level 10-12: 5 diamonds
    temp = this._randomAllocation(5);
    allocation = [...allocation, ...temp];

    return allocation;
  }

  /**
   * @private
   * @method _createGemSequence
   * @description Generates sequence of gems between tiles based on current level
   *              Includes diamonds and hearts with level-appropriate distribution
   */
  _createGemSequence() {
    this.gemSequence = [];
    let gems = [];

    const diamonds = this.diamondAllocation[this.currentLevel-1];
    const hearts =  Math.max(0, this.currentLevel - 2);

    if (diamonds > 0) {
      gems=[...Array(diamonds).fill('diamond')];
    }
    if (hearts > 0) {
      gems=[...gems,...Array(hearts).fill('heart')];
    }

    const totalSpaces = this.tileSequence.length - 1;
    if (this.currentLevel >= this.maxLevel-1)
      while (gems.length < totalSpaces-4 ) gems.push('diamond');
    else 
      while (gems.length < totalSpaces ) gems.push('');
    this._shuffleArray(gems);
    if (this.currentLevel >= this.maxLevel-1)
      while (gems.length < totalSpaces ) gems.push('');

    this.gemSequence = gems;
    console.log('Gems:', this.gemSequence);
  }

  /**
   * @private
   * @method _shuffleArray
   * @description Fisher-Yates shuffle algorithm for randomizing arrays
   * @param {Array} arr - Array to shuffle
   * @returns {Array} Shuffled array
   */
  _shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * @method getIsSlimeMoving
   * @description Determines if slimes should move based on current level
   * @returns {boolean} True if slimes should move, false otherwise
   */
  getIsSlimeMoving() {

    if (this.currentLevel <= 6 && this.currentLevel > 3)
      return Math.random() < 0.5;
    else if (this.currentLevel <= 9)
      return Math.random() < 0.4;
    else if (this.currentLevel <= 12)
      return true;
    else 
      return false;
  }

  /**
   * @method getTileInfo
   * @description Gets information about the current tile and advances sequence pointer
   * @returns {Object} Tile information including:
   *                   - tileWidth: width of current tile
   *                   - slimeInfo: slime distribution on tile
   *                   - tileSpace: space after tile
   *                   - gemType: gem after tile (if any)
   *                   - isLastTile: flag for last tile in sequence to trigger regeneration
   */
  getTileInfo() {
    const tileWidth = this.tileSequence[this.sequencePointer];
    const slimeInfo = this.slimeSequence[this.sequencePointer];
    const gemType = this.sequencePointer >= this.tileSequence.length - 1 ? '' : this.gemSequence[this.sequencePointer];
    const tileSpace = this.sequencePointer >= this.tileSequence.length - 1 ? 0 : this._getTileSpace();
    this.lastSpace = tileSpace;
    let isLastTile = false;
    this.sequencePointer++;
    if (this.sequencePointer >= this.tileSequence.length - 1) {
      isLastTile = true;
      this.sequencePointer = 0;
      this._createTileSequence();
      this._createSlimeSequence();
      this._createGemSequence();
    }
    return {
      tileWidth: tileWidth,
      slimeInfo: slimeInfo,
      tileSpace: tileSpace,
      gemType: gemType,
      isLastTile: isLastTile,
    };
  }

  /**
   * @method levelUp
   * @description Advances to the next level and regenerates level sequences
   */
  levelUp() {
    this.currentLevel++;
  }

  /**
   * @method getLevel
   * @description Gets current level
   * @returns {number} Current level (1-12)
   */
  getLevel() {
    return this.currentLevel;
  }

  /**
   * @method getJumpDuration
   * @description Gets base jump duration in ms
   * @returns {number} Jump duration in milliseconds
   */
  getJumpDuration() {
    return this.jumpDuration;
  }

  /**
   * @method getMaxWalkSpeed
   * @description Gets maximum walking speed
   * @returns {number} Pixels per frame
   */
  getMaxWalkSpeed() {
    return this.maxWalkSpeed;
  }

  /**
   * @method getMaxRunSpeed
   * @description Gets maximum running speed
   * @returns {number} Pixels per frame
   */
  getMaxRunSpeed() {
    return this.maxRunSpeed;
  }

  /**
   * @method getLastTileSpace
   * @description Gets last generated space between tiles
   * @returns {number} Space in pixels
   */
  getLastTileSpace() {
    return this.lastSpace;
  }

  /**
   * @method getMaxLevel
   * @description Gets maximum level
   * @returns {number} Maximum level (12)
   */
  getMaxLevel() {
    return this.maxLevel;
  }
}
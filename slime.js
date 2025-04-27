/**
 * @file Slime.js
 * @description Handles slime creation, rendering, and movement.
 * 
 * Called By: GameController
 * Calls: Assets manager for gem textures and properties
 */
export class Slime {
  /**
   * @constructor
   * @description Initializes a slime with specified type and position
   * @param {PIXI.Container} container - Parent container for the slime
   * @param {number} iniX - Initial x position
   * @param {number} iniY - Initial y position
   * @param {Assets} assets - Game assets manager
   * @param {number} screenHeight - Height of the canvas
   * @param {boolean} isMoving - Flag to check if the slime is moving
   * @param {number} type - Type of slime (0: red, 1: green, 2: blue)
   * @param {number} currentLevel - Current game level
   */
  constructor(container, iniX, iniY, assets, screenHeight, isMoving, type, currentLevel) {
    this.assets = assets;
    this.animationSpeed = 0.1;
    this.iniX = iniX;
    this.iniY = iniY;
    this.isMoving = isMoving;
    this.currentLevel = currentLevel;

    this.type = null;
    if (type === 0) this.type = 'red';
    else if (type === 1) this.type = 'green';
    else this.type = 'blue';

    this.screenHeight = screenHeight; //red jump
    this.movementDirection = Math.random() > 0.5 ? 1 : -1; //green movement
    this.jumpPhase = 0;
    this.isJumping = false;
    this.textures = this._getSlimeTextures(false);
    this.animatedSlime = null;

    this._createSlime(container, iniX, iniY);
  }
  /**
   * @private
   * @method _getSlimeTextures
   * @description Returns the appropriate textures for the slime based on its type and state
   * @param {boolean} isJumping - Flag to check if the slime is jumping
   * @returns {PIXI.Texture[]} - Array of textures for the slime
   *  */
  _getSlimeTextures(isJumping) {
    switch (this.type) {
      case 'blue':
        return this.assets.getBlueSlimeTextures();
      case 'green':
        // Alternate between left/right facing textures
        return this.movementDirection > 0
          ? this.assets.getGreenSlimeRightTextures()
          : this.assets.getGreenSlimeLeftTextures();
      case 'red':
        return isJumping
          ? this.assets.getRedSlimeJumpTextures()
          : this.assets.getRedSlimeIdleTextures();
      default:
        throw new Error(`Unknown slime type: ${this.type}`);
    }
  }

  /**
   * @private
   * @method _createSlime
   * @description Creates and positions all visual elements for the slime
   * @param {PIXI.Container} container - Parent container for the slime
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   */
  _createSlime(container, x, y) {
    this.animatedSlime = new PIXI.AnimatedSprite(this.textures);
    this.animatedSlime.animationSpeed = this.animationSpeed;
    this.animatedSlime.anchor.set(0.5, 1);
    this.animatedSlime.play();
    this.animatedSlime.x = x;
    this.animatedSlime.y = y;
    container.addChild(this.animatedSlime);
  }

  /**
   * @private
   * @method _moveGreenSlime
   * @description Moves the green slime left or right based on its direction
   * @param {number} startX - Starting x position for movement
   * @param {number} endX - Ending x position for movement
   */
  _moveGreenSlime(startX, endX) {
    const movementProb = this._getMovementProb();
    if (Math.random() < movementProb || !(this.animatedSlime.x > startX && this.animatedSlime.x < endX)) {
      return;
    }
    const moveSpeed = 0.5;
    this.animatedSlime.x += this.movementDirection * moveSpeed;
  }

  /**
   * @private
   * @method _switchTextures
   * @description Switches the textures of the red slime based on its jumping state
   * @param {boolean} isJumping - Flag to check if the slime is jumping
   */
  _switchTextures(isJumping) {
    const newTextures = this._getSlimeTextures(isJumping);
    if (this.animatedSlime.textures !== newTextures) {
      this.animatedSlime.textures = newTextures;
      this.animatedSlime.play();
    }
  }

  /**
   * @private
   * @method _moveRedSlime
   * @description Handles the jumping and landing of the red slime
   * @param {number} maxJumpHeight - Maximum height of the jump
   */
  _moveRedSlime(maxJumpHeight) {
    const movementProb = this._getMovementProb();
    if (this.jumpPhase <= 0 && Math.random() < movementProb) {
      const minHeight = maxJumpHeight * 0.5;
      const maxHeight = maxJumpHeight;
      this.jumpHeight = minHeight + Math.random() * (maxHeight - minHeight);
      this.jumpPhase = 60;
      this.isJumping = true;


      this._switchTextures(true);
      const jumpDuration = 60;
      const jumpAnimationFrames = this.assets.getRedSlimeJumpTextures().length;
      this.animatedSlime.animationSpeed = jumpAnimationFrames / jumpDuration;
    }

    if (this.jumpPhase > 0) {
      this.jumpPhase--;
      const progress = this.jumpPhase / 60;
      const jumpCurve = 4 * progress * (1 - progress);
      this.animatedSlime.y = this.iniY - (this.jumpHeight * jumpCurve);

      if (this.jumpPhase <= 0) {
        this.isJumping = false;
        this._switchTextures(false);
        this.animatedSlime.animationSpeed = this.animationSpeed;
      }
    } else {
      this.animatedSlime.y = this.iniY;
    }
  }
  /**
   * @method getSlimeType
   * @description Returns the type of the slime
   * @returns {int} - Slime type (0: red, 1: green, 2: blue)
   */
  getSlimeType() {
    if (this.type == 'red') return 0;
    else if (this.type == 'green') return 1;
    else return 2;
  }

  /**
   * @method getSlimeHeight
   * @description Returns the height of the slime
   * @returns {number} - Height of the slime
   */
  getSlimeHeight() {
    return this.animatedSlime.height;
  };

  /**
   * @method getSlimeWidth
   * @description Returns the width of the slime
   * @returns {number} - Width of the slime
   */
  getSlimeWidth() {
    return this.animatedSlime.width;
  }

  /**
   * @method updateSlime
   * @description Updates the position and state of the slime based on game speed
   * @param {number} speed - Current game scroll speed
   * @param {number} tileStartX - Starting x position for movement of green slime
   * @param {number} tileEndX - Ending x position for movement of green slime
   * @param {number} maxJumpHeight - Maximum height of the jump of red slime
   */
  updateSlime(speed, tileStartX, tileEndX, maxJumpHeight) {
    this.animatedSlime.x = this.animatedSlime.x + speed;
    if (!this.isMoving) return;
    switch (this.type) {
      case 'green':
        this._moveGreenSlime(tileStartX, tileEndX);
        break;
      case 'red':
        this._moveRedSlime(maxJumpHeight);
        break;
      default:
        return;
    }
  }

  /**
   * @private
   * @method _getMovementProb
   * @description Returns the movement probability based on the slime's type and current level
   * @returns {number} - Movement probability
   */
  _getMovementProb() {
    if (this.type === 'green') {
      if (this.currentLevel > 3 && this.currentLevel < 6)
        return 0.5;
      else
        return 0.7;
    } else if (this.type === 'red') {
      if (this.currentLevel > 6 && this.currentLevel < 9)
        return 0.1;
      else
        return 0.6;
    }
    return 0;
  }

}
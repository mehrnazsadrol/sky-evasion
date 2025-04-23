/**
 * Slime - Represents a slime enemy in the game with idle animation.
 */
export class Slime {
  /**
   * Creates a Slime instance
   * @param {PIXI.Container} container - The parent container to the slime
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position 
   * @param {Assets} assets - Reference to the game's asset manager
   * @param {string} [type='blue'] - Type of slime (blue, green, or red)
   */
  constructor(container, x, y, assets, type = 'blue') {
    this.assets = assets; 
    this.type = type;
    this.animationSpeed = 0.1;
    this.textures = this._getSlimeTextures();
    this.animatedSlime = null;
    this.jumpedOver = false;
    this._createSlime(container, x, y);
  }

  /**
   * Gets the appropriate textures for the slime type
   * @private
   * @returns {PIXI.Texture[]} Array of textures
   * @throws {Error} If slime type is unknown
   */
  _getSlimeTextures() {
    switch (this.type) {
      case 'blue':
        return this.assets.getBlueSlimeTextures();
      case 'green':
        return this.assets.getGreenSlimeTextures();
      case 'red':
        return this.assets.getRedSlimeTextures();
      default:
        throw new Error(`Unknown slime type: ${this.type}`);
    }
  }

  /**
   * Creates and configures the animated slime
   * @private
   * @param {PIXI.Container} container - Parent container
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
   * Gets the height of the standard slime texture
   */
  getSlimeHeight() {
    return this.textures[0].height;
  }

  /**
   * Gets the width of the standard slime texture  
   */
  getSlimeWidth() {
    return this.textures[0].width;
  }

  /**
   * Updates the slime's x position based on environment movement speed
   */
  setSlimeX(speed) {
    this.animatedSlime.x += speed;
  }
}
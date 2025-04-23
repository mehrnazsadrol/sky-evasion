/**
 * @file Gem.js
 * @description Handles gem creation, rendering, movement, and destruction.
 * 
 * Called By: GameController
 * Calls: Assets manager for gem textures and properties
 */
export class Gem {
  /**
   * @constructor
   * @description Initializes a gem with specified type and position
   * @param {PIXI.Container} container - Parent container for the gem
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {Assets} assets - Game assets manager
   * @param {string} type - Gem type ('diamond' or 'heart')
   */
  constructor(container, x, y, assets, type) {
    this.assets = assets;
    this.type = type;
    this.container = container;
    
    this.animationSpeed = this.assets.getGemAnimationSpeed(type);
    this.textures = this.assets.getGemTextures(type);
    this.scale = this.assets.getGemScale(type);
    
    this.gemContainer = new PIXI.Container();
    this.gemWidth = this.assets.getAdjustedGemWidth(type);
    this.gemHeight = this.assets.getAdjustedGemHeight(type);
    
    this._createGem(x, y);
  }
  
  /**
   * @private
   * @method _createGem
   * @description Creates and positions all visual elements for the gem
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   */
  _createGem(x, y) {
    this.animatedGem = new PIXI.AnimatedSprite(this.textures);
    this.animatedGem.anchor.set(0.5, 1);
    this.animatedGem.scale.set(this.scale);
    this.animatedGem.animationSpeed = this.animationSpeed;
    this.animatedGem.play();

    this.gemContainer.x = x;
    this.gemContainer.y = y;

    const halo = new PIXI.Graphics();
    halo.beginFill(0xFFFFFF, 0.3);
    halo.drawCircle(0, 0, this.gemWidth * 0.5);
    halo.endFill();

    const blurFilter = new PIXI.BlurFilter();
    blurFilter.blur = 6; 
    blurFilter.padding = this.gemWidth;
    halo.filters = [blurFilter];

    halo.y = -this.gemHeight * 0.5;

    this.gemContainer.addChild(halo);
    this.gemContainer.addChild(this.animatedGem);
    this.container.addChild(this.gemContainer);
  }

  /**
   * @method updateGem
   * @description Updates gem position based on game scroll speed
   * @param {number} speed - Current game scroll speed
   */
  updateGem(speed) {
    this.gemContainer.x += speed; // Move with game scrolling
  }

  /**
   * @method getGemX
   * @description Gets current x position of gem
   * @returns {number} Current x position
   */
  getGemX() {
    return this.gemContainer.x;
  }

  /**
   * @method getGemType
   * @description Gets gem type
   * @returns {string} Gem type ('diamond' or 'heart')
   */
  getGemType() {
    return this.type;
  }

  /**
   * @method destroy
   * @description Properly cleans up gem resources when collected/removed
   */
  destroy() {
    this.gemContainer.removeChildren();
    
    this.animatedGem = null;
    this.textures = null;
    
    this.container.removeChild(this.gemContainer);
  }
}
/**
 * Avatar - Manages the game character's animations and state in the game.
 */
export class Avatar {
  constructor(assets) {
    this.assets = assets;
    this.animations = {
      idle: null,
      walk: null,
      run: null,
      jump: null,
      dead: null,
    };

    this.activeAnimation = null;
    this.currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    this.state = 'idle';
  }

  /**
   * Loads all animations for the selected avatar type
   * @param {number} c_width - Canvas width
   * @async
   */
  async loadAnimation(c_width) {
    const avatarType = this.currentAvatarIndex === 0 ? 'girl' : 'boy';
    const avatarConfig = this.assets.getAvatarTextures(avatarType);

    try {
      for (const [key, item] of Object.entries(avatarConfig)) {
        this.animations[key] = this._createAnimatedSprite(item['textures'], key, c_width);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }

  /**
   * Creates and configures an animated sprite
   * @private
   * @param {PIXI.Texture[]} textures - Array of animation frames
   * @param {string} animationKey - Which animation this is
   * @param {number} c_width
   * @returns {PIXI.AnimatedSprite} Configured animated sprite
   */
  _createAnimatedSprite(textures, animationKey, c_width) {
    if (!Array.isArray(textures) || textures.length === 0) {
      throw new Error(`No textures found for animation: ${animationKey}`);
    }
    const sprite = new PIXI.AnimatedSprite(textures);
    sprite.animationSpeed = animationKey === 'run' ? 1 : 0.25;
    sprite.loop = true;
    sprite.width = c_width / 10;
    sprite.height = (c_width / 10) * (textures[0].height / textures[0].width);

    return sprite;
  }

  /**
   * Adds all animations to the stage and initializes the avatar
   * @param {PIXI.Container} container - Parent container
   * @param {number} x - Initial x
   * @param {number} y - Initial y
   */
  addToStage(container, x, y) {
    for (const animation of Object.values(this.animations)) {
      if (animation) {
        container.addChild(animation);
        animation.visible = false;
        animation.x = x;
        animation.y = y;
      }
    }

    this.activeAnimation = this.animations.idle;
    this.activeAnimation.visible = true;
    this.activeAnimation.play();
  }

  /**
   * Internal method to switch animations
   * @private
   * @param {string} animationKey - Which animation to play (defaults to idle)
   */
  _playAnimation(animationKey = 'idle') {
    if (this.activeAnimation) {
      this.activeAnimation.visible = false;
      this.activeAnimation.stop();
    }

    this.activeAnimation = this.animations[animationKey];
    this.activeAnimation.visible = true;
    this.activeAnimation.play();
  }

  /**
   * Changes the avatar's animation state
   * @param {string} state - New state
   */
  setAvatarState(state) {
    if (!this.animations[state]) {
      console.warn(`Animation "${state}" not found.`);
      return;
    }
    this.state = state;
    this._playAnimation(state);
  }

  // ========== GETTER METHODS ========== //

  /**
   * Gets the standard height of the avatar animation
   */
  getAvatarHeight() {
    return this.animations.idle.height;
  }

  /**
   * Gets the standard width of the avatar animation
   */
  getAvatarWidth() {
    return this.animations.idle.width;
  }

  /**
   * Gets current x coordinate
   */
  getAvatarX() {
    return this.activeAnimation.x;
  }

  /**
   * Gets current y coordinate
   */
  getAvatarY() {
    return this.activeAnimation.y;
  }

  /**
   * Gets current animation state
   */
  getAvatarState() {
    return this.state;
  }

  // ========== SETTER METHODS ========== //

  /**
   * Sets x coordinate
   */
  setAvatarX(x) {
    this.activeAnimation.x = x;
  }

  /**
   * Sets y coordinate
   */
  setAvatarY(y) {
    this.activeAnimation.y = y;
  }
}
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
   * Loads assets for the avatar based on the selected avatar type (girl or boy).
   * @param {number} c_width - The width of the container to calculate the avatar size.
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
   * Creates an animated sprite from an array of textures.
   * @param {PIXI.Texture[]} textures - The textures for the animation.
   * @param {string} animationKey - The key for the animation (e.g., "idle", "walk").
   * @param {number} c_width - The width of the container to calculate the avatar size.
   * @returns {PIXI.AnimatedSprite} - The configured animated sprite.
   */
  _createAnimatedSprite(textures, animationKey, c_width) {
    if (!Array.isArray(textures) || textures.length === 0) {
      throw new Error(`No textures found for animation: ${animationKey}`);
    }
    const sprite = new PIXI.AnimatedSprite(textures);
    sprite.animationSpeed = animationKey === 'run'? 1 : 0.25;
    sprite.loop = true;
    sprite.width = c_width / 10;
    sprite.height = (c_width / 10) * (textures[0].height / textures[0].width);
    return sprite;
  }

  /**
   * Adds all animations to the stage and sets the initial active animation.
   * @param {PIXI.Container} container - The container to add the animations to.
   * @param {number} x - The x-coordinate for the avatar's position.
   * @param {number} y - The y-coordinate for the avatar's position.
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
   * Plays the specified animation.
   * @param {string} animationKey - The key of the animation to play.
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

  /**
   * Returns the height of the idle animation.
   * @returns {number} - The height of the idle animation.
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

  /**
   * Gets current animation state
   */
  getAvatarState() {
    return this.state;
  }
}
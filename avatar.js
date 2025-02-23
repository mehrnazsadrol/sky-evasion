export class Avatar {
  constructor() {
    this.animations = {
      idle: null,
      walk: null,
      run: null,
      jump: null,
      dead: null,
    };
    this.activeAnimation = null;
    this.currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    this.avatarConfig = {
      girl: {
        idle: { url: "res/girl-character/Idle (", count: 16 },
        walk: { url: "res/girl-character/Walk (", count: 20 },
        run: { url: "res/girl-character/Run (", count: 20 },
        jump: { url: "res/girl-character/Jump (", count: 30 },
        dead: { url: "res/girl-character/Dead (", count: 30 },
      },
      boy: {
        idle: { url: "res/boy-character/Idle (", count: 15 },
        walk: { url: "res/boy-character/Walk (", count: 15 },
        run: { url: "res/boy-character/Run (", count: 15 },
        jump: { url: "res/boy-character/Jump (", count: 15 },
        dead: { url: "res/boy-character/Dead (", count: 15 },
      },
    };
  }

  /**
   * Loads assets for the avatar based on the selected avatar type (girl or boy).
   * @param {number} c_width - The width of the container to calculate the avatar size.
   */
  async loadAssets(c_width) {
    const avatarType = this.currentAvatarIndex === 0 ? 'girl' : 'boy';
    const baseUrls = this.avatarConfig[avatarType];

    try {
      for (const [key, value] of Object.entries(baseUrls)) {
        const textures = await this._loadTextures(value.url, value.count);
        this.animations[key] = this._createAnimatedSprite(textures, key, c_width);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }

  /**
   * Loads textures for a given animation.
   * @param {string} baseUrl - The base URL for the animation frames.
   * @param {number} count - The number of frames in the animation.
   * @returns {Promise<PIXI.Texture[]>} - A promise that resolves to an array of textures.
   */
  async _loadTextures(baseUrl, count) {
    const texturePromises = [];
    for (let i = 1; i <= count; i++) {
      texturePromises.push(PIXI.Assets.load(`${baseUrl}${i}).png`));
    }
    return await Promise.all(texturePromises);
  }

  /**
   * Creates an animated sprite from an array of textures.
   * @param {PIXI.Texture[]} textures - The textures for the animation.
   * @param {string} animationKey - The key for the animation (e.g., "idle", "walk").
   * @param {number} c_width - The width of the container to calculate the avatar size.
   * @returns {PIXI.AnimatedSprite} - The configured animated sprite.
   */
  _createAnimatedSprite(textures, animationKey, c_width) {
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
  playAnimation(animationKey) {
    if (!this.animations[animationKey]) {
      console.warn(`Animation "${animationKey}" not found.`);
      return;
    }

    if (this.activeAnimation) {
      this.activeAnimation.visible = false;
      this.activeAnimation.stop();
    }

    this.activeAnimation = this.animations[animationKey];
    this.activeAnimation.visible = true;
    this.activeAnimation.play();
  }

  playIdle() {
    this.playAnimation('idle');
  }

  playWalk() {
    this.playAnimation('walk');
  }

  playRun() {
    this.playAnimation('run');
  }

  playJump() {
    this.playAnimation('jump');
  }

  /**
   * Returns the height of the idle animation.
   * @returns {number} - The height of the idle animation.
   */
  getAvatarHeight() {
    return this.animations.idle.height;
  }
}
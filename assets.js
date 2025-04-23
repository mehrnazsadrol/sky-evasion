/**
 * Assets - Asset management class that handles:
 * - Loading and caching of all game asset textures
 * - Providing access to loaded assets
 * - Managing different character configurations
 * - Handling background and UI elements
 */
export class Assets {
  constructor() {
    this.textures = new Map();
    
    this.cityBackgroundConfig = {
      inGameBg: { count: 5, textures: [] },
      textColor: 0xFFFFFF,
    };
    
    this.avatarConfig = {
      girl: {
        assetUrl: {
          idle: { url: "res/girl-character/Idle (", count: 16, textures: [] },
          walk: { url: "res/girl-character/Walk (", count: 20, textures: [] },
          run: { url: "res/girl-character/Run (", count: 20, textures: [] },
          jump: { url: "res/girl-character/Jump (", count: 30, textures: [] },
          dead: { url: "res/girl-character/Dead (", count: 30, textures: [] },
        },
        fallThreshold: 50 / 100,
        collisionThreshold: 90 / 100,
      },
      boy: {
        assetUrl: {
          idle: { url: "res/boy-character/Idle (", count: 15, textures: [] },
          walk: { url: "res/boy-character/Walk (", count: 15, textures: [] },
          run: { url: "res/boy-character/Run (", count: 15, textures: [] },
          jump: { url: "res/boy-character/Jump (", count: 15, textures: [] },
          dead: { url: "res/boy-character/Dead (", count: 15, textures: [] },
        },
        fallThreshold: 60 / 100,
        collisionThreshold: 80 / 100,
      },
    };
    
    this.slimeConfig = {
      blue: {
        url: "res/slime-sprite/Blue_Slime/Walk(", count: 8, textures: [],
      },
      green: {
        url: "res/slime-sprite/Green_Slime/Walk(", count: 8, textures: [],
      },
      red: {
        url: "res/slime-sprite/Red_Slime/Walk(", count: 8, textures: [],
      },
    };
    
    this.avatarOptions = {
      baseUrl: "res/avatar-options/",
      textures: [],
    }
    
    this.canvas_bg_color = 0x2D336B;
  }

  /**
   * Main asset loading method - loads all game assets
   * @async
   */
  async loadAssets() {
    const assets = [
      { name: 'avatar_icon', url: 'res/icons/avatar_icon2.png' },
      { name: 'start_icon', url: 'res/icons/start_icon.png' },
      { name: 'first_page_background', url: 'res/start_page_bg.png' },
      { name: 'help_icon', url: 'res/icons/help_icon.png' },
      { name: 'close_icon', url: 'res/icons/close_icon.png' },
      { name: 'help_background', url: 'res/city-backgrounds/city-1-2.png' },
    ];

    for (const asset of assets) {
      const texture = await PIXI.Assets.load(asset.url);
      this.textures.set(asset.name, texture);
    }

    await this._loadCityBackgrounds();
    await this._loadAvatarAssets();
    await this._loadSlimeAssets();
    await this._loadAvatarOptions();
    await this._loadFonts();
  }


  /**
   * Loads avatar options for selection screen
   * @async
   */
  async _loadAvatarOptions() {
    const texturePromises = [];
    texturePromises.push(PIXI.Assets.load(`${this.avatarOptions.baseUrl}girl-avatar.png`));
    texturePromises.push(PIXI.Assets.load(`${this.avatarOptions.baseUrl}boy-avatar.png`));
    this.avatarOptions.textures = await Promise.all(texturePromises);
  }

  /**
   * Loads all slime assets
   * @async
   */
  async _loadSlimeAssets() {
    for (const [key, item] of Object.entries(this.slimeConfig)) {
      const textures = await this._loadSlimeTextures(item.url, item.count);
      this.slimeConfig[key].textures = textures;
    }
  }

  /**
   * Helper method to load slime textures
   * @private
   * @async
   */
  async _loadSlimeTextures(baseUrl, count) {
    const texturePromises = [];
    for (let i = 1; i <= count; i++) {
      const originalTexture = await PIXI.Assets.load(`${baseUrl}${i}).png`);
      const mirroredTexture = this._createMirroredTexture(originalTexture);
      texturePromises.push(mirroredTexture);
    }
    return await Promise.all(texturePromises);
  }

  /**
   * Creates horizontally mirrored version of a texture
   * @private
   */
  _createMirroredTexture(originalTexture) {
    return new PIXI.Texture(
      originalTexture.baseTexture,
      originalTexture.frame,
      originalTexture.orig,
      originalTexture.trim,
      originalTexture.rotate,
      { x: -1, y: 1 }
    );
  }

  /**
   * Loads all avatar animation assets
   * @async
   */
  async _loadAvatarAssets() {
    for (const [avatarType, animations] of Object.entries(this.avatarConfig)) {
      for (const [animationKey, { url, count }] of Object.entries(animations.assetUrl)) {
        const textures = await this._loadTextures(url, count);
        this.avatarConfig[avatarType].assetUrl[animationKey].textures = textures;
      }
    }
  }

  /**
   * Helper method to load animation textures
   * @private
   * @async
   */
  async _loadTextures(baseUrl, count) {
    const texturePromises = [];
    for (let i = 1; i <= count; i++) {
      texturePromises.push(PIXI.Assets.load(`${baseUrl}${i}).png`));
    }
    return await Promise.all(texturePromises);
  }

  /**
   * Loads parallax background layers
   * @async
   */
  async _loadCityBackgrounds() {
    const item = this.cityBackgroundConfig.inGameBg
    const baseUrl = `res/city-backgrounds/city1/`;
    for (let i = 1; i <= item.count; i++) {
      const bg = await PIXI.Assets.load(`${baseUrl}${i}.png`);
      item.textures.push(bg);
    }
  }

  /**
   * Loads fonts for the game
   * @async
   */
  async _loadFonts() {
    const fontDefinitions = [
      { file: 'ubuntu-medium.ttf', family: 'ubuntu-medium' },
    ];

    await Promise.all(fontDefinitions.map(async (font) => {
      const fontPath = `res/fonts/${font.file}`;
      const fontFace = new FontFace(font.family, `url(${fontPath})`);

      try {
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
      } catch (error) {
        console.error(`Failed to load font ${font.family}:`, error);
      }
    }));
  }

  // ========== PUBLIC METHODS ========== //

  /**
   * Gets a cached texture by name
   */
  getTexture(name) {
    return this.textures.get(name);
  }

  /**
   * Gets all city background layers
   */
  getCityBackgrounds() {
    return this.cityBackgroundConfig.inGameBg;
  }

  /**
   * Gets animation textures for an avatar type
   */
  getAvatarTextures(avatarType) {
    return this.avatarConfig[avatarType].assetUrl;
  }

  /**
   * Gets collision threshold for the current avatar
   */
  getAvatarCollisionThreshold() {
    const currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    const avatarConfig = currentAvatarIndex === 0 ? this.avatarConfig['girl'] : this.avatarConfig['boy'];
    return avatarConfig.collisionThreshold;
  }

  /**
   * Gets fall threshold for the current avatar
   */
  getAvatarFallThreshold() {
    const currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    const avatarConfig = currentAvatarIndex === 0 ? this.avatarConfig['girl'] : this.avatarConfig['boy'];
    return avatarConfig.fallThreshold;
  }

  // Slime texture getters
  getBlueSlimeTextures() { return this.slimeConfig.blue.textures; }
  getGreenSlimeTextures() { return this.slimeConfig.green.textures; }
  getRedSlimeTextures() { return this.slimeConfig.red.textures; }

  /**
   * Gets standard slime texture width
   */
  getSlimeTextureWidth() {
    return this.slimeConfig.blue.textures[0].width;
  }

  /**
   * Gets avatar option textures for selection screen
   */
  getAvatarOptionTextures() {
    return this.avatarOptions.textures;
  }

  /**
   * Gets text color for the background
   */
  getBackgroundTextColor() {
    return this.cityBackgroundConfig.textColor;
  }

  /**
   * Gets theme text color
   */
  getThemeTextColor() {
    return this.canvas_bg_color;
  }

  getDropFilterLight() {
    return new PIXI.filters.DropShadowFilter({
      distance: 8,
      blur: 4,
      alpha: 1,
      color: 0xFDF1DB,
    });
  }
  getDropFilterDark() {
    return new PIXI.filters.DropShadowFilter({
      distance: 8,
      blur: 4,
      alpha: 1,
      color: this.canvas_bg_color,
    });
  }
}
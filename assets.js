/**
 * @file Assets.js
 * @description Asset manager for loading and managing all game resources including:
 *              - Backgrounds and city themes
 *              - Character animations and avatars
 *              - Slime sprites
 *              - Gem items
 *              - UI elements and icons
 *              - Fonts and text styling
 * 
 * Called By: All game components requiring assets
 * Calls: None
 */
export class Assets {
  constructor() {
    // Main texture cache
    this.textures = new Map();

    /**
     * @property {Object} cityBackgrounds - Configuration for city background themes
     * @property {number} count - Number of background variations per city
     * @property {Array} textures - Loaded background textures
     * @property {number} gameOverText - Text color for game over screen
     * @property {number} scoreColor - Color for score display
     */
    this.cityBackgrounds = {
      1: { count: 5, textures: [], gameOverText: 0xFDF1DB, scoreColor: 0x261FB3 },
      2: { count: 6, textures: [], gameOverText: 0xFDF1DB, scoreColor: 0x31363F },
      3: { count: 5, textures: [], gameOverText: 0xFDF1DB, scoreColor: 0x474E68 },
      4: { count: 6, textures: [], gameOverText: 0xFDF1DB, scoreColor: 0x461111 },
      5: { count: 5, textures: [], gameOverText: 0xE8C999, scoreColor: 0x04009A },
      6: { count: 6, textures: [], gameOverText: 0xE8C999, scoreColor: 0x7C00FE },
      7: { count: 5, textures: [], gameOverText: 0xFDF1DB, scoreColor: 0x610C63 },
      8: { count: 5, textures: [], gameOverText: 0xFDF1DB, scoreColor: 0x481E14 }
    };

    /**
     * @property {Object} cityBackgroundOptions - Configuration for city selection screen
     */
    this.cityBackgroundOptions = {
      baseUrl: "res/city-backgrounds/city-",
      count: 8,
      textures: [],
    };

    /**
     * @property {Object} avatarConfig - Character animation configurations
     * @property {Object} assetUrl - Animation type definitions
     * @property {string} url - Base path for animation frames
     * @property {number} count - Number of frames in animation
     * @property {Array} textures - Loaded animation frames
     * @property {number} fallThreshold - Physics threshold for falling
     * @property {number} collisionThreshold - Physics threshold for collisions
     */
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

    /**
     * @property {Object} avatarOptions - Avatar selection screen assets
     */
    this.avatarOptions = {
      baseUrl: "res/avatar-options/",
      textures: [],
    };

    /**
     * @property {Object} slimeConfig - Slime configurations
     * @property {string} url - Base path for slime frames
     * @property {number} count - Number of frames in animation
     * @property {Array} textures - Loaded textures
     * @property {boolean} mirrored - Whether to mirror the sprites
     */
    this.slimeConfig = {
      blue: {
        url: "res/slime-sprite/Blue_Slime/Walk(", count: 8, textures: [], mirrored: false,
      },
      greenLeft: {
        url: "res/slime-sprite/Green_Slime/Walk(", count: 8, textures: [], mirrored: true,
      },
      greenRight: {
        url: "res/slime-sprite/Green_Slime/Walk(", count: 8, textures: [], mirrored: false,
      },
      redIdle: {
        url: "res/slime-sprite/Red_Slime/Walk(", count: 8, textures: [], mirrored: false,
      },
      redJump: {
        url: "res/slime-sprite/Red_Slime/Jump(", count: 13, textures: [], mirrored: true,
      },
    };

    /**
     * @property {Object} gems - Collectible item configurations
     * @property {string} baseUrl - Base path for gem frames
     * @property {number} count - Number of frames in animation
     * @property {Array} textures - Loaded textures
     * @property {number} scale - Render scale for gems
     * @property {number} animationSpeed - Playback speed for animations
     */
    this.gems = {
      diamond: {
        baseUrl: "res/gems/diamond/Diamond(",
        count: 48,
        textures: [],
        scale: 0.05,
        animationSpeed: 0.1,
      },
      heart: {
        baseUrl: "res/gems/heart/Heart(",
        count: 58,
        textures: [],
        scale: 0.05,
        animationSpeed: 0.3,
      }
    };
    this.musicMaxVol =  0.8;
    this.sfxMaxVol = 0.1;

    // Default canvas background color
    this.canvas_bg_color = 0x2D336B;
  }

  /**
   * @async
   * @method loadAssets
   * @description Main asset loading method - loads all game resources
   */
  async loadAssets() {
    // Static assets to load
    const assets = [
      { name: 'wallpaper_icon', url: 'res/icons/wallpaper_icon2.png' },
      { name: 'avatar_icon', url: 'res/icons/avatar_icon2.png' },
      { name: 'start_icon', url: 'res/icons/start_icon.png' },
      { name: 'first_page_background', url: 'res/start_page_bg.png' },
      { name: 'help_icon', url: 'res/icons/help_icon.png' },
      { name: 'close_icon', url: 'res/icons/close_icon.png' },
      { name: 'help_background', url: 'res/city-backgrounds/city-1-2.png' },
      { name: 'exit_icon', url: 'res/icons/exit_icon2.png' },
      { name: 'sound_settings', url: 'res/icons/sound_setting.png' },
      { name: 'silent', url: 'res/icons/silent.png' },
      { name: 'volume_up', url: 'res/icons/volume_up.png' },
      { name: 'volume_down', url: 'res/icons/volume_down.png' },
      { name: 'sound', url: 'res/icons/sound.png' },
      { name: 'save_icon', url: 'res/icons/save2.png' },
      { name: 'block', url: 'res/icons/block.png' },
    ];

    // Loads all static assets
    for (const asset of assets) {
      const texture = await PIXI.Assets.load(asset.url);
      this.textures.set(asset.name, texture);
    }
    await this.loadSounds();
    await this.loadCityBackgrounds();
    await this.loadAvatarAssets();
    await this.loadSlimeAssets();
    await this.loadCityOptions();
    await this.loadAvatarOptions();
    await this.loadFonts();
    await this.loadGems();
  }

  /**
   * @async 
   * @method loadSounds
   * @description Loads all sound effects and background music
   */
  async loadSounds() {
    const soundDefinitions = [
      { name: 'main', url: 'res/sound/mainBackground.mp3' },
      { name: 'background1', url: 'res/sound/Background1.mp3' },
      { name: 'background2', url: 'res/sound/Background2.mp3' },
      { name: 'background3', url: 'res/sound/Background3.mp3' },
      { name: 'background4', url: 'res/sound/Background4.mp3' },
      { name: 'button_click', url: 'res/sound/button.mp3' },
      { name: 'timer1', url: 'res/sound/countDown1.mp3' },
      { name: 'timer2', url: 'res/sound/countDown2.mp3' },
      { name: 'timer3', url: 'res/sound/countDown3.mp3' },
    ];

    const loadPromises = soundDefinitions.map(s => {
      return new Promise((resolve, reject) => {
        PIXI.sound.Sound.from({
          url: s.url,
          preload: true,
          loaded: (err, sound) => {
            if (err) {
              console.error(`Error loading sound ${s.name}:`, err);
              reject(err);
              return;
            }
            PIXI.sound.add(s.name, sound);
            resolve();
          }
        });
      });
    });

    try {
      await Promise.all(loadPromises);
      return true;
    } catch (error) {
      console.error('Some sounds failed to load:', error);
      return false;
    }
  }

  /**
   * @async
   * @method loadFonts
   * @description Loads all web fonts used in the game
   */
  async loadFonts() {
    const fontDefinitions = [
      { file: 'BungeeSpice-Regular.ttf', family: 'BungeeSpice' },
      { file: 'Chewy-Regular.ttf', family: 'Chewy' },
      { file: 'Monofett-Regular.ttf', family: 'Monofett' },
      { file: 'Nabla-Regular-VariableFont_EDPT.ttf', family: 'Nabla' },
      { file: 'RoadRage-Regular.ttf', family: 'RoadRage' },
      { file: 'TitanOne-Regular.ttf', family: 'TitanOne' },
      { file: 'ubuntu-medium.ttf', family: 'ubuntu-medium' },
      { file: 'Wallpoet-Regular.ttf', family: 'Wallpoet' }
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

  /**
   * @async
   * @method loadCityOptions
   * @description Loads textures for city selection screen
   */
  async loadCityOptions() {
    const texturePromises = [];
    for (let i = 1; i <= this.cityBackgroundOptions.count; i++) {
      texturePromises.push(PIXI.Assets.load(`${this.cityBackgroundOptions.baseUrl}${i}.png`));
    }
    this.cityBackgroundOptions.textures = await Promise.all(texturePromises);
  }

  /**
   * @async
   * @method loadGems
   * @description Loads all gem animations (diamonds and hearts)
   */
  async loadGems() {
    for (const [key, item] of Object.entries(this.gems)) {
      const texturePromises = [];
      for (let i = 1; i <= item.count; i++) {
        texturePromises.push(PIXI.Assets.load(`${item.baseUrl}${i}).png`));
      }
      item.textures = await Promise.all(texturePromises);
    }
  }

  /**
   * @async
   * @method loadAvatarOptions
   * @description Loads avatar selection screen assets
   */
  async loadAvatarOptions() {
    const texturePromises = [];
    texturePromises.push(PIXI.Assets.load(`${this.avatarOptions.baseUrl}girl-avatar.png`));
    texturePromises.push(PIXI.Assets.load(`${this.avatarOptions.baseUrl}boy-avatar.png`));
    this.avatarOptions.textures = await Promise.all(texturePromises);
  }

  /**
   * @async
   * @method loadSlimeAssets
   * @description Loads all slime enemy animations
   */
  async loadSlimeAssets() {
    for (const [key, item] of Object.entries(this.slimeConfig)) {
      const textures = await this._loadSlimeTextures(item.url, item.count, item.mirrored);
      this.slimeConfig[key].textures = textures;
    }
  }

  /**
   * @private
   * @async
   * @method _loadSlimeTextures
   * @description Helper method to load slime textures with optional mirroring
   * @param {string} baseUrl - Base path for textures
   * @param {number} count - Number of frames to load
   * @param {boolean} mirrored - Whether to mirror the textures
   * @returns {Promise<Array<PIXI.Texture>>} Array of loaded textures
   */
  async _loadSlimeTextures(baseUrl, count, mirrored) {
    const texturePromises = [];
    for (let i = 1; i <= count; i++) {
      const originalTexture = await PIXI.Assets.load(`${baseUrl}${i}).png`);
      if (mirrored) {
        const mirroredTexture = this._createMirroredTexture(originalTexture);
        texturePromises.push(mirroredTexture);
      } else {
        texturePromises.push(originalTexture);
      }
    }
    return await Promise.all(texturePromises);
  }

  /**
   * @private
   * @method _createMirroredTexture
   * @description Creates a horizontally mirrored version of a texture ( used for green slimes)
   * @param {PIXI.Texture} originalTexture - Texture to mirror
   * @returns {PIXI.Texture} Mirrored texture
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
   * @async
   * @method loadAvatarAssets
   * @description Loads all character animation textures
   */
  async loadAvatarAssets() {
    for (const [avatarType, animations] of Object.entries(this.avatarConfig)) {
      for (const [animationKey, { url, count }] of Object.entries(animations.assetUrl)) {
        const textures = await this._loadTextures(url, count);
        this.avatarConfig[avatarType].assetUrl[animationKey].textures = textures;
      }
    }
  }

  /**
   * @private
   * @async
   * @method _loadTextures
   * @description Generic texture loader helper
   * @param {string} baseUrl - Base path for textures
   * @param {number} count - Number of frames to load
   * @returns {Promise<Array<PIXI.Texture>>} Array of loaded textures
   */
  async _loadTextures(baseUrl, count) {
    const texturePromises = [];
    for (let i = 1; i <= count; i++) {
      texturePromises.push(PIXI.Assets.load(`${baseUrl}${i}).png`));
    }
    return await Promise.all(texturePromises);
  }

  /**
   * @async
   * @method loadCityBackgrounds
   * @description Loads all city background variations
   */
  async loadCityBackgrounds() {
    for (const [key, item] of Object.entries(this.cityBackgrounds)) {
      const baseUrl = `res/city-backgrounds/city${key}/`;
      for (let i = 1; i <= item.count; i++) {
        const bg = await PIXI.Assets.load(`${baseUrl}${i}.png`);
        item.textures.push(bg);
      }
    }
  }

  /* ================== */
  /* GETTER METHODS */
  /* ================== */

  /**
   * @method getTexture
   * @description Gets a cached texture by name
   * @param {string} name - Texture identifier
   * @returns {PIXI.Texture} Requested texture
   */
  getTexture(name) {
    return this.textures.get(name);
  }

  /**
   * @method getCityBackgrounds
   * @description Gets a dictionary of background textures and count for a specific city
   * @param {number} idx - City index
   * @returns {Object} City background configuration
   */
  getCityBackgrounds(idx) {
    return this.cityBackgrounds[idx];
  }

  /**
   * @method getAvatarTextures
   * @description Gets textures for a specific avatar type
   * @param {string} avatarType - 'girl' or 'boy'
   * @returns {Object} Avatar animation textures
   */
  getAvatarTextures(avatarType) {
    return this.avatarConfig[avatarType].assetUrl;
  }

  /**
   * @method getAvatarCollisionThreshold
   * @description Gets collision threshold for current avatar
   * @returns {number} Collision threshold (0-1)
   */
  getAvatarCollisionThreshold() {
    const currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    const avatarConfig = currentAvatarIndex === 0 ? this.avatarConfig['girl'] : this.avatarConfig['boy'];
    return avatarConfig.collisionThreshold;
  }

  /**
   * @method getAvatarFallThreshold
   * @description Gets fall threshold for current avatar
   * @returns {number} Fall threshold (0-1)
   */
  getAvatarFallThreshold() {
    const currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    const avatarConfig = currentAvatarIndex === 0 ? this.avatarConfig['girl'] : this.avatarConfig['boy'];
    return avatarConfig.fallThreshold;
  }

  // Slime texture getters
  getBlueSlimeTextures() { return this.slimeConfig.blue.textures; }
  getGreenSlimeLeftTextures() { return this.slimeConfig.greenLeft.textures; }
  getGreenSlimeRightTextures() { return this.slimeConfig.greenRight.textures; }
  getRedSlimeIdleTextures() { return this.slimeConfig.redIdle.textures; }
  getRedSlimeJumpTextures() { return this.slimeConfig.redJump.textures; }

  /**
   * @method getSlimeTextureWidth
   * @description Gets general width of slime textures
   * @returns {number} Texture width
   */
  getSlimeTextureWidth() {
    return this.slimeConfig.blue.textures[0].width;
  }

  /**
   * @method getCityOptionTextures
   * @description Gets textures for city selection screen
   * @returns {Array<PIXI.Texture>} City option textures
   */
  getCityOptionTextures() {
    return this.cityBackgroundOptions.textures;
  };

  /**
   * @method getCityOptionCount
   * @description Gets number of available city options
   * @returns {number} Count of city options
   */
  getCityOptionCount() {
    return this.cityBackgroundOptions.count;
  }

  /**
   * @method getAvatarOptionTextures
   * @description Gets textures for avatar selection screen
   * @returns {Array<PIXI.Texture>} Avatar option textures
   */
  getAvatarOptionTextures() {
    return this.avatarOptions.textures;
  }

  /**
   * @method getBackgroundTextColor
   * @description Gets in game text color for current background theme
   * @returns {number} Hex color value
   */
  getBackgroundTextColor() {
    const currentBackgroundIndex = Number(localStorage.getItem('cityIndex')) || 0;
    return this.cityBackgrounds[currentBackgroundIndex + 1].gameOverText;
  }

  /**
   * @method getScoreTextColor
   * @description Gets score text color for current background theme
   * @returns {number} Hex color value
   */
  getScoreTextColor() {
    const currentBackgroundIndex = Number(localStorage.getItem('cityIndex')) || 0;
    return this.cityBackgrounds[currentBackgroundIndex + 1].scoreColor;
  }

  /**
   * @method getThemeTextColor
   * @description Gets default theme color
   * @returns {number} Hex color value
   */
  getThemeTextColor() {
    return this.canvas_bg_color;
  }

  /**
   * @method getGemTextures
   * @description Gets textures for specific gem type
   * @param {string} type - 'diamond' or 'heart'
   * @returns {Array<PIXI.Texture>} Gem textures
   */
  getGemTextures(type) {
    return this.gems[type].textures;
  }

  /**
   * @method getGemScale
   * @description Gets render scale for specific gem type
   * @param {string} type - 'diamond' or 'heart'
   * @returns {number} Scale factor
   */
  getGemScale(type) {
    return this.gems[type].scale;
  }

  /**
   * @method getGemAnimationSpeed
   * @description Gets animation speed for specific gem type
   * @param {string} type - 'diamond' or 'heart'
   * @returns {number} Animation speed
   */
  getGemAnimationSpeed(type) {
    return this.gems[type].animationSpeed;
  }

  /**
   * @method getAdjustedGemWidth
   * @description Gets unscaled width of gem texture
   * @param {string} type - 'diamond' or 'heart'
   * @returns {number} Scaled width
   */
  getAdjustedGemWidth(type) {
    return this.gems[type].textures[0].width * this.gems[type].scale;
  }

  /**
   * @method getAdjustedGemHeight
   * @description Gets unscaled height of gem texture
   * @param {string} type - 'diamond' or 'heart'
   * @returns {number} Scaled height
   */
  getAdjustedGemHeight(type) {
    return this.gems[type].textures[0].height * this.gems[type].scale;
  }

  /**
   * @method getDropFilterLight
   * @description Creates shadow filter using current theme's light text color
   * @returns {PIXI.filters.DropShadowFilter} Configured filter
   */
  getDropFilterLight() {
    const currentBackgroundIndex = Number(localStorage.getItem('cityIndex')) || 0;
    const textColor = this.cityBackgrounds[currentBackgroundIndex + 1].gameOverText;
    return new PIXI.filters.DropShadowFilter({
      distance: 8,
      blur: 4,
      alpha: 1,
      color: textColor,
    });
  }

  /**
   * @method getDropFilterDark
   * @description Creates shadow filter using default dark theme color
   * @returns {PIXI.filters.DropShadowFilter} Configured filter
   */
  getDropFilterDark() {
    return new PIXI.filters.DropShadowFilter({
      distance: 8,
      blur: 4,
      alpha: 1,
      color: this.canvas_bg_color,
    });
  }

  /**
   * @method getGameTracks
   * @description Gets available music tracks for game background
   * @returns {Array<string>} Array of music track names for game background
   */
  getGameTracks() {
    return ['background1', 'background2', 'background3', 'background4'];
  }

  /**
   * @method getMusicMaxVol
   * @description Gets maximum volume for music
   * @returns {number} - Maximum volume for music
   */
  getMusicMaxVol() {
    return this.musicMaxVol;
  }

  /**
   * @method getSfxMaxVol
   * @description Gets maximum volume for sound effects
   * @returns {number} - Maximum volume for sound effects
   */
  getSfxMaxVol() {
    return this.sfxMaxVol;
  }

  getBlockSprite(){
    const blockTexture = this.textures.get('block');
    const blockSprite = new PIXI.Sprite(blockTexture);
    blockSprite.anchor.set(0.5,1);
    blockSprite.width = 150;
    blockSprite.height = 150;
    return blockSprite;
  }
}
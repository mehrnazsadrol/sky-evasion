
export class Assets {
  constructor() {
    this.textures = new Map();
    this.cityBackgrounds = {
      1: { count: 5, textures: [] },
      2: { count: 6, textures: [] },
      3: { count: 5, textures: [] },
      4: { count: 6, textures: [] },
      5: { count: 5, textures: [] },
      6: { count: 6, textures: [] },
      7: { count: 5, textures: [] },
      8: { count: 5, textures: [] },
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
    this.cityBackgroundOptions = {
      baseUrl: "res/city-backgrounds/city-",
      count: 8,
      textures: [],
      gameOverText: {
        0: 0xFDF1DB,
        1: 0xFDF1DB,
        2: 0xFDF1DB,
        3: 0xFDF1DB,
        4: 0xE8C999,
        5: 0xE8C999,
        6: 0xFDF1DB,
        7: 0xFDF1DB
      },
      scoreColor: {
        0: 0x261FB3,
        1: 0x31363F,
        2: 0x474E68,
        3: 0x461111,
        4: 0x04009A,
        5: 0x7C00FE,
        6: 0x610C63,
        7: 0x481E14
      }
    };
    this.avatarOptions = {
      baseUrl: "res/avatar-options/",
      textures: [],
    }
  }

  async loadAssets() {
    const assets = [
      { name: 'wallpaper_icon', url: 'res/icons/wallpaper_icon2.png' },
      { name: 'avatar_icon', url: 'res/icons/avatar_icon2.png' },
      { name: 'start_icon', url: 'res/icons/start_icon.png' },
      { name: 'first_page_background', url: 'res/start_page_bg.png' },
    ];

    for (const asset of assets) {
      const texture = await PIXI.Assets.load(asset.url);
      this.textures.set(asset.name, texture);
    }

    await this.loadCityBackgrounds();
    await this.loadAvatarAssets();
    await this.loadSlimeAssets();
    await this.loadCityOptions();
    await this.loadAvatarOptions();
    await this.loadFonts();
  }


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
        console.log(`Font loaded: ${font.family}`);
      } catch (error) {
        console.error(`Failed to load font ${font.family}:`, error);
      }
    }));
  }

  async loadCityOptions() {
    const texturePromises = [];
    for (let i = 1; i <= this.cityBackgroundOptions.count; i++) {
      texturePromises.push(PIXI.Assets.load(`${this.cityBackgroundOptions.baseUrl}${i}.png`));
    }
    this.cityBackgroundOptions.textures = await Promise.all(texturePromises);
  }

  async loadAvatarOptions() {
    const texturePromises = [];
    texturePromises.push(PIXI.Assets.load(`${this.avatarOptions.baseUrl}girl-avatar.png`));
    texturePromises.push(PIXI.Assets.load(`${this.avatarOptions.baseUrl}boy-avatar.png`));
    this.avatarOptions.textures = await Promise.all(texturePromises);
  }

  async loadSlimeAssets() {
    for (const [key, item] of Object.entries(this.slimeConfig)) {
      const textures = await this._loadSlimeTextures(item.url, item.count, item.mirrored);
      this.slimeConfig[key].textures = textures
    }
  }

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
  async loadAvatarAssets() {
    for (const [avatarType, animations] of Object.entries(this.avatarConfig)) {
      for (const [animationKey, { url, count }] of Object.entries(animations.assetUrl)) {
        const textures = await this._loadTextures(url, count);
        this.avatarConfig[avatarType].assetUrl[animationKey].textures = textures;
      }
    }
  }
  async _loadTextures(baseUrl, count, slime) {
    const texturePromises = [];
    for (let i = 1; i <= count; i++) {
      texturePromises.push(PIXI.Assets.load(`${baseUrl}${i}).png`));
    }
    return await Promise.all(texturePromises);
  }

  async loadCityBackgrounds() {
    for (const [key, item] of Object.entries(this.cityBackgrounds)) {
      const baseUrl = `res/city-backgrounds/city${key}/`;
      for (let i = 1; i <= item.count; i++) {
        const bg = await PIXI.Assets.load(`${baseUrl}${i}.png`);
        item.textures.push(bg);
      }
    }
  }

  getTexture(name) {
    return this.textures.get(name);
  }

  getCityBackgrounds(idx) {
    return this.cityBackgrounds[idx];
  }

  getAvatarTextures(avatarType) {
    return this.avatarConfig[avatarType].assetUrl;
  }

  getAvatarCollisionThreshold() {
    const currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    const avatarConfig = currentAvatarIndex === 0 ? this.avatarConfig['girl'] : this.avatarConfig['boy'];
    return avatarConfig.collisionThreshold;
  }

  getAvatarFallThreshold() {
    const currentAvatarIndex = Number(localStorage.getItem('avatarIndex')) || 0;
    const avatarConfig = currentAvatarIndex === 0 ? this.avatarConfig['girl'] : this.avatarConfig['boy'];
    return avatarConfig.fallThreshold;
  }

  getBlueSlimeTextures() {
    return this.slimeConfig.blue.textures;
  }
  getGreenSlimeLeftTextures() {
    return this.slimeConfig.greenLeft.textures;
  }
  getGreenSlimeRightTextures() {
    return this.slimeConfig.greenRight.textures;
  }
  getRedSlimeIdleTextures() {
    return this.slimeConfig.redIdle.textures;
  }
  getRedSlimeJumpTextures() {
    return this.slimeConfig.redJump.textures;
  }

  getSlimeTextureWidth() {
    return this.slimeConfig.blue.textures[0].width;
  }

  getCityOptionTextures() {
    return this.cityBackgroundOptions.textures;
  };

  getCityOptionCount() {
    return this.cityBackgroundOptions.count;
  }

  getAvatarOptionTextures() {
    return this.avatarOptions.textures;
  }

  getBackgroundTextColor() {
    const currentBackgroundIndex = Number(localStorage.getItem('cityIndex')) || 0;
    return this.cityBackgroundOptions.gameOverText[currentBackgroundIndex];
  }

  getScoreTextColor() {
    const currentBackgroundIndex = Number(localStorage.getItem('cityIndex')) || 0;
    return this.cityBackgroundOptions.scoreColor[currentBackgroundIndex];
  }
}

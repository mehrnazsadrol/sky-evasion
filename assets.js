
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
        url: "res/slime-sprite/Blue_Slime/Walk(", count: 8, textures: [],
      },
      green: {
        url: "res/slime-sprite/Green_Slime/Walk(", count: 8, textures: [],
      },
      red: {
        url: "res/slime-sprite/Red_Slime/Walk(", count: 8, textures: [],
      },
    };
    this.cityBackgroundOptions = {
      baseUrl: "res/city-backgrounds/city-",
      count: 8,
      textures: [],
      textColors: {
        0: 0xFFFFFF,
        1: 0xfff4f3,
        2: 0x8e4862,
        3: 0x000000,
        4: 0xA5158C,
        5: 0x211C84,
        6: 0x261FB3,
        7: 0xFFFFFF
      },
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
      const textures = await this._loadSlimeTextures(item.url, item.count);
      this.slimeConfig[key].textures = textures
    }
  }

  async _loadSlimeTextures(baseUrl, count) {
    const texturePromises = [];
    for (let i = 1; i <= count; i++) {
      const originalTexture = await PIXI.Assets.load(`${baseUrl}${i}).png`);
      const mirroredTexture = this._createMirroredTexture(originalTexture);
      texturePromises.push(mirroredTexture);
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
  getGreenSlimeTextures() {
    return this.slimeConfig.green.textures;
  }
  getRedSlimeTextures() {
    return this.slimeConfig.red.textures;
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
    return this.cityBackgroundOptions.textColors[currentBackgroundIndex];
  }
}

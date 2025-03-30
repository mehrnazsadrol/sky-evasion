export class SettingButtonManager {
  constructor(
    c_width,
    c_height,
    canvas_bg_color,
    loadBackgroundOptionsScreen,
    loadAvatarOptionsScreen,
    assets) {

    this.c_width = c_width;
    this.c_height = c_height;
    this.canvas_bg_color = canvas_bg_color;
    this.loadBackgroundOptionsScreen = loadBackgroundOptionsScreen;
    this.loadAvatarOptionsScreen = loadAvatarOptionsScreen;
    this.assets = assets;

    this.OptionsContainer = null;
    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfffade,
    });
  }

  async createWallpaperButton() {
    const iconW = 50;
    const iconH = 50;

    const button = new PIXI.Graphics();
    button.beginFill(0xfffade, 0);
    button.drawRect(0, 0, iconW, iconH);
    button.endFill();

    button.interactive = true;
    button.buttonMode = true;

    const wallpaperIconTexture = this.assets.getTexture('wallpaper_icon');
    const wallpaperIcon = new PIXI.Sprite(wallpaperIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    button.addChild(wallpaperIcon);

    button.x = 40;
    button.y = 40;

    button.on("pointerover", () => {
      button.filters = [this.dropShadowFilter];
    });

    button.on("pointerout", () => {
      button.filters = [];
    });

    button.on("click", async () => {
      await this.loadBackgroundOptionsScreen();
    });

    return button;
  }

  async createCharacterChangeButton() {
    const iconW = 80;
    const iconH = 80;

    const button = new PIXI.Graphics();
    button.beginFill(0xfffade, 0);
    button.drawRect(0, 0, iconW, iconH);
    button.endFill();

    button.interactive = true;
    button.buttonMode = true;

    const avatarIconTexture = this.assets.getTexture('avatar_icon');
    const wallpaperIcon = new PIXI.Sprite(avatarIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    button.addChild(wallpaperIcon);

    button.x = 110;
    button.y = 25;

    button.on("pointerover", () => {
      button.filters = [this.dropShadowFilter];
    });

    button.on("pointerout", () => {
      button.filters = [];
    });

    button.on("click", async () => {
      this.loadAvatarOptionsScreen();
    });

    return button;
  }

}
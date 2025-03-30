export class SettingButtonManager {
  constructor(
    c_width,
    c_height,
    loadAvatarOptionsScreen,
    assets) {

    this.c_width = c_width;
    this.c_height = c_height;
    this.assets = assets;
    this.canvas_bg_color = this.assets.getCanvasBackgroundColor();
    this.loadAvatarOptionsScreen = loadAvatarOptionsScreen;

    this.OptionsContainer = null;
    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfffade,
    });
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

    button.x = 60;
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
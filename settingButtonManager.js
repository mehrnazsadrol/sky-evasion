/**
 * SettingButtonManager - Handles creation and management of setting buttons.
 */
export class SettingButtonManager {
  constructor(
    c_width,
    c_height,
    loadAvatarOptionsScreen,
    loadHelpScreen,
    assets
  ) {
    this.c_width = c_width;
    this.c_height = c_height;
    this.assets = assets;
    this.loadAvatarOptionsScreen = loadAvatarOptionsScreen;
    this.loadHelpScreen = loadHelpScreen;
    this.OptionsContainer = null;
    this.dropShadowFilter = this.assets.getDropFilterDark();
  }

  /**
   * Creates and configures the character change button
   * @async
   * @returns {PIXI.Graphics} Interactive button
   */
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

  /**
   * Creates and configures the help page button
   * @async
   * @returns {PIXI.Graphics} Interactive button
   */
  async createHelpButton() {
    const iconW = 80;
    const iconH = 80;

    const button = new PIXI.Graphics();
    button.beginFill(0xfffade, 0);
    button.drawRect(0, 0, iconW, iconH);
    button.endFill();

    button.interactive = true;
    button.buttonMode = true;

    const avatarIconTexture = this.assets.getTexture('help_icon');
    const wallpaperIcon = new PIXI.Sprite(avatarIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;
    button.addChild(wallpaperIcon);

    button.x = this.c_width - 60 - iconW;
    button.y = 25;

    button.on("pointerover", () => {
      button.filters = [this.dropShadowFilter];
    });

    button.on("pointerout", () => {
      button.filters = [];
    });

    button.on("click", async () => {
      this.loadHelpScreen();
    });

    return button;
  }
}
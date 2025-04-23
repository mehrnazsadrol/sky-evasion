/**
 * @file SettingButtonManager.js
 * @description Manages the creation and behavior of setting buttons in the game UI.
 * 
 * 
 * Called By: Main game startPage function
 * Calls: None
 */
export class SettingButtonManager {
  /**
   * @constructor
   * @description Configures the SettingButtonManager
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height 
   * @param {function} loadBackgroundOptionsScreen - Callback for background options
   * @param {function} loadAvatarOptionsScreen - Callback for avatar options
   * @param {function} loadHelpScreen - Callback for help screen
   * @param {Object} assets - Game assets manager
   */
  constructor(
    c_width,
    c_height,
    loadBackgroundOptionsScreen,
    loadAvatarOptionsScreen,
    loadHelpScreen,
    assets
  ) {
    this.c_width = c_width;
    this.c_height = c_height;
    this.loadBackgroundOptionsScreen = loadBackgroundOptionsScreen;
    this.loadAvatarOptionsScreen = loadAvatarOptionsScreen;
    this.loadHelpScreen = loadHelpScreen;
    this.assets = assets;
    this.OptionsContainer = null;

    this.dropShadowFilter = this.assets.getDropFilterDark();
  }

  /**
   * @async
   * @method createWallpaperButton
   * @description Creates the wallpaper selection button
   * @returns {Promise<PIXI.Graphics>} Interactive button with wallpaper icon
   */
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
      button.filters = [this.dropShadowFilter]; // Add shadow on hover
    });

    button.on("pointerout", () => {
      button.filters = []; // Remove shadow when not hovering
    });

    // Click handler - loads background options screen
    button.on("click", async () => {
      await this.loadBackgroundOptionsScreen();
    });

    return button;
  }

  /**
   * @async
   * @method createCharacterChangeButton
   * @description Creates the avatar selection button
   * @returns {Promise<PIXI.Graphics>} Interactive button with avatar icon
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
    const avatarIcon = new PIXI.Sprite(avatarIconTexture);
    avatarIcon.width = iconW;
    avatarIcon.height = iconH;
    button.addChild(avatarIcon);

    button.x = 110;
    button.y = 25;

    button.on("pointerover", () => {
      button.filters = [this.dropShadowFilter]; // Add shadow on hover
    });

    button.on("pointerout", () => {
      button.filters = []; // Remove shadow when not hovering
    });

    // Click handler - loads avatar options screen
    button.on("click", async () => {
      this.loadAvatarOptionsScreen();
    });

    return button;
  }

  /**
   * @async
   * @method createHelpButton
   * @description Creates and configures the help button
   * @returns {Promise<PIXI.Graphics>} Interactive button with help icon
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

    const helpIconTexture = this.assets.getTexture('help_icon');
    const helpIcon = new PIXI.Sprite(helpIconTexture);
    helpIcon.width = iconW;
    helpIcon.height = iconH;
    button.addChild(helpIcon);

    button.x = this.c_width - 60 - iconW;
    button.y = 25;

    button.on("pointerover", () => {
      button.filters = [this.dropShadowFilter]; // Add shadow on hover
    });

    button.on("pointerout", () => {
      button.filters = []; // Remove shadow when not hovering
    });

    // Click handler - loads help screen
    button.on("click", async () => {
      this.loadHelpScreen();
    });

    return button;
  }
}
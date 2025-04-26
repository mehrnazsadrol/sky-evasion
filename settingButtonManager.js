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
   * @param {function} loadSoundSettingScreen - Callback for sound settings
   * @param {Object} assets - Game assets manager
   */
  constructor(
    c_width,
    c_height,
    loadBackgroundOptionsScreen,
    loadAvatarOptionsScreen,
    loadHelpScreen,
    loadSoundSettingScreen,
    assets
  ) {
    this.c_width = c_width;
    this.c_height = c_height;
    this.loadBackgroundOptionsScreen = loadBackgroundOptionsScreen;
    this.loadAvatarOptionsScreen = loadAvatarOptionsScreen;
    this.loadHelpScreen = loadHelpScreen;
    this.loadSoundSettingScreen = loadSoundSettingScreen;
    this.assets = assets;
    this.OptionsContainer = null;
    this.iconSize = this.c_width / 20;
    this.xPadding = this.iconSize * 0.5;
    this.yPadding = this.iconSize;
    this.currentX = this.xPadding * 2;


    this.dropShadowFilter = this.assets.getDropFilterDark();
  }

  /**
   * @async
   * @method createWallpaperButton
   * @description Creates the wallpaper selection button
   * @returns {Promise<PIXI.Graphics>} Interactive button with wallpaper icon
   */
  async createWallpaperButton() {
    const button = new PIXI.Graphics()
      .rect(0, 0, this.iconSize, this.iconSize)
      .fill({ color: 0xfffade, alpha: 0 });

    button.interactive = true;
    button.buttonMode = true;

    const wallpaperIconTexture = this.assets.getTexture('wallpaper_icon');
    const wallpaperIcon = new PIXI.Sprite(wallpaperIconTexture);
    wallpaperIcon.width = this.iconSize;
    wallpaperIcon.height = this.iconSize;
    button.addChild(wallpaperIcon);

    button.x = this.currentX;
    button.y = this.yPadding;
    this.currentX += this.iconSize + this.xPadding;

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
    const button = new PIXI.Graphics()
      .rect(0, 0, this.iconSize * 1.5, this.iconSize * 1.5)
      .fill({ color: 0xfffade, alpha: 0 });

    button.interactive = true;
    button.buttonMode = true;

    const avatarIconTexture = this.assets.getTexture('avatar_icon');
    const avatarIcon = new PIXI.Sprite(avatarIconTexture);
    avatarIcon.width = this.iconSize * 1.5;
    avatarIcon.height = this.iconSize * 1.5;
    button.addChild(avatarIcon);

    button.x = this.currentX;
    button.y = this.yPadding * 0.75;
    this.currentX += this.iconSize * 1.5 + this.xPadding;

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
 * @method createSoundSettingButton
 * @description Creates and configures the sound setting button
 * @returns {Promise<PIXI.Graphics>} Interactive button with config icon
 */
  async createSoundSettingButton() {
    const button = new PIXI.Graphics()
      .rect(0, 0, this.iconSize, this.iconSize)
      .fill({ color: 0xfffade, alpha: 0 });


    button.interactive = true;
    button.buttonMode = true;

    const iconTexture = this.assets.getTexture('sound_settings');
    const soundIcon = new PIXI.Sprite(iconTexture);
    soundIcon.width = this.iconSize;
    soundIcon.height = this.iconSize;
    button.addChild(soundIcon);

    button.x = this.currentX;
    button.y = this.yPadding;

    button.on("pointerover", () => {
      button.filters = [this.dropShadowFilter]; // Add shadow on hover
    });

    button.on("pointerout", () => {
      button.filters = []; // Remove shadow when not hovering
    });

    // Click handler - loads sound setting screen
    button.on("click", async () => {
      this.loadSoundSettingScreen();
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
    const button = new PIXI.Graphics()
      .rect(0, 0, this.iconSize * 1.5, this.iconSize * 1.5)
      .fill({ color: 0xfffade, alpha: 0 });

    button.interactive = true;
    button.buttonMode = true;

    const helpIconTexture = this.assets.getTexture('help_icon');
    const helpIcon = new PIXI.Sprite(helpIconTexture);
    helpIcon.width = this.iconSize * 1.5;
    helpIcon.height = this.iconSize * 1.5;
    button.addChild(helpIcon);

    button.x = this.c_width - this.iconSize * 1.5 - this.xPadding;
    button.y = this.yPadding;

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

  /**
   * @method resetButtonPosition
   * @description Resets the button position to the initial state
   */
  resetButtonPosition() {
    this.currentX = this.xPadding * 2;
  }
}
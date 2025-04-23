/**
 * @file ButtonManager.js
 * @description Manages the creation of all UI buttons in the game's start page.
 * 
 * Called By: Main
 * Calls: 
 * - SettingButtonManager for shared button creation
 * - Assets manager for textures and styles
 */
export class ButtonManager {
  /**
   * @constructor
   * @description Initializes the ButtonManager
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height
   * @param {PIXI.Container} firstPageContainer - Container for UI elements
   * @param {SettingButtonManager} settingButtonManager - Shared button manager
   * @param {Assets} assets - Game assets manager
   * @param {function} startGame - Callback for start game action
   */
  constructor(c_width, c_height, firstPageContainer, settingButtonManager, assets, startGame) {
    this.firstPageContainer = firstPageContainer;
    this.startGame = startGame;
    this.assets = assets;
    this.settingButtonManager = settingButtonManager;
    this.c_width = c_width;
    this.c_height = c_height;
    this.startButton = null;
    
    this.textColor = this.assets.getThemeTextColor();
    this.dropShadowFilter = this.assets.getDropFilterLight();
  }

  /**
   * @async
   * @method loadPage
   * @description Main initialization method - creates all UI elements
   */
  async loadPage() {
    this._createText();
    await this._createWallpaperButton();
    await this._createStartButton();
    await this._createCharacterChangeButton();
    await this._createHelpButton();
  }

  /**
   * @private
   * @method _createText
   * @description Creates and positions the game title text
   */
  _createText() {
    const style = new PIXI.TextStyle({
      fontFamily: 'ubuntu-medium',
      fontSize: 55,
      fontWeight: 'bold',
      fill: this.textColor,
    });
    
    const message = new PIXI.Text('SKY EVASION', style);
    message.anchor.set(0.5);
    message.x = this.c_width / 2;
    message.y = this.c_height / 5;
    this.firstPageContainer.addChild(message);
  }

  /**
   * @private
   * @async
   * @method _createWallpaperButton
   * @description Creates background selection button using SettingButtonManager
   */
  async _createWallpaperButton() {
    const button = await this.settingButtonManager.createWallpaperButton();
    this.firstPageContainer.addChild(button);
  }

  /**
   * @private
   * @async
   * @method _createCharacterChangeButton
   * @description Creates character selection button using SettingButtonManager
   */
  async _createCharacterChangeButton() {
    const button = await this.settingButtonManager.createCharacterChangeButton();
    this.firstPageContainer.addChild(button);
  }

  /**
   * @private
   * @async
   * @method _createHelpButton
   * @description Creates help button using SettingButtonManager
   */
  async _createHelpButton() {
    const button = await this.settingButtonManager.createHelpButton();
    this.firstPageContainer.addChild(button);
  }

  /**
   * @private
   * @async
   * @method _createStartButton
   * @description Creates the start game button with hover effects
   */
  async _createStartButton() {
    const iconW = 200;
    const iconH = 200;

    const rect = new PIXI.Graphics();
    rect.beginFill(0xfffade, 0);
    rect.drawRect(0, 0, iconW, iconH);
    rect.endFill();

    rect.interactive = true;
    rect.buttonMode = true;

    const startIconTexture = this.assets.getTexture('start_icon');
    const startIcon = new PIXI.Sprite(startIconTexture);
    startIcon.width = iconW;
    startIcon.height = iconH;
    rect.addChild(startIcon);

    const text = new PIXI.Text("Start", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0x2D336B,
      align: "center",
    });
    text.x = (iconW - text.width) / 2;
    text.y = (iconH - text.height)/2;
    rect.addChild(text);

    rect.x = (this.c_width - iconW)/2;
    rect.y = (this.c_height - iconH)/2;

    rect.on("pointerover", () => {
      rect.filters = [this.dropShadowFilter];
    });

    rect.on("pointerout", () => {
      rect.filters = [];
    });

    // Click handler - starts the game
    rect.on("click", async () => {
      this.startGame();
    });

    this.startButton = rect;
    this.firstPageContainer.addChild(rect);
  }

  /**
   * @method disableStartButton
   * @description Disables the start button (e.g., when help page is open)
   */
  disableStartButton() {
    if (this.startButton) {
      this.startButton.interactive = false;
      this.startButton.buttonMode = false;
      this.startButton.alpha = 0.5;
      this.startButton.filters = [];
    }
  }

  /**
   * @method enableStartButton
   * @description Re-enables the start button
   */
  enableStartButton() {
    if (this.startButton) {
      this.startButton.interactive = true;
      this.startButton.buttonMode = true;
      this.startButton.alpha = 1;
    }
  }
}
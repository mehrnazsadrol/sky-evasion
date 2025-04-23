/**
 * ButtonManager - A class that Handles creation and interaction of buttons on the first page (main menu).
 * 
 * Inputs:
 * @param {number} c_width - Canvas width for positioning elements
 * @param {number} c_height - Canvas height for positioning elements
 * @param {PIXI.Container} firstPageContainer - Container to add buttons to
 * @param {SettingButtonManager} settingButtonManager - Manager for character change button
 * @param {Assets} assets - Asset manager for textures and colors
 * @param {function} startGame - Callback function to start the game
 */
export class ButtonManager {
  constructor(c_width, c_height,
    firstPageContainer,
    settingButtonManager,
    assets,
    startGame) {

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
   * Loads the main page by creating the UI elements (title, start button, character change button)
   */
  async loadPage() {
    this._createText();
    await this._createStartButton();
    await this._createCharacterChangeButton();
    await this._createHelpButton();
  }

  /**
   * Creates and positions the game title text
   * @private
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
   * Creates the character change button using SettingButtonManager
   * @private
   * @async
   */
  async _createCharacterChangeButton() {
    const button = await this.settingButtonManager.createCharacterChangeButton();
    this.firstPageContainer.addChild(button);
  }

  async _createHelpButton() {
    const button = await this.settingButtonManager.createHelpButton();
    this.firstPageContainer.addChild(button);
  }

  /**
   * Creates the interactive start game button
   * @private
   * @async
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
    const wallpaperIcon = new PIXI.Sprite(startIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    rect.addChild(wallpaperIcon);

    const text = new PIXI.Text("Start", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0x2D336B,
      align: "center",
    });
    text.x = (iconW - text.width) / 2;
    text.y = (iconH - text.height) / 2;
    rect.addChild(text);

    rect.x = (this.c_width - iconW) / 2;
    rect.y = (this.c_height - iconH) * 2 / 3;

    rect.on("pointerover", () => {
      rect.filters = [this.dropShadowFilter];
    });

    rect.on("pointerout", () => {
      rect.filters = [];
    });

    rect.on("click", async () => {
      this.startGame();
    });

    this.startButton = rect;
    this.firstPageContainer.addChild(rect);
  }
  /**
   * Disables the start button
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
   * Enables the start button
   */
  enableStartButton() {
    if (this.startButton) {
      this.startButton.interactive = true;
      this.startButton.buttonMode = true;
      this.startButton.alpha = 1;
    }
  }

}
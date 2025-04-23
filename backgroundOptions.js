/**
 * @file BackgroundOptions.js
 * @description Manages the background selection screen UI
 * 
 * Called By: Main
 * Calls: Assets manager for city textures and styles
 */
export class BackgroundOptions {
  /**
   * @constructor
   * @description Initializes the background selection screen
   * @param {PIXI.Container} container - Parent container for UI elements
   * @param {Assets} assets - Game assets manager
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height
   * @param {string} canvas_bg_color - Canvas background color
   * @param {function} onCitySelected - Callback when city is selected
   */
  constructor(container, assets, c_width, c_height, canvas_bg_color, onCitySelected) {
    this.c_width = c_width;
    this.c_height = c_height;
    this.canvas_bg_color = canvas_bg_color;
    this.container = container;
    this.assets = assets;
    this.citySprites = [];
    this.cityRects = [];
    this.onCitySelected = onCitySelected;
  }

  /**
   * @async
   * @method init
   * @description Initializes and builds the background selection screen
   */
  async init() {
    this._setupBackground();
    this._setupText();
    await this._setupCityOptions();
  }

  /**
   * @private
   * @method _setupBackground
   * @description Creates a solid color background for the selection screen
   */
  _setupBackground() {
    const bgRect = new PIXI.Graphics();
    bgRect.beginFill(parseInt(this.canvas_bg_color));
    bgRect.drawRect(0, 0, this.c_width, this.c_height);
    bgRect.endFill();
    this.container.addChild(bgRect);
  }

  /**
   * @private
   * @method _setupText
   * @description Creates and positions the title text for the selection screen
   */
  _setupText() {
    const textStyle = new PIXI.TextStyle({
      fontFamily: "ubuntu-medium",
      fontSize: 40,
      fill: 0xffffff,
      align: "center",
    });
    const text = new PIXI.Text("CHOOSE YOUR BACKGROUND", textStyle);
    text.x = (this.c_width - text.width) / 2;
    text.y = 20;
    this.container.addChild(text);
    this.startY = text.height + 10;
  }

  /**
   * @private
   * @async
   * @method _setupCityOptions
   * @description Creates and positions the interactive city background options in a grid layout
   */
  async _setupCityOptions() {
    const dropShadowFilter = this.assets.getDropFilterLight();

    const city_sprite_w = (this.c_width * 2) / 12; // 1/6 of canvas width
    const city_sprite_h = (this.c_height - this.startY) / 3; // 1/3 of remaining height
    const offset_x = this.c_width / 21; // Horizontal spacing
    const offset_y = (this.c_height - this.startY) / 15; // Vertical spacing

    const num_cities = this.assets.getCityOptionCount();
    const cityTextures = this.assets.getCityOptionTextures();
    const num_rows = 2; //2 rows

    // Creates a grid of the options
    for (let i = 0; i < num_rows; i++) {
      for (let j = 0; j < num_cities / num_rows; j++) {
        const c = j + i * (num_cities / num_rows);
        const texture = cityTextures[c];

        const rect = new PIXI.Graphics();
        rect.beginFill(0x000000, 0);
        rect.drawRect(0, 0, city_sprite_w, city_sprite_h);
        rect.endFill();

        const citySprite = new PIXI.Sprite(texture);
        citySprite.width = city_sprite_w;
        citySprite.height = city_sprite_h;
        rect.addChild(citySprite);

        rect.x = j * city_sprite_w + (j + 2) * offset_x;
        rect.y = this.startY + i * city_sprite_h + (i + 2) * offset_y;

        rect.interactive = true;
        rect.buttonMode = true;

        rect.on("pointerover", () => {
          rect.filters = [dropShadowFilter];
        });

        rect.on("pointerout", () => {
          rect.filters = [];
        });

        rect.on("click", () => {
          this._onCitySelected(c);
        });

        this.container.addChild(rect);
        this.citySprites.push(citySprite);
        this.cityRects.push(rect);
      }
    }
  }
  /**
   * @private
   * @method _onCitySelected
   * @description Handles city selection and invokes callback
   * @param {number} cityIndex - Index of selected city
   */
  _onCitySelected(cityIndex) {
    if (this.onCitySelected) {
      this.onCitySelected(cityIndex);
    }
  }
}
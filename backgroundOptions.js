export class BackgroundOptions {
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

  async init() {
    this._setupBackground();
    this._setupText();
    await this._setupCityOptions();
  }

  _setupBackground() {
    const bgRect = new PIXI.Graphics();
    bgRect.beginFill(parseInt(this.canvas_bg_color));
    bgRect.drawRect(0, 0, this.c_width, this.c_height);
    bgRect.endFill();
    this.container.addChild(bgRect);
  }

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

  async _setupCityOptions() {
    const dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfff2db,
    });

    const city_sprite_w = (this.c_width * 2) / 12;
    const city_sprite_h = (this.c_height - this.startY) / 3;
    const offset_x = this.c_width / 21;
    const offset_y = (this.c_height - this.startY) / 15;

    const num_cities = this.assets.getCityOptionCount();
    const cityTextures = this.assets.getCityOptionTextures();
    const num_rows = 2;

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

  _onCitySelected(cityIndex) {
    if (this.onCitySelected) {
      this.onCitySelected(cityIndex);
    }
  }

  getContainer() {
    return this.container;
  }
}
export class ButtonManager {
  constructor( c_width, c_height,
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

    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfffade,
    });
  }

  async loadPage() {
    await this._createStartButton();
    await this._createCharacterChangeButton();
  }

  async _createCharacterChangeButton() {
    const button = await this.settingButtonManager.createCharacterChangeButton();
    this.firstPageContainer.addChild(button);
  }

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

    rect.on("click", async () => {
      this.startGame();
    });

    this.firstPageContainer.addChild(rect);
  }
}
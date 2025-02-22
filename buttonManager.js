import { BackgroundOptions } from './backgroundOptions.js';

export class ButtonManager {
  constructor(app, c_width, c_height, canvas_bg_color, canvas_container, changeCanvasBackground, startGame) {
    this.app = app;
    this.c_width = c_width;
    this.c_height = c_height;
    this.canvas_bg_color = canvas_bg_color;
    this.canvas_container = canvas_container;
    this.changeCanvasBackground = changeCanvasBackground;
    this.backgroundOptionsContainer = null;
    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfffade,
    });
    this.startGame = startGame;
  }

  async createWallpaperButton() {


    const iconW = 50;
    const iconH = 50;

    
    const rect = new PIXI.Graphics();
    rect.beginFill(0xfffade, 0);
    rect.drawRect(0, 0, iconW, iconH);
    rect.endFill();

    rect.interactive = true;
    rect.buttonMode = true;

    const wallpaperIconTexture = await PIXI.Assets.load('res/icons/wallpaper_icon2.png');
    const wallpaperIcon = new PIXI.Sprite(wallpaperIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    rect.addChild(wallpaperIcon);

    rect.x = iconW;
    rect.y = iconH;

    rect.on("pointerover", () => {
      rect.filters = [this.dropShadowFilter];
    });

    rect.on("pointerout", () => {
      rect.filters = [];
    });

    rect.on("click", async () => {
      this.canvas_container.style.display = "none";
      const backgroundOptions = new BackgroundOptions(
        this.c_width,
        this.c_height,
        this.canvas_bg_color,
        this.changeCanvasBackground
      );
      await backgroundOptions.init();
      this.backgroundOptionsContainer = backgroundOptions.getContainer();
      this.app.stage.addChild(this.backgroundOptionsContainer);
    });

    this.app.stage.addChild(rect);
  }

  async createStartButton() {
    const iconW = 200;
    const iconH = 200;

    
    const rect = new PIXI.Graphics();
    rect.beginFill(0xfffade, 0);
    rect.drawRect(0, 0, iconW, iconH);
    rect.endFill();

    rect.interactive = true;
    rect.buttonMode = true;

    const wallpaperIconTexture = await PIXI.Assets.load('res/icons/start_icon.png');
    const wallpaperIcon = new PIXI.Sprite(wallpaperIconTexture);
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

    this.app.stage.addChild(rect);
  }
}
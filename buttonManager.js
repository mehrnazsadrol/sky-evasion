import { AvatarOptions } from './avatarOptions.js';
import { BackgroundOptions } from './backgroundOptions.js';
export class ButtonManager {
  constructor(app,
    firstPageContainer,
    c_width,
    c_height,
    canvas_bg_color,
    changeCanvasBackground,
    changeAvatar,
    startGame,
    assets) {

    this.app = app;
    this.firstPageContainer = firstPageContainer;
    this.c_width = c_width;
    this.c_height = c_height;
    this.canvas_bg_color = canvas_bg_color;
    this.changeCanvasBackground = changeCanvasBackground;
    this.changeAvatar = changeAvatar;
    this.OptionsContainer = null;
    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfffade,
    });
    this.startGame = startGame;
    this.assets = assets;
  }

  async loadPage() {
    await this.createWallpaperButton();
    await this.createStartButton();
    await this.createCharacterChangeButton();
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

    const wallpaperIconTexture = this.assets.getTexture('wallpaper_icon');
    const wallpaperIcon = new PIXI.Sprite(wallpaperIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    rect.addChild(wallpaperIcon);

    rect.x = iconW + 10;
    rect.y = iconH;

    rect.on("pointerover", () => {
      rect.filters = [this.dropShadowFilter];
    });

    rect.on("pointerout", () => {
      rect.filters = [];
    });

    rect.on("click", async () => {
      const backgroundOptions = new BackgroundOptions(
        this.c_width,
        this.c_height,
        this.canvas_bg_color,
        this.changeCanvasBackground
      );
      await backgroundOptions.init();
      this.OptionsContainer = backgroundOptions.getContainer();
      this.app.stage.addChild(this.OptionsContainer);
    });

    this.firstPageContainer.addChild(rect);
  }

  async createCharacterChangeButton() {
    const iconW = 80;
    const iconH = 80;

    const rect = new PIXI.Graphics();
    rect.beginFill(0xfffade, 0);
    rect.drawRect(0, 0, iconW, iconH);
    rect.endFill();

    rect.interactive = true;
    rect.buttonMode = true;

    const avatarIconTexture = this.assets.getTexture('avatar_icon');
    const wallpaperIcon = new PIXI.Sprite(avatarIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    rect.addChild(wallpaperIcon);

    rect.x = 50;
    rect.y = iconH * 1.5;

    rect.on("pointerover", () => {
      rect.filters = [this.dropShadowFilter];
    });

    rect.on("pointerout", () => {
      rect.filters = [];
    });

    rect.on("click", async () => {
      const avatarOptions = new AvatarOptions(
        this.c_width,
        this.c_height,
        this.canvas_bg_color,
        this.changeAvatar
      );
      await avatarOptions.init();
      this.OptionsContainer = avatarOptions.getContainer();
      this.app.stage.addChild(this.OptionsContainer);
    });

    this.firstPageContainer.addChild(rect);
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
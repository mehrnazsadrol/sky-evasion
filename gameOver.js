import { Hud } from "./hud.js";

export class GameOver {
  constructor(gameOverContainer, c_width, c_height, restartGame, hud, assets) {
    this.container = gameOverContainer;
    this.c_width = c_width;
    this.c_height = c_height;
    this.restartGame = restartGame;
    this.hud = hud;
    this.assets = assets;
    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfffade,
    });

  }

  init() {
    this._loadText();
    this._loadScore();
    this._loadButtons();
  }

  _loadText() {
    const style = new PIXI.TextStyle({
      fontFamily: 'ubuntu-medium',
      fontSize: 50,
      fontWeight: 'bold',
      fill: '#ffffff',
    });
    const message = new PIXI.Text('Game Over!', style);
    message.anchor.set(0.5);
    message.x = this.c_width / 2;
    message.y = this.c_height / 5;
    this.container.addChild(message);
  }

  _loadButtons() {
    const iconW = 200;
    const iconH = 200;

    const rect = new PIXI.Graphics();
    rect.beginFill(0xffffff, 0);
    rect.drawRect(0, 0, iconW, iconH);
    rect.endFill();

    rect.interactive = true;
    rect.buttonMode = true;

    const wallpaperIconTexture = this.assets.getTexture('start_icon');
    const wallpaperIcon = new PIXI.Sprite(wallpaperIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    rect.addChild(wallpaperIcon);

    const text = new PIXI.Text("Restart", {
      fontFamily: "ubuntu-medium",
      fontSize: 24,
      fill: 0x2D336B,
      align: "center",
    });
    text.anchor.set(0.5);
    text.x = iconW / 2;
    text.y = iconH / 2;
    rect.addChild(text);

    rect.x = (this.c_width - iconW) / 2;
    rect.y = (this.c_height - iconH) * 4 / 5;

    rect.on("pointerover", () => {
      rect.filters = [this.dropShadowFilter];
    });

    rect.on("pointerout", () => {
      rect.filters = [];
    });

    rect.on("click", async () => {
      this.restartGame();
    });

    this.container.addChild(rect);
  };

  _loadScore() {
    const scoreStyle = new PIXI.TextStyle({
      fontFamily: 'ubuntu-medium',
      fill: '#ffffff',
    });

    const currentScore = this.hud.getScore();
    const highestScore = this.hud.getHighestScore();

    const highestScoreText = new PIXI.Text(`Your Highest Score: ${highestScore}`, {
      ...scoreStyle,
      fontSize: 10,
    });
    highestScoreText.anchor.set(0.5);
    highestScoreText.x = this.c_width / 2;
    highestScoreText.y = this.c_height / 3;
    this.container.addChild(highestScoreText);

    const currentScoreText = new PIXI.Text(`Your Score: ${currentScore}`, {
      ...scoreStyle,
      fontSize: 30,
    });
    currentScoreText.anchor.set(0.5);
    currentScoreText.x = this.c_width / 2;
    currentScoreText.y = this.c_height / 3 + 50;
    this.container.addChild(currentScoreText);
    console.log('added score');
  }
}
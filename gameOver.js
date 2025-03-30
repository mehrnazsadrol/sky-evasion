export class GameOver {
  constructor(
    gameOverContainer,
    settingButtonManager,
    c_width,
    c_height,
    restartGame,
    hud,
    assets) {

    this.container = gameOverContainer;
    this.settingButtonManager = settingButtonManager;
    this.c_width = c_width;
    this.c_height = c_height;
    this.restartGame = restartGame;
    this.hud = hud;
    this.assets = assets;
    const textColor = this.assets.getBackgroundTextColor();

    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: textColor,
    });

  }

  async init() {
    this._loadText();
    this._loadScore();
    this._loadButtons();
    await this._loadSettingButtons();
  }

  async _loadSettingButtons() {
    const wallpaperButton = await this.settingButtonManager.createWallpaperButton();
    this.container.addChild(wallpaperButton);

    const characterButton = await this.settingButtonManager.createCharacterChangeButton();
    this.container.addChild(characterButton);
  }

  _loadText() {
    const textColor = this.assets.getBackgroundTextColor();
    const style = new PIXI.TextStyle({
      fontFamily: 'ubuntu-medium',
      fontSize: 55,
      fontWeight: 'bold',
      fill: textColor,
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
      await this.restartGame();
    });

    this.container.addChild(rect);
  };

  _loadScore() {
    const textColor = this.assets.getBackgroundTextColor();
    const scoreStyle = {
      fontFamily: 'ubuntu-medium',
      fontWeight: 'bold',
      fill: textColor,
    };

    const currentScore = this.hud.getScore();
    const highestScore = this.hud.getHighestScore();

    const highestScoreText = new PIXI.Text(
      `Your Highest Score: ${highestScore}`,
      new PIXI.TextStyle({
        ...scoreStyle,
        fontSize: 25
      })
    );
    highestScoreText.anchor.set(0.5);
    highestScoreText.x = this.c_width / 2;
    highestScoreText.y = this.c_height / 3;
    this.container.addChild(highestScoreText);

    scoreStyle.fontSize = 35;
    const currentScoreText = new PIXI.Text(`Your Score: ${currentScore}`,
      new PIXI.TextStyle({
      ...scoreStyle,
      fontSize: 35
    })
  );
    currentScoreText.anchor.set(0.5);
    currentScoreText.x = this.c_width / 2;
    currentScoreText.y = this.c_height / 3 + 60;
    this.container.addChild(currentScoreText);
  }
}
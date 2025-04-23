/**
 * GameOver - Handles the game over screen and functionality.
 * 
 * @param {PIXI.Container} gameOverContainer - Container for game over UI elements
 * @param {number} c_width - Canvas width
 * @param {number} c_height - Canvas height
 * @param {function} restartGame - Callback to restart the game
 * @param {HUD} hud - Heads-up display controller for score data
 * @param {Assets} assets - Asset manager for textures and colors
 */
export class GameOver {
  constructor(gameOverContainer, c_width, c_height, restartGame, hud, assets, exitGameOver) {

    this.container = gameOverContainer;
    this.c_width = c_width;
    this.c_height = c_height;
    this.restartGame = restartGame;
    this.hud = hud;
    this.assets = assets;
    this.loadStartPage = exitGameOver;
  }

  /**
   * Initializes game over screen elements
   * @async
   */
  async init() {
    this._loadText();
    this._loadScore();
    this._loadRestartButton();
    await this._loadLogOutButton();
  }

  async _loadLogOutButton() {
    const size = 50;

    const icon = new PIXI.Sprite(this.assets.getTexture('exit_icon'));
    icon.anchor.set(1, 0.5);
    icon.x = this.c_width - size;
    icon.y = size;
    icon.width = size;
    icon.height = size;
    icon.interactive = true;
    icon.buttonMode = true;

    icon.on('pointerdown', () => {
      this.loadStartPage();
    });

    this.container.addChild(icon);
  }

  _loadText() {
    const textColor = this.assets.getBackgroundTextColor();
    const style = new PIXI.TextStyle({
      fontFamily: 'BungeeSpice',
      fontSize: 60,
      fontWeight: 'bold',
      fill: textColor,
      dropShadow: true,
      dropShadowColor: this.assets.getScoreTextColor(),
      dropShadowDistance: 4
    });
    const message = new PIXI.Text('Game Over!', style);
    message.anchor.set(0.5, 1);
    message.x = this.c_width / 2;
    message.y = this.c_height / 3;
    this.container.addChild(message);
  }

  /**
   * Creates the interactive restart button
   * @private
   */
  _loadRestartButton() {
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
    rect.y = (this.c_height - iconH) * 5 / 6;

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
    const scoreStyle = {
      fontFamily: 'RoadRage',
      fill: this.assets.getBackgroundTextColor(),
      dropShadow: true,
      dropShadowColor: this.assets.getScoreTextColor(),
      dropShadowDistance: 4
    };

    const currentScore = this.hud.getScore();
    const highestScore = this.hud.getHighestScore();

    const currentScoreText = new PIXI.Text(`YOUR SCORE: ${currentScore}`,
      new PIXI.TextStyle({
        ...scoreStyle,
        fontSize: 50
      })
    );
    currentScoreText.anchor.set(0.5);
    currentScoreText.x = this.c_width / 2;
    currentScoreText.y = this.c_height / 2;
    this.container.addChild(currentScoreText);

    const highestScoreText = new PIXI.Text(
      `YOUR HIGHEST SCORE: ${highestScore}`,
      new PIXI.TextStyle({
        ...scoreStyle,
        fontSize: 30
      })
    );
    highestScoreText.anchor.set(0.5, 0);
    highestScoreText.x = this.c_width / 2;
    highestScoreText.y = this.c_height/ 3 + currentScoreText.height + 1.5 *highestScoreText.height;
    this.container.addChild(highestScoreText);

    
  }
}
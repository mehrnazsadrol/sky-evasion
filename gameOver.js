/**
 * GameOver - Handles the game over screen and functionality.
 * 
 * @param {PIXI.Container} gameOverContainer - Container for game over UI elements
 * @param {number} c_width - Canvas width
 * @param {number} c_height - Canvas height
 * @param {function} restartGame - Callback to restart the game
 * @param {HUD} hud - Heads-up display controller for score data
 * @param {Assets} assets - Asset manager for textures and colors
 * @param {function} exitGameOver - Callback to exit the game over screen
 * @param {function} playBtnClickSound - Function to play button click sound
 * @param {boolean} isGameOVer - Flag to check if the game is over or game is won
 */
export class GameOver {
  constructor(gameOverContainer, c_width, c_height, restartGame, hud, assets, exitGameOver, playBtnClickSound, isGameOVer) {

    this.container = gameOverContainer;
    this.c_width = c_width;
    this.c_height = c_height;
    this.restartGame = restartGame;
    this.hud = hud;
    this.assets = assets;
    this.loadStartPage = exitGameOver;
    this.playBtnClickSound = playBtnClickSound;
    this.isGameOVer = isGameOVer;
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

  /**
   * creates the logout button
   */
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
      this.playBtnClickSound();
      this.loadStartPage();
    });

    this.container.addChild(icon);
  }

  /**
   * @private
   * @method _loadText
   * @description Creates the Game over/ You won text
   */
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
    let message = null;
    if (!this.isGameOVer)
      message = new PIXI.Text('You Won!', style);
    else
      message = new PIXI.Text('Game Over!', style);
    message.anchor.set(0.5, 1);
    message.x = this.c_width / 2;
    message.y = this.c_height / 3;
    this.container.addChild(message);
  }

  /**
   * @private
   * @method _loadRestartButton
   * @description Creates the restart button
   */
  _loadRestartButton() {
    const iconW = 200;
    const iconH = 200;

    const rect = new PIXI.Graphics()
      .rect(0, 0, iconW, iconH)
      .fill({ color: 0xffffff, alpha: 0 });

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

    rect.on("click", async () => {
      this.playBtnClickSound();
      await this.restartGame();
    });

    this.container.addChild(rect);
  };

  /**
   * @private
   * @method _loadScore
   * @description Creates and positions the score and highest score text
   */
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
    highestScoreText.y = this.c_height / 3 + currentScoreText.height + 1.5 * highestScoreText.height;
    this.container.addChild(highestScoreText);


  }
}
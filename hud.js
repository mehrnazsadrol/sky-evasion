export class Hud {
  constructor(container, c_width, c_height, assets) {
    this.container = container;
    this.c_width = c_width;
    this.c_height = c_height;
    this.score = 0;
    this.assets = assets;

    this.highestScore = Number(localStorage.getItem("highestScore")) || 0;
    this.textColor = this.assets.getBackgroundTextColor();

    this.hudContainer = new PIXI.Container();
    this.scoreText = new PIXI.Text("Score: 0", {
      fontFamily: "ubuntu-medium",
      fontSize: 24,
      fill: this.textColor,
      align: "left",
    });
    this.highestScoreText = new PIXI.Text(`Highest Score: ${this.highestScore}`, {
      fontFamily: "ubuntu-medium",
      fontSize: 24,
      fill: this.textColor,
      align: "right",
    });

    this._setupHud();
  }

  _setupHud() {
    const hudBar = new PIXI.Graphics();
    hudBar.beginFill(0x000000, 0);
    hudBar.drawRect(0, 0, this.c_width, 50);
    hudBar.endFill();

    this.scoreText.x = 20;
    this.scoreText.y = 10;

    this.hudContainer.addChild(hudBar);
    this.hudContainer.addChild(this.scoreText);

    this.container.addChild(this.hudContainer);
  }

  drawScore() {
    this.scoreText.text = `Score: ${this.score}`;
  }

  addScore(score) {
    this.score += score;
    this.drawScore();

    if (this.score > this.highestScore) {
      this.updateHighestScore(this.score);
    }
  }

  getScore() {
    return this.score;
  }

  updateHighestScore(score) {
    this.highestScore = score;
    this.highestScoreText.text = `Highest Score: ${this.highestScore}`;
    this.highestScoreText.x = this.c_width - this.highestScoreText.width - 20;

    localStorage.setItem("highestScore", this.highestScore.toString());
  }

  getHighestScore() {
    return this.highestScore;
  }
}
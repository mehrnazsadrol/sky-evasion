export class GameOver {
  constructor(container, c_width, c_height, restartGame) {
    this.container = container;
    this.c_width = c_width;
    this.c_height = c_height;
    this.restartGame = restartGame;
    this._loadText();
    this._loadButtons();
    this.dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfffade,
    });
  }
  _loadText() {
    const style = new PIXI.TextStyle({
      fontFamily: 'ubuntu-medium',
      fontSize: 45,
      fontWeight: 'bold',
      fill: '#ffffff',
    });
    const message = new PIXI.Text('Game Over!', style);
    message.anchor.set(0.5);
    message.x = this.c_width / 2;
    message.y = this.c_height / 2;
    this.container.addChild(message);
  }

  async _loadButtons() {
    const iconW = 200;
    const iconH = 200;

    console.log('inside load buttons');

    const rect = new PIXI.Graphics();
    rect.beginFill(0xfffade, 1);
    rect.drawRect(0, 0, iconW, iconH);
    rect.endFill();

    rect.interactive = true;
    rect.buttonMode = true;

    const wallpaperIconTexture = await PIXI.Assets.load('res/icons/start_icon.png');
    const wallpaperIcon = new PIXI.Sprite(wallpaperIconTexture);
    wallpaperIcon.width = iconW;
    wallpaperIcon.height = iconH;

    rect.addChild(wallpaperIcon);

    console.log('inside load buttons 2');

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
    rect.y = (this.c_height - iconH) / 2;

    console.log('inside load buttons 3');

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
}
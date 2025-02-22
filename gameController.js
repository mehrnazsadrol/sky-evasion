export class GameController {

    constructor(container, backgroundManager, avatar, c_width, c_height) {
      this.container = container;
      this.backgroundManager = backgroundManager;
      this.avatar = avatar;
      this.c_width = c_width;
      this.c_height = c_height;

      this.minRoadTileWidth = c_width / 5;
      this.maxRoadTileWidth = c_width;
      this.minTileSpace = c_width / 15;
      this.maxTileSpace = c_width / 10;
      this.roadTileHeight = c_height / 10;

      this.maxWalkSpeed = 5;
      this.maxRunSpeed = 15;

      this.tiles = [];
      this.speed = 0;
      this.targetSpeed = 0;
      this.velocity = 0.1;
      this.lastKeyPressTime = 0;
      this.doublePressThreshold = 300;

      const avatarHeight = this.avatar.getAvatarHeight();
      this.avatar.addToStage(
        this.container,
        this.c_width / 2,
        this.c_height - this.roadTileHeight - avatarHeight);
    
      this.createEnvironment();
      this.initEventListeners();
    }
  
    initEventListeners() {
      const keys = {
        ArrowRight: false,
        ArrowLeft: false,
        ArrowUp: false,
        d: false,
        a: false,
        w: false,
      };
  
      window.addEventListener('keydown', (event) => {
        if (event.key in keys) {
          keys[event.key] = true;
          this.handleMovement(keys, event);
        }
      });
  
      window.addEventListener('keyup', (event) => {
        if (event.key in keys) {
          keys[event.key] = false;
          this.handleMovement(keys, event);
        }
      });
    }
  
    handleMovement(keys, event) {
      if (keys.ArrowRight || keys.d) {
        const currentTime = Date.now();
  
        if (currentTime - this.lastKeyPressTime < this.doublePressThreshold) {
          this.targetSpeed = this.maxRunSpeed;
          this.avatar.playRun();
        } else {
          this.targetSpeed = this.maxWalkSpeed;
          this.avatar.playWalk();
        }
  
        this.lastKeyPressTime = currentTime;
      } else {
        this.targetSpeed = 0;
        this.avatar.playIdle();
      }
    }

    createEnvironment() {
      const totalRoadWidth = 2 * this.c_width;
      let currentX = 0;
      while (currentX < totalRoadWidth) {
        this.addTile(currentX);
        const tileWidth = this.tiles[this.tiles.length - 1].width;
        const space = Math.floor(Math.random() * (this.maxTileSpace - this.minTileSpace + 1)) + this.minTileSpace;
        currentX += tileWidth + space;
      }
    }

    addTile(x) {
      const tileWidth = Math.floor(Math.random() * (this.maxRoadTileWidth - this.minRoadTileWidth + 1)) + this.minRoadTileWidth;
  
      const tile = new PIXI.Graphics();
      tile.beginFill(0x808080);
      tile.drawRect(0, 0, tileWidth, this.roadTileHeight);
      tile.endFill();
  
      tile.x = x;
      tile.y = this.c_height - this.roadTileHeight;
  
      this.container.addChild(tile);
      this.tiles.push(tile);
    }

  update() {
    this.speed += (this.targetSpeed - this.speed) * this.velocity;

    for (const tile of this.tiles) {
      tile.x -= this.speed;
    }

    while (this.tiles.length > 0 && this.tiles[0].x + this.tiles[0].width < 0) {
      const removedTile = this.tiles.shift();
      this.container.removeChild(removedTile);
    }

    const lastTile = this.tiles[this.tiles.length - 1];
    if (lastTile && lastTile.x + lastTile.width < 2 * this.c_width) {
      const space = Math.floor(Math.random() * (this.maxTileSpace - this.minTileSpace + 1)) + this.minTileSpace;
      this.addTile(lastTile.x + lastTile.width + space);
    }

    this.backgroundManager.updateBackgroundLayers(this.speed);
    this.avatar.activeAnimation.x = this.c_width / 2 - this.avatar.activeAnimation.width / 2;
    
  }
}
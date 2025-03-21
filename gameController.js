export class GameController {

  constructor(container, backgroundManager, avatar, c_width, c_height, totalFramesInOneSecond, gameOver, assets) {
    this.assets = assets;
    this.container = container;
    this.backgroundManager = backgroundManager;
    this.avatar = avatar;
    this.c_width = c_width;
    this.c_height = c_height;
    this.totalFramesInOneSecond = totalFramesInOneSecond;
    this.gameOver = gameOver;

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
    this.isRightKeyPressed = false;

    this.isJumping = false;
    this.isDoubleJumping = false;
    this.jumpStartTime = 0;
    this.jumpDuration = 500;
    this.jumpHorizontalDistance = (this.minTileSpace + this.maxTileSpace) / 2;
    this.jumpPeakHeight = 80;
    this.horizontalMovementPerFrame = null;

    this.isFalling = false;
    this.fallSpeed = 10;

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
      if (event.key in keys && !this.isFalling) {
        keys[event.key] = true;
        this.handleMovement(keys, event);
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.key in keys && !this.isFalling) {
        keys[event.key] = false;
        this.handleMovement(keys, event);
      }
    });
  }

  handleMovement(keys, event) {
    if ((keys.ArrowRight || keys.d) && !this.isJumping && !this.isDoubleJumping) {
      if (!this.isRightKeyPressed) {
        const currentTime = Date.now();
        if (currentTime - this.lastKeyPressTime < this.doublePressThreshold) {
          this.rightKeyPressCount++;
        } else {
          this.rightKeyPressCount = 1;
        }
        this.lastKeyPressTime = currentTime;

        if (this.rightKeyPressCount === 2) {
          this.targetSpeed = this.maxRunSpeed;
          this.avatar.playRun();
        } else {
          this.targetSpeed = this.maxWalkSpeed;
          this.avatar.playWalk();
        }
      }
      this.isRightKeyPressed = true;
    } else if (keys.ArrowUp || keys.w) {
      if (!this.isJumping) {
        this.isJumping = true;
        this.jumpStartTime = Date.now();
        this.horizontalMovementPerFrame = this.jumpHorizontalDistance / (this.totalFramesInOneSecond * this.jumpDuration / 1000);
        this.avatar.playJump();
      } else if (this.isJumping && !this.isDoubleJumping) {
        this.isDoubleJumping = true;
        this.jumpStartTime = Date.now();
        this.horizontalMovementPerFrame = 2 * this.jumpHorizontalDistance / (this.totalFramesInOneSecond * this.jumpDuration / 1000)
        this.avatar.playJump();
      }
    } else {

      if (!keys.ArrowRight && !keys.d) {
        this.isRightKeyPressed = false;
      }

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

  _handleJump() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.jumpStartTime;
    const progress = Math.min(elapsedTime / this.jumpDuration, 1);

    const peakHeight = this.isDoubleJumping ? 2 * this.jumpPeakHeight : this.jumpPeakHeight;
    const verticalMovement = -4 * peakHeight * progress * (1 - progress);

    const avatarBaseY = this.c_height - this.roadTileHeight - this.avatar.getAvatarHeight();
    this.avatar.activeAnimation.y = avatarBaseY + verticalMovement;

    if (progress >= 1) {
      if (this.isDoubleJumping) {
        this.isJumping = false;
        this.isDoubleJumping = false;
      } else {
        this.isJumping = false;
      }
      this.avatar.playIdle();
    }
  }

  update() {
    if (this.isFalling) {
      this._handleFall();
      return;
    }

    if (this.isJumping) {
      this._handleJump();
      this.speed = this.horizontalMovementPerFrame;
    } else {
      this.speed += (this.targetSpeed - this.speed) * this.velocity;
    }
    for (const tile of this.tiles) {
      tile.x -= this.speed;
    }

    if (!this.isJumping) {
      this._checkFellDown();
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

  _checkFellDown() {
    const avatarWidth = this.avatar.getAvatarWidth();
    const avatarX = this.avatar.getAvatarX();

    for (let i = 0; i < this.tiles.length - 1; i++) {
      const currentTile = this.tiles[i];
      const nextTile = this.tiles[i + 1];

      const gapStart = currentTile.x + currentTile.width;
      const gapEnd = nextTile.x;

      const avatarFallThreshold = 1 - this.assets.getAvatarFallThreshold();

      if (
        avatarX + avatarWidth *  avatarFallThreshold > gapStart &&
        avatarX + avatarWidth * avatarFallThreshold < gapEnd
      ) {
        this.avatar.setAvatarX(gapStart - avatarWidth / 2);

        this.isFalling = true;
        break;
      }
    }
  }

  _handleFall() {
    const avatarY = this.avatar.getAvatarY();
    if (avatarY > this.c_height) {
      this.gameOver();
    } else {
      this.avatar.setAvatarY( avatarY + this.fallSpeed);
    }
  }
}
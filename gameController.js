import { Slime } from './slime.js';
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
    this.jumpHorizontalDistance = this.minTileSpace * 2;
    this.jumpPeakHeight = (this.c_height - 2 * this.roadTileHeight - this.avatar.getAvatarHeight()) /2  ;
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
    const avatarState = this.avatar.getAvatarState();
    const currentTime = Date.now();
    
    // Handle right movement (walk/run)
    if (keys.ArrowRight || keys.d) {
        // Check for double press to run
        if (event.type === 'keydown') {
            if (currentTime - this.lastKeyPressTime < this.doublePressThreshold && 
                !this.isRightKeyPressed) {
                // Double press detected - run
                this.targetSpeed = this.maxRunSpeed;
                this.avatar.setAvatarState('run');
            } else if (!this.isRightKeyPressed) {
                // Single press - walk
                this.targetSpeed = this.maxWalkSpeed;
                this.avatar.setAvatarState('walk');
            }
            this.lastKeyPressTime = currentTime;
        }
        
        this.isRightKeyPressed = true;
    } else {
        // Right key released
        if (this.isRightKeyPressed) {
            this.targetSpeed = 0;
            if (!this.isJumping) {
                this.avatar.setAvatarState('idle');
            }
        }
        this.isRightKeyPressTime = 0;
        this.isRightKeyPressed = false;
    }

    // Handle jumping
    if ((keys.ArrowUp || keys.w) && event.type === 'keydown') {
        if (!this.isJumping) {
            // First jump
            this.isJumping = true;
            this.jumpStartTime = Date.now();
            this.horizontalMovementPerFrame = this.jumpHorizontalDistance / 
                (this.totalFramesInOneSecond * this.jumpDuration / 1000);
            this.avatar.setAvatarState('jump');
        } else if (!this.isDoubleJumping) {
            // Double jump
            this.isDoubleJumping = true;
            this.jumpStartTime = Date.now();
            this.horizontalMovementPerFrame = 2 * this.jumpHorizontalDistance / 
                (this.totalFramesInOneSecond * this.jumpDuration / 1000);
            this.avatar.setAvatarState('jump');
        }
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
    if (Math.random() < 0.5) {
      const slimeX = tile.x + Math.random() * tile.width;
      const slimeY = tile.y;
      tile.slime = new Slime(this.container, slimeX, slimeY, this.assets, 'blue');
    }

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
      if (this.isRightKeyPressed) {
        this.avatar.setAvatarState(this.targetSpeed === this.maxRunSpeed ? 'run' : 'walk');
    } else {
        this.avatar.setAvatarState('idle');
    }
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
      if (tile.slime)
        tile.slime.setSlimeX(-this.speed);
    }

    if (!this.isJumping) {
      this._checkFellDown();
      this._checkSlimeCollision();
    }

    while (this.tiles.length > 0 && this.tiles[0].x + this.tiles[0].width < 0) {
      const removedTile = this.tiles.shift();
      if (removedTile.slime) {
        this.container.removeChild(removedTile.slime);
      }
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
        avatarX + avatarWidth * avatarFallThreshold > gapStart &&
        avatarX + avatarWidth * avatarFallThreshold < gapEnd
      ) {
        this.avatar.setAvatarX(gapStart - avatarWidth / 2);

        this.isFalling = true;
        break;
      }
    }
  }

  _checkSlimeCollision() {
    const avatarX = this.avatar.getAvatarX();
    const avatarY = this.avatar.getAvatarY();
    const avatarWidth = this.avatar.getAvatarWidth();
    const avatarHeight = this.avatar.getAvatarHeight();
    const avatarCollisionThreshold = this.assets.getAvatarCollisionThreshold();

    for (const tile of this.tiles) {
      if (tile.slime) {
        const slime = tile.slime;
        const slimeX = slime.animatedSlime.x;
        const slimeWidth = slime.animatedSlime.width;

        if (
          avatarX + avatarWidth * avatarCollisionThreshold > slimeX &&
          avatarX + avatarWidth * avatarCollisionThreshold < slimeX + slimeWidth
        ) {
          this.gameOver();
        }
      }
    }
  }

  _handleFall() {
    const avatarY = this.avatar.getAvatarY();
    if (avatarY > this.c_height) {
      this.gameOver();
    } else {
      this.avatar.setAvatarY(avatarY + this.fallSpeed);
    }
  }
}
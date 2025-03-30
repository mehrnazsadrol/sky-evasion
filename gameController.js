import { Slime } from './slime.js';
export class GameController {

  constructor(container, backgroundManager, avatar, c_width, c_height, totalFramesInOneSecond, gameOver, assets, hud) {
    this.assets = assets;
    this.container = container;
    this.backgroundManager = backgroundManager;
    this.avatar = avatar;
    this.c_width = c_width;
    this.c_height = c_height;
    this.totalFramesInOneSecond = totalFramesInOneSecond;
    this.gameOver = gameOver;
    this.hud = hud;

    this.maxWalkSpeed = 5;
    this.maxRunSpeed = 15;

    this.tiles = [];
    this.speed = 0;
    this.targetSpeed = 0;
    this.velocity = 0.1;
    this.lastKeyPressTime = 0;
    this.doublePressThreshold = 300;
    this.isRightKeyPressed = false;

    this.minRoadTileWidth = c_width;
    this.maxRoadTileWidth = c_width;
    this.minTileSpace = c_width / 15;
    this.roadTileHeight = c_height / 10;

    this.isJumping = false;
    this.isDoubleJumping = false;
    this.jumpStartTime = 0;
    this.jumpDuration = 500;
    this.jumpHorizontalDistance = this.minTileSpace * 2;
    this.jumpPeakHeight = (this.c_height - 2 * this.roadTileHeight - this.avatar.getAvatarHeight()) / 2;
    this.horizontalMovementPerFrame = null;

    this.maxTileSpace = this.jumpHorizontalDistance * 0.9;
    this.maxDifficulty = this.maxTileSpace - this.minTileSpace;


    this.isFalling = false;
    this.fallSpeed = 10;

    this.distanceTraveled = 0;
    this.baseDifficulty = 0;
    this.slimeSpawnChance = 0.3;
    this.maxSlimeSpawnChance = 0.8;


    this.totalTilesGenerated = 0;
    this.lastTilePassed = 0; 
    this.lastSlimeJumped = null;

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

    if (keys.ArrowRight || keys.d) {
      if (event.type === 'keydown') {
        if (currentTime - this.lastKeyPressTime < this.doublePressThreshold &&
          !this.isRightKeyPressed) {
          this.targetSpeed = this.maxRunSpeed;
          this.avatar.setAvatarState('run');
        } else if (!this.isRightKeyPressed) {
          this.targetSpeed = this.maxWalkSpeed;
          this.avatar.setAvatarState('walk');
        }
        this.lastKeyPressTime = currentTime;
      }

      this.isRightKeyPressed = true;
    } else {
      if (this.isRightKeyPressed) {
        this.targetSpeed = 0;
        if (!this.isJumping) {
          this.avatar.setAvatarState('idle');
        }
      }
      this.isRightKeyPressTime = 0;
      this.isRightKeyPressed = false;
    }

    if ((keys.ArrowUp || keys.w) && event.type === 'keydown') {
      if (!this.isJumping) {
        this.isJumping = true;
        this.jumpStartTime = Date.now();
        this.horizontalMovementPerFrame = this.jumpHorizontalDistance /
          (this.totalFramesInOneSecond * this.jumpDuration / 1000);
        this.avatar.setAvatarState('jump');
      } else if (!this.isDoubleJumping) {
        this.isDoubleJumping = true;
        this.jumpStartTime = Date.now();
        this.horizontalMovementPerFrame = 2 * this.jumpHorizontalDistance /
          (this.totalFramesInOneSecond * this.jumpDuration / 1000);
        this.avatar.setAvatarState('jump');
      }
    }
  }

  createEnvironment() {
    this.addTile(0, true);

    const totalRoadWidth = 2 * this.c_width;
    let currentX = this.minRoadTileWidth;
    while (currentX < totalRoadWidth) {
      this.addTile(currentX);
      const tileWidth = this.tiles[this.tiles.length - 1].width;
      const space = Math.floor(Math.random() * (this.maxTileSpace - this.minTileSpace + 1)) + this.minTileSpace;
      currentX += tileWidth + space;
    }
    this.minRoadTileWidth = this.c_width / 5;
  }

  getCurrentTile() {
    const avatarX = this.avatar.getAvatarX();
    for (const tile of this.tiles) {
      if (avatarX >= tile.x && avatarX < tile.x + tile.width) {
        return tile;
      }
    }
    return null;
  }

  getCurrentTileSpace() {
    const minSpace = this.minTileSpace;
    const maxSpace = this.minTileSpace + this.baseDifficulty;
    return Math.floor(Math.random() * (maxSpace - minSpace + 1)) + minSpace;
  }


  addTile(x, isFirstTile = false) {
    const tileWidth = isFirstTile ? this.c_width :
      Math.floor(Math.random() * (this.maxRoadTileWidth - this.minRoadTileWidth + 1)) + this.minRoadTileWidth;

    const tile = new PIXI.Graphics();
    tile.beginFill(0x808080);
    tile.drawRect(0, 0, tileWidth, this.roadTileHeight);
    tile.endFill();

    tile.x = x;
    tile.y = this.c_height - this.roadTileHeight;
    console.log('slimeSpawnChance', this.slimeSpawnChance);
    if (!isFirstTile && Math.random() < this.slimeSpawnChance) {
      const slimeCount = 1 + Math.floor(Math.random() * (1 + Math.floor(this.baseDifficulty / 2)));
      console.log(slimeCount);
      for (let i = 0; i < slimeCount; i++) {
        const slimeX = tile.x + Math.random() * (tile.width - this.assets.getSlimeTextureWidth());
        const slimeY = tile.y;
        if (!tile.slimes) tile.slimes = [];
        tile.slimes.push(new Slime(this.container, slimeX, slimeY, this.assets, 'blue'));
      }
    }

    this.container.addChild(tile);
    tile.id = this.totalTilesGenerated++;
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
    this.distanceTraveled += this.speed;
    this.baseDifficulty = Math.min(Math.floor(this.distanceTraveled / (2*this.c_width)), this.maxDifficulty);

    this.slimeSpawnChance = Math.min(0.3 + (this.baseDifficulty * 0.05), this.maxSlimeSpawnChance);
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
      if (tile.slimes)
        for (const slime of tile.slimes)
          slime.setSlimeX(-this.speed);
    }

    if (!this.isJumping) {
      this._checkFellDown();
      this._checkSlimeCollision();
    }
    const currentTile = this.getCurrentTile();
    if (currentTile && currentTile.id > this.lastTilePassed) {
      const tilesPassed = currentTile.id - this.lastTilePassed;
      this.hud.addScore(10 * tilesPassed);
      this.lastTilePassed = currentTile.id;
    }

    while (this.tiles.length > 0 && this.tiles[0].x + this.tiles[0].width < 0) {
      const removedTile = this.tiles.shift();
      if (removedTile.slimes) {
        for (const slime of removedTile.slimes)
          this.container.removeChild(slime.animatedSlime);
      }
      this.container.removeChild(removedTile);
    }

    const lastTile = this.tiles[this.tiles.length - 1];
    if (lastTile && lastTile.x + lastTile.width < 2 * this.c_width) {
      const space = this.getCurrentTileSpace();
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
    const avatarWidth = this.avatar.getAvatarWidth();
    const avatarCollisionThreshold = this.assets.getAvatarCollisionThreshold();

    for (const tile of this.tiles) {
      if (tile.slimes) {
        for (const slime of tile.slimes) {
          const slimeX = slime.animatedSlime.x;
          const slimeWidth = slime.animatedSlime.width;
          if (this.isJumping || this.isDoubleJumping) {
            if (!slime.jumpedOver &&
              avatarX + avatarWidth * 0.7 > slimeX &&
              avatarX < slimeX + slimeWidth * 0.7) {
              slime.jumpedOver = true;
              this.hud.addScore(50);
              this.lastSlimeJumped = slime;
            }
          } else if (
            avatarX + avatarWidth * avatarCollisionThreshold > slimeX &&
            avatarX < slimeX + slimeWidth * avatarCollisionThreshold
          ) {
            this.gameOver();
          }
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
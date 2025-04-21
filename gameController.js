import { Slime } from './slime.js';
import {Gem} from './gem.js';

export class GameController {

  constructor(container, backgroundManager, avatar, c_width, c_height, totalFramesInOneSecond, gameOver, assets, hud, levelManager) {
    this.assets = assets;
    this.container = container;
    this.backgroundManager = backgroundManager;
    this.avatar = avatar;
    this.c_width = c_width;
    this.c_height = c_height;
    this.totalFramesInOneSecond = totalFramesInOneSecond;
    this.gameOver = gameOver;
    this.hud = hud;
    this.levelManager = levelManager;

    this.distanceToLevelUp = this.c_width *3;


    this.speed = 0;
    this.targetSpeed = 0;
    this.velocity = 0.1;
    this.lastKeyPressTime = 0;
    this.doublePressThreshold = 300;
    this.isRightKeyPressed = false;
    this.isJumping = false;
    this.isDoubleJumping = false;
    this.jumpStartTime = 0;
    this.jumpPeakHeight = (this.c_height - 2 * this.roadTileHeight - this.avatar.getAvatarHeight()) / 2;

    this.tiles = [];
    this.roadTileHeight = c_height / 10;


    this.isFalling = false;
    this.fallSpeed = 10;

    this.distanceTraveled = 0;


    this.totalTilesGenerated = 0;
    this.lastTilePassed = 0; 
    this.lastSlimeJumped = null;

    this.maxWalkSpeed = this.levelManager.getMaxWalkSpeed();
    this.maxRunSpeed = this.levelManager.getMaxRunSpeed();
    this.jumpDuration = this.levelManager.getJumpDuration();

    console.log('gamecontroller: '+this.maxWalkSpeed, this.maxRunSpeed, this.jumpDuration);

    const avatarHeight = this.avatar.getAvatarHeight();
    this.avatar.addToStage(
      this.container,
      this.c_width / 2,
      this.c_height - this.roadTileHeight - avatarHeight);

    this.createEnvironment();
    this.initEventListeners();
    console.log('gamecontroller constructor done!');
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
        this.avatar.setAvatarState('jump');
      } else if (!this.isDoubleJumping) {
        this.isDoubleJumping = true;
        this.jumpStartTime = Date.now();
        this.avatar.setAvatarState('jump');
      }
    }
  }

  createEnvironment() {
    this.addTile(0,this.c_width, null, true);

    //{
    //   tileWidth: tileWidth,
    //   slimeInfo: slimeInfo,
    //   tileSpace: tileSpace,
    //   gemType: gemType,
    // }
    const tileInfo= this.levelManager.getTileInfo();


    const totalRoadWidth = 2 * this.c_width; // creating tiles one screen width ahead
    let currentX = this.c_width;
    while (currentX < totalRoadWidth) {
      this.addTile(currentX, tileInfo.tileWidth, tileInfo.slimeInfo);
      this.addGem(currentX+tileInfo.tileWidth, tileInfo.tileSpace, tileInfo.gemType);
      currentX += tileInfo.tileWidth + tileInfo.tileSpace;
    }
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

  addGem(x, tileSpace, gemType) {
    if (gemType === null || gemType === undefined) return;
    const gemX = x + tileSpace* 0.5;
    const gem = new Gem(this.container, gemX, this.roadTileHeight*2, this.assets, gemType);
    const lastTile = this.tiles[this.tiles.length - 1];
    if (!lastTile.gems) lastTile.gems = [];
    lastTile.gems.push(gem);
  }


  addTile(x, tileWidth, slimeInfo, isFirstTile = false) {
    console.log('addTile: '+x, tileWidth, slimeInfo);
    const tile = new PIXI.Graphics();
    tile.beginFill(0x808080);
    tile.drawRect(0, 0, tileWidth, this.roadTileHeight);
    tile.endFill();

    tile.x = x;
    tile.y = this.c_height - this.roadTileHeight;
    if (!isFirstTile && slimeInfo!== null) {
      const slimeCount = slimeInfo.reduce((acc, val) => acc + val, 0);
      const slimeWidth = this.assets.getSlimeTextureWidth();
      console.log('slimeCount'+slimeCount);
      for (let i = 2; i >0; i--) {
        const slimeX = tile.x + slimeWidth*0.5 + Math.random() * (tile.width - slimeWidth);
        const slimeY = tile.y;
        if (!tile.slimes) tile.slimes = [];
        for (let j = 0; j < slimeInfo[i]; j++) {
          const isSlimeMoving = this.levelManager.getIsSlimeMoving();
          console.log('isSlimeMoving: '+isSlimeMoving);
          tile.slimes.push(new Slime(this.container, slimeX, slimeY, this.assets, this.c_height, isSlimeMoving, i));
        }
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
      this.avatar.activeAnimation.y = avatarBaseY;
      if (this.isRightKeyPressed) {
        this.avatar.setAvatarState(this.targetSpeed === this.maxRunSpeed ? 'run' : 'walk');
      } else {
        this.avatar.setAvatarState('idle');
      }
    }
  }

  update() {
    this.distanceTraveled += this.speed;
    if (this.distanceTraveled > this.distanceToLevelUp) this.levelManager.levelUp();

    if (this.isFalling) {
      this._handleFall();
      return;
    }

    this.speed += (this.targetSpeed - this.speed) * this.velocity;
    if (this.isJumping) {
      this._handleJump();
    } 

    for (const tile of this.tiles) {
      tile.x -= this.speed;
      if (tile.slimes)
        for (const slime of tile.slimes)
          slime.updateSlime(-this.speed, tile.x + slime.getSlimeWidth()*0.5, tile.x + tile.width - slime.getSlimeWidth()*0.5, this.jumpPeakHeight * 0.7);
      if (tile.gems)
        for (const gem of tile.gems)
          gem.updateGem(-this.speed);
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
    const avatarY = this.avatar.getAvatarY();
    const avatarWidth = this.avatar.getAvatarWidth();
    const avatarHeight = this.avatar.getAvatarHeight();
    const avatarCollisionThreshold = this.assets.getAvatarCollisionThreshold();
  
    for (const tile of this.tiles) {
      if (tile.slimes) {
        for (const slime of tile.slimes) {
          const slimeX = slime.animatedSlime.x;
          const slimeY = slime.animatedSlime.y;
          const slimeWidth = slime.getSlimeWidth();
          const slimeHeight = slime.getSlimeHeight();
  
          const xCollision = 
            avatarX + avatarWidth * avatarCollisionThreshold > slimeX &&
            avatarX < slimeX + slimeWidth * avatarCollisionThreshold;
  
          // Check Y-axis collision (avatar's bottom vs slime's top)
          const yCollision = 
            avatarY + avatarHeight > slimeY - slimeHeight * 0.5 &&
            avatarY < slimeY;
  
          if (this.isJumping || this.isDoubleJumping) {
            // Only check if we're jumping over (avatar must be above slime)
            if (!slime.jumpedOver && xCollision && 
                avatarY + avatarHeight < slimeY + slimeHeight * 0.5) {
              slime.jumpedOver = true;
              this.hud.addScore(50);
              this.lastSlimeJumped = slime;
            }
          } else if (xCollision && yCollision) {
            const slimeType = slime.getSlimeType();
            const cost = slimeType === 0 ? 2 : 1;
            if (!this.hud.updateLife(cost))
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
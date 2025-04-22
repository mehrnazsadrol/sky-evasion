import { Slime } from './slime.js';
import { Gem } from './gem.js';

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


    this.speed = 0;
    this.targetSpeed = 0;
    this.velocity = 0.1;
    this.lastKeyPressTime = 0;
    this.doublePressThreshold = 300;
    this.isRightKeyPressed = false;
    this.isJumping = false;
    this.isDoubleJumping = false;
    this.jumpStartTime = 0;


    this.tiles = [];
    this.roadTileHeight = c_height / 10;
    this.jumpPeakHeight = (this.c_height - 2 * this.roadTileHeight - this.avatar.getAvatarHeight()) / 2;

    this.isFalling = false;
    this.fallSpeed = 10;

    this.totalRoadWidth = 2 * this.c_width; // creating tiles one screen width ahead

    this.totalTilesGenerated = 0;
    this.lastTilePassed = 0;
    this.lastSlimeJumped = null;

    this.maxWalkSpeed = this.levelManager.getMaxWalkSpeed();
    this.maxRunSpeed = this.levelManager.getMaxRunSpeed();
    this.jumpDuration = this.levelManager.getJumpDuration();
    this.lastTile = null;

    this.nextGem = null;
    this.autoRun = false;
    this.autoRunSpeed = 18;
    this.originalSpeed = 0;
    this.autoRunStartTime = 0;
    this.autoRunDuration = 5000; // 5 seconds
    this.nextJumpInfo = null;


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
      if (this.autoRun) return;
      if (event.key in keys && !this.isFalling) {
        keys[event.key] = true;
        this.handleMovement(keys, event);
      }
    });

    window.addEventListener('keyup', (event) => {
      if (this.autoRun) return;
      if (event.key in keys && !this.isFalling) {
        keys[event.key] = false;
        this.handleMovement(keys, event);
      }
    });
  }

  handleMovement(keys, event) {
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
  startAutoRun() {
    this.autoRun = true;
    this.originalSpeed = this.speed;
    this.autoRunStartTime = Date.now();
    this.targetSpeed = this.autoRunSpeed;
    this.avatar.setAvatarState('run');
    
    // Calculate first jump immediately if needed
    this.calculateNextJump();
  }

  endAutoRun() {
    this.autoRun = false;
    this.targetSpeed = this.originalSpeed;
    this.nextJumpInfo = null;
    
    if (this.targetSpeed > 0) {
      this.avatar.setAvatarState(this.targetSpeed === this.maxRunSpeed ? 'run' : 'walk');
    } else {
      this.avatar.setAvatarState('idle');
    }
  }

  calculateNextJump() {
    const avatarX = this.avatar.getAvatarX();
    const avatarWidth = this.avatar.getAvatarWidth();
    
    // Find current and next tile
    let currentTile = null;
    let nextTile = null;
    
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      if (avatarX >= tile.x && avatarX < tile.x + tile.width) {
        currentTile = tile;
        if (i < this.tiles.length - 1) {
          nextTile = this.tiles[i + 1];
        }
        break;
      }
    }
    
    if (currentTile && nextTile) {
      const gapStart = currentTile.x + currentTile.width;
      const gapEnd = nextTile.x;
      const gapWidth = gapEnd - gapStart;
      
      if (gapWidth > 0) {
        // Calculate when we need to jump to clear the gap
        const distanceToGap = gapStart - (avatarX + avatarWidth/2);
        const timeToGap = distanceToGap / this.autoRunSpeed;
        
        // Calculate jump parameters
        const jumpDistance = gapWidth + avatarWidth;
        const jumpHeight = this.jumpPeakHeight * 1.5; // Higher jump for autoRun
        
        this.nextJumpInfo = {
          startTime: Date.now() + timeToGap * 1000,
          duration: (jumpDistance / this.autoRunSpeed) * 1000,
          startX: gapStart - avatarWidth/2,
          endX: gapEnd + avatarWidth/2,
          peakHeight: jumpHeight
        };
      }
    }
  }

  createEnvironment() {
    this.addTile(0, this.c_width, null, false, true);


    let currentX = this.c_width;
    while (currentX < this.totalRoadWidth) {
      const tileInfo = this.levelManager.getTileInfo();
      this.addTile(currentX, tileInfo.tileWidth, tileInfo.slimeInfo, tileInfo.isLastTile);
      this.addGem(currentX + tileInfo.tileWidth, tileInfo.tileSpace, tileInfo.gemType);
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
    if (gemType === null || gemType === '') return;
    const gemX = x + tileSpace * 0.5;
    const gem = new Gem(this.container, gemX, this.c_height - this.roadTileHeight * 2, this.assets, gemType);
    const lastTile = this.tiles[this.tiles.length - 1];
    if (!lastTile.gems) lastTile.gems = [];
    lastTile.gems.push(gem);
  }


  addTile(x, tileWidth, slimeInfo, isLastTile, isFirstTile = false) {
    const tile = new PIXI.Graphics();
    tile.beginFill(0x808080);
    tile.drawRect(0, 0, tileWidth, this.roadTileHeight);
    tile.endFill();

    tile.x = x;
    tile.y = this.c_height - this.roadTileHeight;
    if (isLastTile) {
      tile.isLastTile = isLastTile;
    }
    if (!isFirstTile && slimeInfo !== null) {
      const slimeWidth = this.assets.getSlimeTextureWidth();
      for (let i = 2; i > 0; i--) {
        const slimeX = tile.x + slimeWidth * 0.5 + Math.random() * (tile.width - slimeWidth);
        const slimeY = tile.y;
        if (!tile.slimes) tile.slimes = [];
        for (let j = 0; j < slimeInfo[i]; j++) {
          const isSlimeMoving = this.levelManager.getIsSlimeMoving();
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
    if (this.isFalling) {
      this._handleFall();
      return;
    }

    // Handle autoRun timing
    if (this.autoRun) {
      if (Date.now() - this.autoRunStartTime >= this.autoRunDuration) {
        this.endAutoRun();
      } else {
        this._handleAutoRunJump();
      }
    }

    const currentTile = this.getCurrentTile();
    if (currentTile && currentTile.gems)
      this.nextGem = currentTile.gems[0];

    if (!this.autoRun) {
      // Only apply velocity smoothing when not in autoRun
      this.speed += (this.targetSpeed - this.speed) * this.velocity;
    } else {
      // In autoRun, immediately set to autoRun speed
      this.speed = this.autoRunSpeed;
    }

    if (this.isJumping) {
      this._handleJump();
      this._handleGemCollection();
    }

    for (const tile of this.tiles) {
      tile.x -= this.speed;
      if (tile.slimes)
        for (const slime of tile.slimes)
          slime.updateSlime(-this.speed, tile.x + slime.getSlimeWidth() * 0.5, tile.x + tile.width - slime.getSlimeWidth() * 0.5, this.jumpPeakHeight * 0.7);
      if (tile.gems)
        for (const gem of tile.gems)
          gem.updateGem(-this.speed);
    }

    if (!this.isJumping && !this.autoRun) {
      this._checkFellDown();
      this._checkSlimeCollision();
    }

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

    const prevTile = this.tiles[this.tiles.length - 1];
    const lastSpace = this.levelManager.getLastTileSpace();

    if (prevTile && prevTile.isLastTile) {
      this.levelManager.levelUp();
      const lvl = this.levelManager.getLevel();
      this.hud.showLevelText(lvl);
      prevTile.isLastTile = false;
    }

    if (prevTile && prevTile.x + prevTile.width < this.totalRoadWidth) {
      const tileInfo = this.levelManager.getTileInfo();
      const currentX = prevTile.x + prevTile.width + lastSpace;
      this.addTile(currentX, tileInfo.tileWidth, tileInfo.slimeInfo, tileInfo.isLastTile);
      this.addGem(currentX + tileInfo.tileWidth, tileInfo.tileSpace, tileInfo.gemType);
    }
    if (this.autoRun) {
      this.calculateNextJump();
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
              avatarY + avatarHeight < slimeY - slimeHeight * 0.5) {
              slime.jumpedOver = true;
              this.hud.addScore(50);
            }
          } else if (!slime.jumpedOver && xCollision && yCollision) {
            slime.jumpedOver = true;
            const slimeType = slime.getSlimeType();
            const cost = slimeType === 0 ? -2 : -1;
            const isAlive = this.hud.updateLife(cost);
            if (!isAlive)
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

  _handleGemCollection() {
    if (this.isFalling || !this.nextGem) return;

    const avatarX = this.avatar.getAvatarX();
    const avatarWidth = this.avatar.getAvatarWidth();

    const gemX = this.nextGem.getGemX();

    if (avatarX + avatarWidth * 0.5 > gemX) {
      const gemType = this.nextGem.getGemType();
      this.nextGem.destroy();
      this.nextGem = null;
      if (gemType === 'heart') {
        this.hud.updateLife(1);
      } else if (gemType === 'diamond' && !this.autoRun) {
        console.log('starting autoRun');
        this.startAutoRun();
      }

    }
  }


  _handleAutoRunJump() {
    const currentTime = Date.now();
    
    if (this.nextJumpInfo && currentTime >= this.nextJumpInfo.startTime && !this.isJumping) {
      this.isJumping = true;
      this.jumpStartTime = currentTime;
      this.avatar.setAvatarState('jump');
    }
    
    if (this.isJumping && this.nextJumpInfo) {
      const elapsed = currentTime - this.jumpStartTime;
      const progress = Math.min(elapsed / this.nextJumpInfo.duration, 1);
      
      // Calculate horizontal position (linear)
      const newX = this.nextJumpInfo.startX + 
                  (this.nextJumpInfo.endX - this.nextJumpInfo.startX) * progress;
      
      // Calculate vertical position (parabolic)
      const verticalMovement = -4 * this.nextJumpInfo.peakHeight * progress * (1 - progress);
      const avatarBaseY = this.c_height - this.roadTileHeight - this.avatar.getAvatarHeight();
      
      this.avatar.activeAnimation.x = newX - this.avatar.getAvatarWidth()/2;
      this.avatar.activeAnimation.y = avatarBaseY + verticalMovement;
      
      if (progress >= 1) {
        this.isJumping = false;
        this.nextJumpInfo = null;
        this.avatar.setAvatarState('run');
        this.calculateNextJump();
      }
    }
  }
}
/**
 * @file GameController.js
 * @description Main game logic controller that manages gameplay mechanics including:
 *              - Player movement (walking, running, jumping)
 *              - Collision detection (slimes, gaps)
 *              - Level progression and tile generation
 *              - Score and life management
 *              - Special abilities (auto-run)
 * 
 * Called By: Main
 * Calls: All game component classes (Avatar, Slime, Gem, etc.)
 */
import {Slime} from './slime.js';
import {Gem} from './gem.js';
export class GameController {
  /**
   * @constructor
   * @description Initializes the game controller with all necessary components
   * @param {PIXI.Container} container - Game elements container
   * @param {CityBackgroundManager} backgroundManager - Background controller
   * @param {Avatar} avatar - Player avatar instance
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height
   * @param {number} totalFramesInOneSecond - Frame rate
   * @param {function} gameOver - Game over callback
   * @param {Hud} hud - Heads-up display manager
   * @param {LevelManager} levelManager - Level progression manager
   */
  constructor(
    container,
    backgroundManager,
    avatar,
    c_width,
    c_height,
    totalFramesInOneSecond,
    gameOver,
    assets,
    hud,
    levelManager) {

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
    this.doublePressThreshold = 300; // ms for double-tap detection
    this.isRightKeyPressed = false;
    this.isJumping = false;
    this.isDoubleJumping = false;
    this.jumpStartTime = 0;

    this.tiles = [];
    this.roadTileHeight = c_height / 10;
    this.jumpPeakHeight = (this.c_height - 2 * this.roadTileHeight - this.avatar.getAvatarHeight()) / 2;
    this.isFalling = false;
    this.fallSpeed = 10;
    this.totalRoadWidth = 2 * this.c_width;

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
    this.autoRunDuration = 5000;
    this.nextJumpInfo = null;
    this.isFirstJump = false;
    this.autoRunEnded = false;
    this.finishTile = null;
    this.gameEndMove = false;
    this.finalTileBlock = null;
    this.finishingGame = false;

    const avatarHeight = this.avatar.getAvatarHeight();
    this.avatar.addToStage(
      this.container,
      this.c_width / 2,
      this.c_height - this.roadTileHeight - avatarHeight
    );

    // Set up game environment
    this.createEnvironment();
    this.initEventListeners();
  }

  /**
   * @method initEventListeners
   * @description Sets up keyboard input listeners for player control
   */
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
      if (event.key in keys && !this.isFalling && !this.gameEndMove) {
        keys[event.key] = true;
        this.handleMovement(keys, event);
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.key in keys && !this.isFalling && !this.gameEndMove) {
        keys[event.key] = false;
        this.handleMovement(keys, event);
      }
    });
  }

  /**
   * @method handleMovement
   * @description Processes player input and adjusts movement state
   * @param {Object} keys - Current key states
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleMovement(keys, event) {
    if (this.autoRun) return;
    const currentTime = Date.now();

    // Right movement handling (walk/run)
    if (keys.ArrowRight || keys.d) {
      if (event.type === 'keydown') {
        // Double-tap detection for running
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

    // Jump handling
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

  /**
   * @method createEnvironment
   * @description Initializes the game world with starting tiles and obstacles
   */
  createEnvironment() {
    // Special case handling initial tile.( no space, slime or gem)
    this.addTile(0, this.c_width, null, false, true);

    // Generate additional tiles to fill view
    let currentX = this.c_width;
    while (currentX < this.totalRoadWidth) {
      const tileInfo = this.levelManager.getTileInfo();
      this.addTile(currentX, tileInfo.tileWidth, tileInfo.slimeInfo, tileInfo.isLastTile);
      this.addGem(currentX + tileInfo.tileWidth, tileInfo.tileSpace, tileInfo.gemType);
      currentX += tileInfo.tileWidth + tileInfo.tileSpace;
    }
  }

  /**
   * @method getCurrentTile
   * @description Gets the tile the avatar is currently on
   * @returns {PIXI.Graphics|null} Current tile or null if not on any tile
   */
  getCurrentTile() {
    const avatarX = this.avatar.getAvatarX();
    const avatarWidth = this.avatar.getAvatarWidth();
    for (const tile of this.tiles) {
      if (avatarX + avatarWidth * 0.5 >= tile.x && avatarX + avatarWidth * 0.5 < tile.x + tile.width) {
        return tile;
      }
    }
    return null;
  }

  /**
   * @method addGem
   * @description Adds a collectible gem between tiles
   * @param {number} x - Starting x position
   * @param {number} tileSpace - Gap between tiles
   * @param {string} gemType - Type of gem ('diamond' or 'heart')
   */
  addGem(x, tileSpace, gemType) {
    if (!gemType || gemType === '') return;
    const gemX = x + tileSpace * 0.5;
    const gem = new Gem(this.container, gemX, this.c_height - this.roadTileHeight * 2, this.assets, gemType);
    const lastTile = this.tiles[this.tiles.length - 1];
    if (!lastTile.gems) lastTile.gems = [];
    lastTile.gems.push(gem);
  }

  /**
   * @method addTile
   * @description Adds a new tile to the game world
   * @param {number} x - Starting x position
   * @param {number} tileWidth - Width of the tile
   * @param {Array} slimeInfo - Slime configuration for the tile
   * @param {boolean} isLastTile - Marks level completion tile
   * @param {boolean} isFirstTile - Marks starting tile
   */
  addTile(x, tileWidth, slimeInfo, isLastTile, isFirstTile = false) {
    const tile = new PIXI.Graphics()
    .rect(0, 0, tileWidth, this.roadTileHeight)
    .fill({color:0x808080});

    tile.x = x;
    tile.y = this.c_height - this.roadTileHeight;
    
    if (isLastTile) {
      tile.isLastTile = isLastTile;
    }

    if (!isFirstTile && slimeInfo) {
      const slimeWidth = this.assets.getSlimeTextureWidth();
      for (let i = 2; i >= 0; i--) { // Red (0), Green (1), Blue(2)
        const slimeX = tile.x + slimeWidth * 0.5 + Math.random() * (tile.width - slimeWidth);
        const slimeY = tile.y;
        if (!tile.slimes) tile.slimes = [];
        for (let j = 0; j < slimeInfo[i]; j++) {
          const isSlimeMoving = this.levelManager.getIsSlimeMoving();
          tile.slimes.push(new Slime(
            this.container, 
            slimeX, 
            slimeY, 
            this.assets, 
            this.c_height, 
            isSlimeMoving, 
            i,
            this.levelManager.getLevel(),
          ));
        }
      }
    }

    this.container.addChild(tile);
    tile.id = this.totalTilesGenerated++;
    this.tiles.push(tile);
  }

  /**
   * @method update
   * @description Main game loop update called every frame
   */
  update() {
    // Handle falling state
    if (this.isFalling) {
      this._handleFall();
      return;
    }

    const currentTile = this.getCurrentTile();

    // Auto-run logic
    if (this.autoRun) {
      if (Date.now() - this.autoRunStartTime >= this.autoRunDuration && 
          !this.isJumping &&  
          (currentTile && this.avatar.getAvatarX() + this.avatar.getAvatarWidth() < currentTile.x + currentTile.width * 0.67)) {
        this.endAutoRun();
      } else {
        this._handleAutoRunJump();
      }
    }
    //check if avatar is on the finish tile (won the game!)
    if (this.finishTile && currentTile?.id === this.finishTile?.id) {
      this.gameEndMove = true;
      this.handleFinishTileMovement();
      return;
    }
    // Track next gem for collection
    if (currentTile?.gems) {
      this.nextGem = currentTile.gems[0];
    }

    // Movement speed handling
    if (this.autoRun || this.autoRunEnded) {
      this.speed = this.targetSpeed;
      if (this.autoRunEnded) this.autoRunEnded = false;
    } else {
      // Smooth acceleration/deceleration
      this.speed += (this.targetSpeed - this.speed) * this.velocity;
    }

    if (this.isJumping) this._handleJump();
    // Gem collection during jumps
    if (this.isJumping) {
      this._handleGemCollection();
    }

    // Update all game elements
    this._updateGameElements();

    if (!this.isJumping && !this.autoRun) {
      this._checkFellDown();
    }
    this._checkSlimeCollision();

    // Score tracking
    if (currentTile?.id > this.lastTilePassed) {
      const tilesPassed = currentTile.id - this.lastTilePassed;
      this.hud.addScore(10 * tilesPassed);
      this.lastTilePassed = currentTile.id;
    }

    this._cleanupOffscreenTiles();

    this._handleLevelProgression();
    
    // Center avatar horizontally
    this.avatar.activeAnimation.x = this.c_width / 3;
  }

  /**
   * @private
   * @method _updateGameElements
   * @description Updates positions of all moving game elements
   * @param {PIXI.Graphics} currentTile - The tile the avatar is currently on
   */
  _updateGameElements() {
    for (const tile of this.tiles) {
      tile.x -= this.speed;
      if (tile.slimes)
        for (const slime of tile.slimes)
          slime.updateSlime(
            -this.speed,
            tile.x + slime.getSlimeWidth() * 0.5,
            tile.x + tile.width - slime.getSlimeWidth() * 0.5,
            this.jumpPeakHeight * 0.7);
      if (tile.gems)
        for (const gem of tile.gems)
          gem.updateGem(-this.speed);
    }
    //move the block for victory screen if it exists
    if (this.finalTileBlock)
      this.finalTileBlock.x -= this.speed;

    this.backgroundManager.updateBackgroundLayers(this.speed);
  }

  /**
   * @private
   * @method _cleanupOffscreenTiles
   * @description Removes tiles that have scrolled off-screen
   */
  _cleanupOffscreenTiles() {
    while (this.tiles.length > 0 && this.tiles[0].x + this.tiles[0].width < 0) {
      const removedTile = this.tiles.shift();
      
      if (removedTile.slimes) {
        for (const slime of removedTile.slimes) {
          this.container.removeChild(slime.animatedSlime);
        }
      }
      
      if (removedTile.gems) {
        for (const gem of removedTile.gems) {
          gem.destroy();
        }
      }
      this.container.removeChild(removedTile);
    }
  }

  /**
   * @private
   * @method _handleLevelProgression
   * @description Handles level completion and new tile generation
   */
  _handleLevelProgression() {
    if (this.finishingGame) return;
    const prevTile = this.tiles[this.tiles.length - 1];
    const lastSpace = this.levelManager.getLastTileSpace();

    if (prevTile?.isLastTile) {
      const currLvl = this.levelManager.getLevel();
      if (currLvl + 1 > this.levelManager.getMaxLevel()) {
        // Game won
        this.finishingGame = true;
        this.hud.addScore(500);
      } else {
        // Level up and continue :)
        this.levelManager.levelUp();
        this.hud.showLevelText(currLvl + 1);
        this.hud.updateLife(2);
        this.hud.addScore(300);
      }
      prevTile.isLastTile = false;
    }

    if (prevTile && prevTile.x + prevTile.width < this.totalRoadWidth && !this.finishingGame) {
      const tileInfo = this.levelManager.getTileInfo();
      const currentX = prevTile.x + prevTile.width + lastSpace;
      this.addTile(currentX, tileInfo.tileWidth, tileInfo.slimeInfo, tileInfo.isLastTile);
      this.addGem(currentX + tileInfo.tileWidth, tileInfo.tileSpace, tileInfo.gemType);
    }
    if (this.finishingGame) {
      this.createFinalTileSet(prevTile.x + prevTile.width);
    }

    if (this.autoRun && !this.nextJumpInfo) {
      this.calculateNextJump();
    }
  }

  /**
   * @private
   * @method _handleJump
   * @description Handles jump physics and animation
   */
  _handleJump() {
    if (this.autoRun || this.autoRunEnded) return;
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.jumpStartTime;
    const progress = Math.min(elapsedTime / this.jumpDuration, 1);

    const peakHeight = this.isDoubleJumping ? 2 * this.jumpPeakHeight : this.jumpPeakHeight;
    // Parabolic jump curve
    const verticalMovement = -4 * peakHeight * progress * (1 - progress);

    const avatarBaseY = this.c_height - this.roadTileHeight - this.avatar.getAvatarHeight();
    this.avatar.activeAnimation.y = avatarBaseY + verticalMovement;

    // Jump completion
    if (progress >= 1) {
      if (this.isDoubleJumping) {
        this.isJumping = false;
        this.isDoubleJumping = false;
      } else {
        this.isJumping = false;
      }
      this.avatar.activeAnimation.y = avatarBaseY;
      // Return to appropriate movement state
      if (this.isRightKeyPressed) {
        this.avatar.setAvatarState(this.targetSpeed === this.maxRunSpeed ? 'run' : 'walk');
      } else {
        this.avatar.setAvatarState('idle');
      }
    }
  }

  /**
   * @private
   * @method _checkFellDown
   * @description Checks if avatar has fallen between tiles
   */
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

  /**
   * @private
   * @method _checkSlimeCollision
   * @description Handles collision detection with slimes
   */
  _checkSlimeCollision() {
    const avatar = this.avatar;
    const avatarX = avatar.getAvatarX();
    const avatarY = avatar.getAvatarY();
    const avatarWidth = avatar.getAvatarWidth();
    const avatarHeight = avatar.getAvatarHeight();
    const collisionThreshold = this.assets.getAvatarCollisionThreshold();

    for (const tile of this.tiles) {
        if (!tile.slimes) continue;

        for (const slime of tile.slimes) {

            const slimeX = slime.animatedSlime.x;
            const slimeY = slime.animatedSlime.y;
            const slimeWidth = slime.getSlimeWidth();
            const slimeHeight = slime.getSlimeHeight();

            const slimeLeft = slimeX - slimeWidth * 0.5;
            const slimeRight = slimeX + slimeWidth * 0.5;
            const slimeTop = slimeY - slimeHeight;
            const slimeBottom = slimeY;

            const avatarLeft = avatarX;
            const avatarRight = avatarX + avatarWidth * collisionThreshold;
            const avatarTop = avatarY;
            const avatarBottom = avatarY + avatarHeight;

            const xOverlap = avatarRight > slimeLeft && avatarLeft < slimeRight;

            if ((this.isJumping || this.isDoubleJumping || this.autoRun)&& !slime.jumpedOver) {
                const verticalClear = avatarBottom < slimeTop;
                if (xOverlap && (verticalClear || this.autoRun)) {
                    slime.jumpedOver = true;
                    this.hud.addScore(50);
                    continue;
                }
            }

            const yOverlap = avatarBottom > slimeTop && avatarTop < slimeBottom;
            if (xOverlap && yOverlap && !slime.collisionProcessed) {
                slime.collisionProcessed = true;
                
                const slimeType = slime.getSlimeType();
                const cost = slimeType === 0 ? -2 : -1;
                if (!this.hud.updateLife(cost)) {
                    this.gameOver(true);
                    return;
                }
            }
        }
    }
}


  /**
   * @private
   * @method _handleFall
   * @description Handles falling state and game over when falling off screen
   */
  _handleFall() {
    const avatarY = this.avatar.getAvatarY();
    if (avatarY > this.c_height) {
      this.gameOver(true);
    } else {
      this.avatar.setAvatarY(avatarY + this.fallSpeed);
    }
  }

  /**
   * @private
   * @method _handleGemCollection
   * @description Handles gem collection during jumps
   */
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
        this.hud.addScore(100);
      } else if (gemType === 'diamond') {
        if (!this.autoRun) this.startAutoRun();
        this.hud.addScore(150);
      }
    }
  }

  /**
   * @method startAutoRun
   * @description Activates the auto-run power-up
   */
  startAutoRun() {
    this.autoRun = true;
    this.originalSpeed = this.speed;
    this.autoRunStartTime = Date.now();
    this.targetSpeed = this.autoRunSpeed;
    this.isFirstJump = true;
    this.isRightKeyPressed = false;
    this.lastKeyPressTime = 0;
    this.calculateNextJump();
    this.hud.showAutoRunTimer(this.autoRunDuration);
  }

  /**
   * @method endAutoRun
   * @description Deactivates the auto-run power-up
   */
  endAutoRun() {
    this.autoRun = false;
    this.targetSpeed = 0;
    this.nextJumpInfo = null;
    this.isFirstJump = false;
    this.autoRunEnded = true;
    this.isDoubleJumping = false;
    this.avatar.setAvatarState('idle');
  }

  /**
   * @method calculateNextJump
   * @description Calculates parameters for auto-run jumps
   */
  calculateNextJump() {
    const avatarX = this.avatar.getAvatarX();
    const avatarWidth = this.avatar.getAvatarWidth();

    if (!this.isFirstJump){
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
          const distanceToGap = gapStart - (avatarX + avatarWidth);
          const timeToGap = distanceToGap / this.autoRunSpeed;
          const jumpDistance = gapWidth + avatarWidth;

          this.nextJumpInfo = {
            startTime: Date.now() + timeToGap * (1000 / this.totalFramesInOneSecond),
            duration: (jumpDistance / this.autoRunSpeed) * (1000 / this.totalFramesInOneSecond),
            startX: gapStart - avatarWidth,
            endX: gapEnd,
            peakHeight: this.jumpPeakHeight
          };
        }
      }
    } else {
      let nextTile = null;

      for (let i = 0; i < this.tiles.length-1; i++) {
        const prevTile = this.tiles[i];
        nextTile = this.tiles[i + 1];
        if (avatarX >= prevTile.x + prevTile.width && avatarX < nextTile.x + nextTile.width) {
          break;
        }
      }

      if (nextTile) {
        const jumpDistance = nextTile.x - avatarX;
        const peakHeight = this.c_height - this.avatar.getAvatarY() - this.roadTileHeight - this.avatar.getAvatarHeight();

        this.nextJumpInfo = {
          startTime: Date.now(),
          duration: (jumpDistance / this.autoRunSpeed) * (1000 / this.totalFramesInOneSecond),
          startX: avatarX,
          endX: nextTile.x,
          peakHeight: peakHeight
        };
      }
    }
  }

  /**
   * @private
   * @method _handleAutoRunJump
   * @description Handles jump physics during auto-run
   */
  _handleAutoRunJump() {
    const currentTime = Date.now();

    if (this.nextJumpInfo && currentTime >= this.nextJumpInfo.startTime && !this.isJumping) {
      this.isJumping = true;
      this.avatar.setAvatarState('jump');
    }

    if (this.isJumping && this.nextJumpInfo) {
      const elapsed = currentTime - this.nextJumpInfo.startTime;
      const progress = Math.min(elapsed / this.nextJumpInfo.duration, 1);

      let verticalMovement;
      if (!this.isFirstJump) {

        verticalMovement = -4 * this.nextJumpInfo.peakHeight * progress * (1 - progress);
      } else {
        const currentY = this.avatar.getAvatarY();
        const targetY = this.c_height - this.roadTileHeight - this.avatar.getAvatarHeight();
        verticalMovement = currentY + (targetY - currentY) * progress - targetY;
      }
      const avatarBaseY = this.c_height - this.roadTileHeight - this.avatar.getAvatarHeight();

      this.avatar.activeAnimation.y = avatarBaseY + verticalMovement;

      if (progress >= 1) {
        if (this.isFirstJump) {
          this.isFirstJump = false;
        }
        this.isJumping = false;
        this.nextJumpInfo = null;
        this.avatar.setAvatarState('run');
        this.calculateNextJump();
      }
    }
  }

  /**
   * @method createFinalTileSet
   * @description Creates the final tile set for the game victory
   * @param {int} currentX x position for the last tile
   */
  createFinalTileSet(currentX) {
    if (this.finishTile) return;
    this.addTile(currentX, this.c_width*7, null, false, false);
    const blockSprite = this.assets.getBlockSprite();
    blockSprite.x = currentX + this.c_width*5.75;
    blockSprite.y = this.c_height - this.roadTileHeight;
    this.finishTile = this.tiles[this.tiles.length - 1];
    this.finalTileBlock = blockSprite;
    this.container.addChild(this.finalTileBlock);
  }

  /**
   * @method handleFinishTileMovement
   * @description Handles the movement of the avatar on the finish tile for victory
   */
  handleFinishTileMovement() {
    this.hud.showWonTheGame();
    if(this.finishTile && this.finishTile.x + this.finishTile.width > this.c_width*2) {
      if (this.avatar.getAvatarState() !== 'run') {
        this.avatar.setAvatarState('run');
      }
      this._updateGameElements();
      return;
    }
    const avatarX = this.avatar.getAvatarX();
    const jumpStartX = this.finalTileBlock.x - this.finalTileBlock.width * 0.75;
    const jumpHeight = this.finalTileBlock.height * 1.5;
    const jumpDistance = this.finalTileBlock.width * 1.5;

    this.avatar.setAvatarX(avatarX + this.speed);

    // Block Jump handling
    if (avatarX >= jumpStartX && avatarX <= jumpDistance + jumpStartX) {
      if(!this.finishingJump)
        this.finishingJump = true;
      const elapsed = avatarX - jumpStartX;
      const progress = Math.min(elapsed / jumpDistance, 1);
      const verticalMovement = -4 * jumpHeight * progress * (1 - progress);
      const avatarBaseY = this.c_height - this.roadTileHeight - this.avatar.getAvatarHeight();
      this.avatar.activeAnimation.y = avatarBaseY + verticalMovement;
      if (progress >= 1) {
        this.finishingJump = false;
      }
    }
    //call the victory game screen
    if (avatarX >= this.c_width) {
      this.gameOver(false);
    }
    
  }
}
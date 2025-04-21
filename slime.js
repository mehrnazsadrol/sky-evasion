export class Slime {
  constructor(container, iniX, iniY, assets, screenHeight, isMoving, type) {
    this.assets = assets;
    this.animationSpeed = 0.1;
    this.iniX = iniX;
    this.iniY = iniY;
    this.isMoving = isMoving;

    this.type = null;
    if (type === 0) this.type = 'red';
    else if (type === 1) this.type = 'green';
    else this.type = 'blue';

    this.screenHeight = screenHeight; //red jump
    this.movementDirection = Math.random() > 0.5 ? 1 : -1; //green movement
    this.jumpPhase = 0;
    this.isJumping = false;
    this.textures = this._getSlimeTextures(false);
    this.animatedSlime = null;

    this._createSlime(container, iniX, iniY);
  }

  _getSlimeTextures(isJumping) {
    switch (this.type) {
      case 'blue':
        return this.assets.getBlueSlimeTextures();
      case 'green':
        // Alternate between left/right facing textures
        return this.movementDirection > 0
          ? this.assets.getGreenSlimeRightTextures()
          : this.assets.getGreenSlimeLeftTextures();
      case 'red':
        return isJumping 
          ? this.assets.getRedSlimeJumpTextures()
          : this.assets.getRedSlimeIdleTextures();
      default:
        throw new Error(`Unknown slime type: ${this.type}`);
    }
  }

  _createSlime(container, x, y) {
    this.animatedSlime = new PIXI.AnimatedSprite(this.textures);
    this.animatedSlime.animationSpeed = this.animationSpeed;
    this.animatedSlime.anchor.set(0.5, 1);
    this.animatedSlime.play();
    this.animatedSlime.x = x;
    this.animatedSlime.y = y;
    container.addChild(this.animatedSlime);
  }

  _moveGreenSlime(startX, endX) {

    if (Math.random() < 0.5 || !( this.animatedSlime.x > startX && this.animatedSlime.x < endX)) {
      return;
    }
    const moveSpeed = 0.5;
    this.animatedSlime.x += this.movementDirection * moveSpeed;
  }

  _switchTextures(isJumping) {
    const newTextures = this._getSlimeTextures(isJumping);
    if (this.animatedSlime.textures !== newTextures) {
      this.animatedSlime.textures = newTextures;
      this.animatedSlime.play();
    }
  }


  _moveRedSlime(maxJumpHeight) {
    if (this.jumpPhase <= 0 && Math.random() < 0.01) {
      const minHeight = maxJumpHeight * 0.5;
      const maxHeight = maxJumpHeight;
      this.jumpHeight = minHeight + Math.random() * (maxHeight - minHeight);
      this.jumpPhase = 60;
      this.isJumping = true;
      

      this._switchTextures(true);
      const jumpDuration = 60;
      const jumpAnimationFrames = this.assets.getRedSlimeJumpTextures().length;
      this.animatedSlime.animationSpeed = jumpAnimationFrames / jumpDuration;
    }

    if (this.jumpPhase > 0) {
      this.jumpPhase--;
      const progress = this.jumpPhase / 60;
      const jumpCurve = 4 * progress * (1 - progress);
      this.animatedSlime.y = this.iniY - (this.jumpHeight * jumpCurve);
      
      if (this.jumpPhase <= 0) {
        this.isJumping = false;
        this._switchTextures(false);
        this.animatedSlime.animationSpeed = this.animationSpeed;
      }
    } else {
      this.animatedSlime.y = this.iniY;
    }
  }

  getSlimeType() {
    if (this.type == 'red') return 0;
    else if (this.type == 'green') return 1;
    else return 2;
  }

  getSlimeHeight() {
    return this.animatedSlime.height;
  };

  getSlimeWidth() {
    return this.animatedSlime.width;
  }

  updateSlime(speed, tileStartX, tileEndX, maxJumpHeight) {
    this.animatedSlime.x = this.animatedSlime.x + speed;
    if (!this.isMoving) return;
    switch (this.type) {
      case 'green':
        this._moveGreenSlime(tileStartX, tileEndX);
        break;
      case 'red':
        this._moveRedSlime(maxJumpHeight);
        break;
      default:
        return;
    }
  }

}
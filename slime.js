export class Slime {
  constructor(container, x, y, assets, type = 'blue') {
    this.assets = assets; 
    this.type = type;
    this.animationSpeed = 0.1;
    this.textures = this._getSlimeTextures();
    this.animatedSlime = null;
    this._createSlime(container, x, y);
  }
  _getSlimeTextures() {
    switch (this.type) {
      case 'blue':
        return this.assets.getBlueSlimeTextures();
      case 'green':
        return this.assets.getGreenSlimeTextures();
      case 'red':
        return this.assets.getRedSlimeTextures();
      default:
        throw new Error(`Unknown slime type: ${this.type}`);
    }
  }
  _createSlime(container, x, y){
    this.animatedSlime = new PIXI.AnimatedSprite(this.textures);
    this.animatedSlime.animationSpeed = this.animationSpeed;
    this.animatedSlime.anchor.set(0.5, 1);
    this.animatedSlime.play();
    this.animatedSlime.x = x;
    this.animatedSlime.y = y;
    container.addChild(this.animatedSlime);
  };

  getSlimeHeight(){
    return this.textures[0].height;
  };

  getSlimeWidth(){
    return this.textures[0].width;
  }

  setSlimeX(speed){
    this.animatedSlime.x = this.animatedSlime.x + speed;
  }

}
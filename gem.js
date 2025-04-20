export class Gem {
  constructor(container, x, y, assets, type) {
    console.log('Gem constructor called');
    this.assets = assets;
    this.type = type;
    this.animationSpeed = this.assets.getGemAnimationSpeed(type);
    this.textures = this.assets.getGemTextures(type);
    this.scale = this.assets.getGemScale(type);
    this.gemContainer = new PIXI.Container();
    this.gemWidth = this.assets.getAdjustedGemWidth(type);
    this.gemHeight = this.assets.getAdjustedGemHeight(type);
    this._createGem(container, x, y);

  }

  _createGem(container, x, y) {

    this.animatedGem = new PIXI.AnimatedSprite(this.textures);
    this.animatedGem.anchor.set(0.5, 1); 
    this.animatedGem.scale.set(this.scale);
    this.animatedGem.play();


    this.gemContainer.x = x;
    this.gemContainer.y = y;

    const halo = new PIXI.Graphics();
    halo.beginFill(0xFFFFFF, 0.3);
    halo.drawCircle(0, 0, this.gemWidth * 0.5);
    halo.endFill();
    
    const blurFilter = new PIXI.BlurFilter();
    blurFilter.blur = 6;
    blurFilter.padding = this.gemWidth ;
    halo.filters = [blurFilter];

    halo.y = -this.gemHeight * 0.5;

    this.gemContainer.addChild(halo);
    this.gemContainer.addChild(this.animatedGem);
    container.addChild(this.gemContainer);
}

  updateGem(speed) {
    this.gemContainer.x = this.gemContainer.x + speed;
  }

}
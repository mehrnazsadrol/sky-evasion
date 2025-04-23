/**
 * @file CityBackgroundManager.js
 * @description Manages the creation and animation of parallax city background layers.
 * 
 * Called By: GameController
 * Calls: Assets manager for background textures
 */
export class CityBackgroundManager {
  /**
   * @constructor
   * @description Initializes the background manager
   * @param {number} c_height - Canvas height
   * @param {number} c_width - Canvas width
   * @param {Assets} assets - Game assets manager
   */
  constructor(c_height, c_width, assets) {
    this.c_height = c_height;
    this.c_width = c_width;
    this.assets = assets;
    this.currentBackground = Number(localStorage.getItem('cityIndex')) || 0;
    this.cityLayers = [];
  }

  /**
   * @method mergeTextures
   * @description Combines multiple textures into one horizontally for seamless tiling
   * @param {Array<PIXI.Texture>} textures - Textures to merge
   * @param {PIXI.Renderer} renderer - PIXI renderer to use
   * @returns {PIXI.RenderTexture} Merged texture
   */
  mergeTextures(textures, renderer) {
    let totalWidth = 0;
    let totalHeight = 0;
    for (const texture of textures) {
      totalWidth += texture.width;
      totalHeight = Math.max(totalHeight, texture.height);
    }
  
    const renderTexture = PIXI.RenderTexture.create({
      width: totalWidth,
      height: totalHeight,
    });
  
    const container = new PIXI.Container();
    let x = 0;
    for (const texture of textures) {
      const sprite = new PIXI.Sprite(texture);
      sprite.x = x;
      sprite.y = 0;
      container.addChild(sprite);
      x += texture.width;
    }
  
    renderer.render(container, { renderTexture });
  
    return renderTexture;
  }

  /**
   * @method createBackgroundLayers
   * @description Creates all parallax background layers for current city theme
   * @param {PIXI.Application} app - PIXI application instance
   */
  createBackgroundLayers(app) {
    const cityN = this.currentBackground + 1; // City indexes start at 1
    const city = this.assets.getCityBackgrounds(cityN);
    if (!city) return;

    const baseScale = this.c_height / city.textures[0].height;

    for (let i = 0; i < city.count; i++) {
      const texture = city.textures[i];

      const textureInputLength = Math.max(
        Math.ceil(this.c_width / (texture.width * baseScale)), 
        2
      );
      
      const texture_input = Array.from({ length: textureInputLength }, () => texture);
      const mergedTexture = this.mergeTextures(texture_input, app.renderer);
      
      const layerWidth = mergedTexture.width * baseScale;
      const layerHeight = mergedTexture.height * baseScale;

      const layerContainer = new PIXI.Container();
      app.stage.addChild(layerContainer);

      const tilingSprite = new PIXI.TilingSprite(mergedTexture, layerWidth, layerHeight);
      tilingSprite.tileScale.set(baseScale, baseScale);
      tilingSprite.x = 0;
      tilingSprite.y = this.c_height - layerHeight;
      layerContainer.addChild(tilingSprite);

      this.cityLayers.push({
        container: layerContainer,
        tilingSprite,
        speed: i * 0.05,
      });
    }
  }

  /**
   * @method updateBackgroundLayers
   * @description Updates parallax scrolling for all background layers
   * @param {number} speed - Base scroll speed (matches player movement)
   */
  updateBackgroundLayers(speed) {
    // Apply parallax effect - each layer scrolls at different speed
    for (const layer of this.cityLayers) {
      layer.tilingSprite.tilePosition.x -= speed * layer.speed;
    }
  }
}
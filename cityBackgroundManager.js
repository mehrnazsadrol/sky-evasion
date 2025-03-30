/**
 * CityBackgroundManager - Handles the creation and management of parallax city backgrounds.
 */
export class CityBackgroundManager {
  constructor(c_height, c_width, assets) {
    this.c_height = c_height;
    this.c_width = c_width;
    this.assets = assets;
    
    this.currentBackground = Number(localStorage.getItem('cityIndex')) || 0;
    this.cityLayers = [];
  }

  /**
   * Merges multiple textures into a single horizontally tiled texture
   * @param {PIXI.Texture[]} textures - Array of textures
   * @param {PIXI.Renderer} renderer - PIXI renderer
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
   * Creates all background layers with parallax effect
   * @param {PIXI.Application} app
   */
  createBackgroundLayers(app) {
    const cityN = this.currentBackground + 1;
    const city = this.assets.getCityBackgrounds(cityN);

    const baseScale = this.c_height / city.textures[0].height;
    if (!city) return;

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
   * Updates background layer positions based on game speed
   */
  updateBackgroundLayers(speed) {
    for (const layer of this.cityLayers) {
      layer.tilingSprite.tilePosition.x -= speed * layer.speed;
    }
  }
}
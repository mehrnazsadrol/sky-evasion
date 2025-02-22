export class CityBackgroundManager {
  constructor(c_height, c_width) {
    this.c_height = c_height;
    this.c_width = c_width;
    this.currentBackground = Number(localStorage.getItem('cityIndex')) || 0;
    this.backgrounds = {
      1: {
        count: 5,
        textures: [],
        layers: []
      },
      2: {
        count: 6,
        textures: [],
        layers: []
      },
      3: {
        count: 5,
        textures: [],
        layers: []
      },
      4: {
        count: 6,
        textures: [],
        layers: []
      },
      5: {
        count: 5,
        textures: [],
        layers: []
      },
      6: {
        count: 6,
        textures: [],
        layers: []
      },
      7: {
        count: 5,
        textures: [],
        layers: []
      },
      8: {
        count: 5,
        textures: [],
        layers: []
      },
    };
  }

  async loadAssets() {
    for (const [key, item] of Object.entries(this.backgrounds)) {
      const baseUrl = `res/city-backgrounds/city${key}/`;
      for (let i = 1; i <= item.count; i++) {
        const bg = await PIXI.Assets.load(`${baseUrl}${i}.png`);
        item.textures.push(bg);
      }
    }
  }

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
  

  createBackgroundLayers(app) {
    const cityN = this.currentBackground+1;
    const city = this.backgrounds[cityN];
    const baseScale = this.c_height / city.textures[0].height;
    if (!city) return;

    for (let i = 0; i < city.count; i++) {
      const texture = city.textures[i];

      const textureInputLength = Math.max(Math.ceil(this.c_width / (texture.width * baseScale)), 2);
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


      city.layers.push({
        container: layerContainer,
        tilingSprite,
        speed: i * 0.05,
      });
    }
  }

  updateBackgroundLayers(speed) {
    const cityN = this.currentBackground + 1;
    const city = this.backgrounds[cityN];
    if (city) {
      for (const layer of city.layers) {
        layer.tilingSprite.tilePosition.x -= speed * layer.speed; // Apply parallax speed
      }
    }
  }
}
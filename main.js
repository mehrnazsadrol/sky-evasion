(async () => {


  const backgroundButton = document.getElementById("backgroundButton");
  const canvas_container = document.getElementById("canvas-container");
  const canvas_wrapper = document.getElementById('canvas-wrapper');
  const c_width = canvas_wrapper ? canvas_wrapper.clientWidth : window.innerWidth;
  const c_height = canvas_wrapper ? canvas_wrapper.clientHeight : window.innerHeight;
  const canvas_bg_color = "0x2D336B";

  const app = new PIXI.Application();


  backgroundButton.addEventListener("click", async() => {
    console.log("showBackgroundOptions");
    canvas_container.style.display = "none";
    await showBackgroundOptions();
  });
  
  async function showBackgroundOptions() {
    await app.init({
      width: c_width,
      height: c_height,
      backgroundColor: canvas_bg_color
    });
    document.body.appendChild(app.canvas);
    app.canvas.style.position = "absolute";
    app.canvas.style.top = "50%";
    app.canvas.style.left = "50%";
    app.canvas.style.transform = "translate(-50%, -50%)";
  
    //background color
    const bgRect = new PIXI.Graphics();
    bgRect.beginFill(parseInt(canvas_bg_color));
    bgRect.drawRect(0, 0, app.renderer.width, app.renderer.height);
    bgRect.endFill();
    app.stage.addChild(bgRect);

    const textStyle = new PIXI.TextStyle({
      fontFamily: 'ubuntu-medium',
      fontSize: 40,
      fill: 0xffffff,
      align: 'center'
    });
    const text = new PIXI.Text('CHOOSE YOUR BACKGROUND', textStyle);
    text.x = (app.screen.width - text.width) / 2;
    text.y = 20;
    app.stage.addChild(text);


    const dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xFFF2DB
    });


    const startY = text.height + 10;
    //city image sizes
    const city_sprite_w = c_width*2 / 12;
    const city_sprite_h = (c_height - startY) / 3;
    const offset_x = c_width / 21;
    const offset_y = (c_height - startY) / 15;

    //loading city images 
    const basePath = 'res/city-backgrounds/city-';
    const num_cities = 8;
    const num_rows = 2;
    const citySprites = [];
    const cityRects = [];

    for (let i = 0; i < num_rows ; i++) {
      for ( let j = 0; j < num_cities/num_rows; j++) {
        const c = j+1 + i * (num_cities/num_rows);
        const imagePath = `${basePath}${c}.png`; 
        const texture = await PIXI.Assets.load(imagePath);

        const rect = new PIXI.Graphics();
        rect.beginFill(0x000000, 0);
        rect.drawRect(0, 0, city_sprite_w, city_sprite_h);
        rect.endFill();

        const citySprite = new PIXI.Sprite(texture);
        citySprite.width = city_sprite_w;
        citySprite.height = city_sprite_h;

        rect.addChild(citySprite);
        
        rect.x = j * city_sprite_w + (j+2) * offset_x;
        rect.y = startY + i * city_sprite_h + (i+2) * offset_y;

        rect.interactive = true;
        rect.buttonMode = true;

        rect.on('pointerover', () => {
          rect.filters = [dropShadowFilter];
        });

        rect.on('pointerout', () => {
          rect.filters = [];
        });
    
        rect.on('click', () => {
          const cityIndex = i * (num_cities / num_rows) + j;
          console.log(`City ${cityIndex + 1} clicked!`);
          setCityBackground(cityIndex);
        });
    

        app.stage.addChild(rect);
        citySprites.push(citySprite);
        cityRects.push(rect);
      }
    }

  }
})();

function setCityBackground(cityIndex) {
  console.log(`Setting city background ${cityIndex + 1}`);
  
}
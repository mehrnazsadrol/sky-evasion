import { BackgroundOptions } from './backgroundOptions.js';
import { ButtonManager } from './buttonManager.js';
import { Avatar } from './avatar.js';

(async () => {
  const backgroundButton = document.getElementById("backgroundButton");
  const canvas_container = document.getElementById("canvas-container");
  const canvas_wrapper = document.getElementById('canvas-wrapper');
  const c_width = canvas_wrapper ? canvas_wrapper.clientWidth : window.innerWidth;
  const c_height = canvas_wrapper ? canvas_wrapper.clientHeight : window.innerHeight;
  const canvas_bg_color = "0x2D336B";
  let game_theme = localStorage.getItem('cityIndex') ?? 0;

  const app = new PIXI.Application();
  await app.init({
    width: c_width,
    height: c_height,
    backgroundColor: canvas_bg_color,
  });

  document.body.appendChild(app.canvas);
  app.canvas.style.position = "absolute";
  app.canvas.style.top = "50%";
  app.canvas.style.left = "50%";
  app.canvas.style.transform = "translate(-50%, -50%)";

  const buttonManager = new ButtonManager(
    app,
    c_width,
    c_height,
    canvas_bg_color,
    canvas_container,
    changeCanvasBackground,
    startGame
  );

  await buttonManager.createWallpaperButton();
  await buttonManager.createStartButton();

  let avatar = null;
  async function startGame() {
    console.log("Game started");
    app.stage.removeChildren();

  }

  function changeCanvasBackground(cityIdx) {
    game_theme = cityIdx;
    localStorage.setItem('cityIndex', cityIdx);
    console.log(`Canvas background changed to city ${cityIdx + 1}`);
    if (buttonManager.backgroundOptionsContainer) {
      app.stage.removeChild(buttonManager.backgroundOptionsContainer);
      buttonManager.backgroundOptionsContainer = null;
    }
  }

  
  
})();
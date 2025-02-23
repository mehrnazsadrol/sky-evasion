import { BackgroundOptions } from './backgroundOptions.js';
import { ButtonManager } from './buttonManager.js';
import { Avatar } from './avatar.js';
import { GameController } from './gameController.js';
import { CityBackgroundManager } from './cityBackgroundManager.js';


(async () => {
  const canvas_container = document.getElementById("canvas-container");
  const canvas_wrapper = document.getElementById('canvas-wrapper');
  const c_width = canvas_wrapper ? canvas_wrapper.clientWidth : window.innerWidth;
  const c_height = canvas_wrapper ? canvas_wrapper.clientHeight : window.innerHeight;
  const canvas_bg_color = "0x2D336B";
  let game_theme = localStorage.getItem('cityIndex') ?? 0;
  let game_avatar = localStorage.getItem('avatarIndex') ?? 0;

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
    changeAvatar,
    startGame,
  );

  await buttonManager.createWallpaperButton();
  await buttonManager.createStartButton();
  await buttonManager.createCharacterChangeButton();

  async function startGame() {
    app.stage.removeChildren();
    await setupGameController();
  }

  async function setupGameController() {
    const backgroundManager = new CityBackgroundManager(c_height, c_width);
    await backgroundManager.loadAssets();
    backgroundManager.createBackgroundLayers(app);

    const avatar = new Avatar();
    await avatar.loadAssets(c_width);

    const container = new PIXI.Container();
    app.stage.addChild(container);
    let gameController = new GameController(container, backgroundManager, avatar, c_width, c_height);

    app.ticker.add(() => {
      gameController.update();
    });
  }


  function changeCanvasBackground(cityIdx) {
    game_theme = cityIdx;
    localStorage.setItem('cityIndex', cityIdx);
    if (buttonManager.OptionsContainer) {
      app.stage.removeChild(buttonManager.OptionsContainer);
      buttonManager.OptionsContainer = null;
    }
  }

  function changeAvatar(avatarIdx) {
    game_avatar = avatarIdx;
    localStorage.setItem('avatarIndex', avatarIdx);
    if (buttonManager.OptionsContainer) {
      app.stage.removeChild(buttonManager.OptionsContainer);
      buttonManager.OptionsContainer = null;
    }
  }

})();
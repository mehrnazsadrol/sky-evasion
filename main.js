import { ButtonManager } from './buttonManager.js';
import { Avatar } from './avatar.js';
import { GameController } from './gameController.js';
import { CityBackgroundManager } from './cityBackgroundManager.js';
import { GameOver } from './gameOver.js';
import { Hud } from './hud.js';
import { Assets } from './assets.js';

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
  const assets = new Assets();
  await assets.loadAssets();

  const bg_container = new PIXI.Container();
  const start_bg = assets.getTexture('first_page_background');
  const bg_sprite = new PIXI.Sprite(start_bg);
  bg_sprite.width = c_width;
  bg_sprite.height = c_height;
  bg_container.addChild(bg_sprite);
  app.stage.addChild(bg_container);
  canvas_container.style.display = "none";
  app.ticker.autoStart = false;

  document.body.appendChild(app.canvas);
  app.canvas.style.position = "absolute";
  app.canvas.style.top = "50%";
  app.canvas.style.left = "50%";
  app.canvas.style.transform = "translate(-50%, -50%)";

  const firstPageContainer = new PIXI.Container();
  const buttonManager = new ButtonManager(
    app,
    firstPageContainer,
    c_width,
    c_height,
    canvas_bg_color,
    changeCanvasBackground,
    changeAvatar,
    startGame,
    assets,
  );

  buttonManager.loadPage();
  app.stage.addChild(firstPageContainer);

  let hud;
  let gameOverContainer;
  let gameContainer;
  let gameController;
  let backgroundManager;
  let avatar;

  async function startGame() {
    app.stage.removeChildren();
    await setupGameController();
  }
  function updateGameController() {
    gameController && gameController.update();
  }
  async function setupGameController() {
    backgroundManager = new CityBackgroundManager(c_height, c_width, assets);
    backgroundManager.createBackgroundLayers(app);

    avatar = new Avatar(assets);
    await avatar.loadAnimation(c_width);

    gameContainer = new PIXI.Container();
    app.stage.addChild(gameContainer);

    hud = new Hud(gameContainer, c_width, c_height);

    gameController = new GameController(
      gameContainer,
      backgroundManager,
      avatar,
      c_width,
      c_height,
      (app.ticker.FPS || 60),
      gameOver,
      assets);

    app.ticker.add(updateGameController);
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

  function gameOver() {
    app.ticker.stop();
    app.ticker.remove(updateGameController);
    app.stage.removeChild(gameContainer);
    gameOverContainer = new PIXI.Container();
    const gameOverScreen = new GameOver(
      gameOverContainer,
      c_width,
      c_height,
      restartGame,
      hud,
      assets
    );
    gameOverScreen.init();
    app.stage.addChild(gameOverContainer);
  }
  let isRestarting = false;


  async function restartGame() {
    console.log("Restarting game...", isRestarting);
    if (isRestarting) return;
    isRestarting = true;
    app.ticker.stop();


    if (gameOverContainer) {
      app.stage.removeChild(gameOverContainer);
      gameOverContainer = null;
    }

    await resetGameController();

    app.ticker.start();
    isRestarting = false;

  }

  async function resetGameController() {
    gameContainer = new PIXI.Container();
    app.stage.addChild(gameContainer);

    hud = new Hud(gameContainer, c_width, c_height);

    gameController = new GameController(
      gameContainer,
      backgroundManager,
      avatar,
      c_width,
      c_height,
      (app.ticker.FPS || 60),
      gameOver,
      assets);

    app.ticker.add(updateGameController);
  }

})();
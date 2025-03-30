import { ButtonManager } from './buttonManager.js';
import { Avatar } from './avatar.js';
import { GameController } from './gameController.js';
import { CityBackgroundManager } from './cityBackgroundManager.js';
import { GameOver } from './gameOver.js';
import { Hud } from './hud.js';
import { Assets } from './assets.js';
import { SettingButtonManager } from './settingButtonManager.js';
import { AvatarOptions } from './avatarOptions.js';

(async () => {
  const canvas_container = document.getElementById("canvas-container");
  const canvas_wrapper = document.getElementById('canvas-wrapper');
  const c_width = canvas_wrapper ? canvas_wrapper.clientWidth : window.innerWidth;
  const c_height = canvas_wrapper ? canvas_wrapper.clientHeight : window.innerHeight;


  const app = new PIXI.Application();
  await app.init({
    width: c_width,
    height: c_height,
    backgroundColor: 0xFFFFFF,
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

  let hud;
  let gameOverContainer;
  let gameContainer;
  let gameController;
  let backgroundManager;
  let avatar;

  const firstPageContainer = new PIXI.Container();
  let settingButtonManager = new SettingButtonManager(
    c_width,
    c_height,
    loadAvatarOptionsScreen,
    assets);

  const buttonManager = new ButtonManager(
    c_width,
    c_height,
    firstPageContainer,
    settingButtonManager,
    assets,
    startGame
  );

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

    hud = new Hud(gameContainer, c_width, c_height, assets);

    gameController = new GameController(
      gameContainer,
      backgroundManager,
      avatar,
      c_width,
      c_height,
      (app.ticker.FPS || 60),
      gameOver,
      assets,
      hud);

    app.ticker.add(updateGameController);
  }

  async function gameOver() {
    app.ticker.stop();
    app.ticker.remove(updateGameController);
    app.stage.removeChild(gameContainer);
    gameOverContainer = new PIXI.Container();
    const gameOverScreen = new GameOver(
      gameOverContainer,
      settingButtonManager,
      c_width,
      c_height,
      restartGame,
      hud,
      assets
    );
    await gameOverScreen.init();
    app.stage.addChild(gameOverContainer);
    app.renderer.render(app.stage);
  }
  let isRestarting = false;


  async function restartGame() {
    if (isRestarting) return;
    isRestarting = true;
    app.ticker.stop();

    if (gameOverContainer) {
      app.stage.removeChild(gameOverContainer);
      gameOverContainer = null;
    }

    await setupGameController();

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
      assets,
      hud);

    app.ticker.add(updateGameController);
  }

  async function loadAvatarOptionsScreen() {
    const optionsContainer = new PIXI.Container();
    const avatarOptions = new AvatarOptions(
      optionsContainer,
      assets,
      this.c_width,
      this.c_height,
      changeAvatar
    );
    await avatarOptions.init();
    app.stage.addChild(optionsContainer);
    app.renderer.render(app.stage);

    function changeAvatar(avatarIdx) {
      localStorage.setItem('avatarIndex', avatarIdx);
      if (optionsContainer) {
        app.stage.removeChild(optionsContainer);
        app.renderer.render(app.stage);
      }
    }
  }

  buttonManager.loadPage();
  app.stage.addChild(firstPageContainer);
})();
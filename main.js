import { ButtonManager } from './buttonManager.js';
import { Avatar } from './avatar.js';
import { GameController } from './gameController.js';
import { CityBackgroundManager } from './cityBackgroundManager.js';
import { GameOver } from './gameOver.js';
import { Hud } from './hud.js';
import { Assets } from './assets.js';
import { SettingButtonManager } from './settingButtonManager.js';
import { AvatarOptions } from './avatarOptions.js';
import { BackgroundOptions } from './backgroundOptions.js';
import {LevelManager} from './levelManager.js';
import { HelpPage } from './helpPage.js';

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

  // Hide original canvas container
  canvas_container.style.display = "none";
  app.ticker.autoStart = false;

  document.body.appendChild(app.canvas);
  app.canvas.style.position = "absolute";
  app.canvas.style.top = "50%";
  app.canvas.style.left = "50%";
  app.canvas.style.transform = "translate(-50%, -50%)";


  // Game state variables
  let hud;
  let levelManager;
  let gameOverContainer;
  let gameContainer;
  let gameController;
  let backgroundManager;
  let avatar;
  let buttonManager;
  let settingButtonManager = new SettingButtonManager(
    c_width,
    c_height,
    canvas_bg_color,
    loadBackgroundOptionsScreen,
    loadAvatarOptionsScreen,
    loadHelpScreen,
    assets
  );

  async function loadStartPage() {
    app.stage.removeChildren();
    // Create and position background container
    const bg_container = new PIXI.Container();
    const start_bg = assets.getTexture('first_page_background');
    const bg_sprite = new PIXI.Sprite(start_bg);
    bg_sprite.width = c_width;
    bg_sprite.height = c_height;
    bg_container.addChild(bg_sprite);
    app.stage.addChild(bg_container);

    // Create main menu container and UI managers
    const firstPageContainer = new PIXI.Container();
    buttonManager = new ButtonManager(
      c_width,
      c_height,
      firstPageContainer,
      settingButtonManager,
      assets,
      startGame
    );

    buttonManager.loadPage();
    app.stage.addChild(firstPageContainer);
  }

  /**
   * Start the main game
   */
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
    levelManager = new LevelManager(assets, (app.ticker.FPS || 60), c_width);

    gameController = new GameController(
      gameContainer,
      backgroundManager,
      avatar,
      c_width,
      c_height,
      (app.ticker.FPS || 60),
      gameOver,
      assets,
      hud,
      levelManager);

    app.ticker.add(updateGameController);
  }

  async function gameOver() {
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
      assets, 
      exitGameOver
    );
    await gameOverScreen.init();
    app.stage.addChild(gameOverContainer);
    app.renderer.render(app.stage);
  }

  /**
   * Exits the game over screen and returns to the start page
   */
  async function exitGameOver() {
    app.ticker.stop();
    if (gameOverContainer) {
      app.stage.removeChild(gameOverContainer);
      gameOverContainer = null;
    }

    app.ticker.remove(updateGameController);
    await loadStartPage();
    app.ticker.start();
  }

  // Flag to prevent multiple restart attempts
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

  /**
   * Loads game help screen
   */
  async function loadHelpScreen() {
    buttonManager.disableStartButton();
    const helpContainer = new PIXI.Container();
    const helpPage = new HelpPage(
      helpContainer,
      assets,
      c_width,
      c_height,
      closeHelpPage
    );
    await helpPage.init();
    app.stage.addChild(helpContainer);
    app.renderer.render(app.stage);

    function closeHelpPage() {
      if (helpContainer) {
        app.stage.removeChild(helpContainer);
        buttonManager.enableStartButton();
        app.renderer.render(app.stage);
      }
    }
  }

  async function loadAvatarOptionsScreen() {
    buttonManager.disableStartButton();
    const optionsContainer = new PIXI.Container();
    const avatarOptions = new AvatarOptions(
      optionsContainer,
      assets,
      this.c_width,
      this.c_height,
      this.canvas_bg_color,
      changeAvatar
    );
    await avatarOptions.init();
    app.stage.addChild(optionsContainer);
    app.renderer.render(app.stage);

    function changeAvatar(avatarIdx) {
      game_avatar = avatarIdx;
      localStorage.setItem('avatarIndex', avatarIdx);
      if (optionsContainer) {
        app.stage.removeChild(optionsContainer);
        buttonManager.enableStartButton();
        app.renderer.render(app.stage);
      }
    }
  }

  async function loadBackgroundOptionsScreen() {
    const optionsContainer = new PIXI.Container();
    const backgroundOptions = new BackgroundOptions(
      optionsContainer,
      assets,
      this.c_width,
      this.c_height,
      this.canvas_bg_color,
      changeCanvasBackground
    );
    backgroundOptions.init();
    app.stage.addChild(optionsContainer);
    app.renderer.render(app.stage);

    function changeCanvasBackground(cityIdx) {
      game_theme = cityIdx;
      localStorage.setItem('cityIndex', cityIdx);
      if (optionsContainer) {
        app.stage.removeChild(optionsContainer);
        app.renderer.render(app.stage);
      }
    }
  }
  loadStartPage();
})();
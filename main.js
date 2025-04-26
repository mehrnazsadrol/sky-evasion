/**
 * @file main.js
 * @description Main entry point for the game application. Handles initialization of game assets,
 *  states, i.e start screen, game play, and game over.
 * @module main
 *
 * 
 * Called By: Browser
 * Calls: 
 *    - ButtonManager, Avatar, GameController, CityBackgroundManager, GameOver, Hud, 
 *    - Assets, SettingButtonManager, AvatarOptions, BackgroundOptions, LevelManager, HelpPage
 */
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
import { LevelManager } from './levelManager.js';
import { HelpPage } from './helpPage.js';
import { SoundManager } from './soundManager.js';
import { SoundSetting } from './soundSetting.js';

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

  // Hide original canvas container and configure PIXI canvas
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

  const soundManager = new SoundManager(assets);

  let settingButtonManager = new SettingButtonManager(
    c_width,
    c_height,
    loadBackgroundOptionsScreen,
    loadAvatarOptionsScreen,
    loadHelpScreen,
    loadSoundSettingScreen,
    assets,
    () => soundManager.playButtonClick(),
  );

  /**
   * @function loadStartPage
   * @description Loads and displays the game's start screen
   * @async
   */
  async function loadStartPage() {
    app.stage.removeChildren();
    if (!soundManager.getIsMainPlaying())
      soundManager.playMainMusic();
    const bg_container = new PIXI.Container();
    const start_bg = assets.getTexture('first_page_background');
    const bg_sprite = new PIXI.Sprite(start_bg);
    bg_sprite.width = c_width;
    bg_sprite.height = c_height;
    bg_container.addChild(bg_sprite);
    app.stage.addChild(bg_container);

    const firstPageContainer = new PIXI.Container();
    settingButtonManager.resetButtonPosition();
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
   * @function startGame
   * @description Starts the game by setting up the game controller
   * @async
   */
  async function startGame() {
    app.stage.removeChildren();
    await setupGameController();
  }

  /**
   * @function updateGameController
   * @description Update function called by PIXI ticker to update game frames
   */
  function updateGameController() {
    gameController && gameController.update();
  }

  /**
   * @function setupGameController
   * @description Initializes all game components
   * @async
   */
  async function setupGameController() {
    backgroundManager = new CityBackgroundManager(c_height, c_width, assets);
    backgroundManager.createBackgroundLayers(app);
    soundManager.playGameMusic();

    // Load avatar animations
    avatar = new Avatar(assets);
    await avatar.loadAnimation(c_width);

    // Create main game container
    gameContainer = new PIXI.Container();
    app.stage.addChild(gameContainer);

    // Initialize HUD and level manager
    hud = new Hud(gameContainer, c_width, c_height, assets, soundManager);
    levelManager = new LevelManager(assets, (app.ticker.FPS || 60), c_width);

    // Create game controller
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

    // Start the game loop
    app.ticker.add(updateGameController);
  }

  /**
   * @function gameOver
   * @description Initialize game over screen
   * @async
   */
  async function gameOver(isGameOver) {
    app.ticker.stop();
    app.ticker.remove(updateGameController);
    app.stage.removeChild(gameContainer);
    soundManager.playMainMusic();

    gameOverContainer = new PIXI.Container();
    const gameOverScreen = new GameOver(
      gameOverContainer,
      c_width,
      c_height,
      restartGame,
      hud,
      assets,
      exitGameOver,
      () => soundManager.playButtonClick(),
      isGameOver,
    );
    await gameOverScreen.init();
    app.stage.addChild(gameOverContainer);
    app.renderer.render(app.stage);
  }

  /**
   * @function exitGameOver
   * @description Exits the game over screen and returns to the start page
   * @async
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

  /**
   * @function restartGame
   * @description Restarts the game by stopping the ticker and reinitializing game components
   * @async
   */
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
   * @function loadHelpScreen
   * @description Loads and displays the help screen
   * @async
   */
  async function loadHelpScreen() {
    buttonManager.disableMainButtons();
    const helpContainer = new PIXI.Container();
    const helpPage = new HelpPage(
      helpContainer,
      assets,
      c_width,
      c_height,
      closeHelpPage,
      () => soundManager.playButtonClick(),
    );
    await helpPage.init();
    app.stage.addChild(helpContainer);
    app.renderer.render(app.stage);

    /**
     * @function closeHelpPage
     * @description Closes the help screen and returns to start page
     */
    function closeHelpPage() {
      if (helpContainer) {
        app.stage.removeChild(helpContainer);
        buttonManager.enableMainButtons();
        app.renderer.render(app.stage);
      }
    }
  }

  /**
   * @function loadAvatarOptionsScreen
   * @description Loads and displays the avatar selection screen
   * @async
   */
  async function loadAvatarOptionsScreen() {
    buttonManager.disableMainButtons();
    const optionsContainer = new PIXI.Container();
    const avatarOptions = new AvatarOptions(
      optionsContainer,
      assets,
      this.c_width,
      this.c_height,
      changeAvatar,
      () => soundManager.playButtonClick(),
    );
    await avatarOptions.init();
    app.stage.addChild(optionsContainer);
    app.renderer.render(app.stage);

    /**
     * @function changeAvatar
     * @description Handles avatar selection change
     * @param {number} avatarIdx - Index of the selected avatar
     */
    function changeAvatar(avatarIdx) {
      game_avatar = avatarIdx;
      localStorage.setItem('avatarIndex', avatarIdx);
      if (optionsContainer) {
        app.stage.removeChild(optionsContainer);
        buttonManager.enableMainButtons();
        app.renderer.render(app.stage);
      }
    }
  }

  /**
   * @function loadBackgroundOptionsScreen
   * @description Loads and displays the background selection screen
   * @async
   */
  async function loadBackgroundOptionsScreen() {
    buttonManager.disableMainButtons();
    const optionsContainer = new PIXI.Container();
    const backgroundOptions = new BackgroundOptions(
      optionsContainer,
      assets,
      this.c_width,
      this.c_height,
      canvas_bg_color,
      changeCanvasBackground,
      () => soundManager.playButtonClick(),
    );
    backgroundOptions.init();
    app.stage.addChild(optionsContainer);
    app.renderer.render(app.stage);

    /**
     * @function changeCanvasBackground
     * @description Handles background selection change
     * @param {number} cityIdx - Index of the selected background
     */
    function changeCanvasBackground(cityIdx) {
      game_theme = cityIdx;
      localStorage.setItem('cityIndex', cityIdx);
      if (optionsContainer) {
        app.stage.removeChild(optionsContainer);
        buttonManager.enableMainButtons();
        app.renderer.render(app.stage);
      }
    }
  }

    /**
   * @function loadSoundSettingScreen
   * @description Loads and displays the sound setting screen
   * @async
   */
    async function loadSoundSettingScreen() {
      buttonManager.disableMainButtons();
      const settingContainer = new PIXI.Container();
      const setting = new SoundSetting(
        settingContainer,
        assets,
        soundManager,
        this.c_width,
        this.c_height,
        onCloseSetting,
      );
      await setting.init();
      app.stage.addChild(settingContainer);
      app.renderer.render(app.stage);
  
      /**
       * @function changeAvatar
       * @description Handles audio setting page close
       */
      function onCloseSetting() {
        if (settingContainer) {
          app.stage.removeChild(settingContainer);
          buttonManager.enableMainButtons();
          app.renderer.render(app.stage);
        }
      }
    }

  // Start the game by loading the start page
  loadStartPage();
})();
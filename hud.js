/**
 * @file Hud.js
 * @description Manages the HUD (Heads-Up Display) for the game, including score, lives, and animations.
 * 
 * Called By: GameController
 * Calls: Assets manager for textures and styles
 */
export class Hud {
  /**
   * @constructor
   * @description Initializes the HUD with specified parameters.
   * @param {PIXI.Container} container - Parent container for the HUD
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height
   * @param {Assets} assets - Game assets manager
   * @param {SoundManager} soundManager - Sound manager for playing sounds
   */
  constructor(container, c_width, c_height, assets, soundManager) {
    this.container = container;
    this.c_width = c_width;
    this.c_height = c_height;
    this.score = 0;
    this.lives = 2;
    this.assets = assets;
    this.soundManager = soundManager;
    this.bannerHeight = 60;
    this.highestScore = Number(localStorage.getItem("highestScore")) || 0;
    this.textColor = this.assets.getScoreTextColor();

    this.animationQueue = [];
    this.currentAnimation = null;
    this.animationPriorities = {
      lostLife: 2,
      levelText: 5,
      autoRunTimer: 10
    };
    this.levelTextSpeedFactor = 1;
    this.hasShownVictory = false;

    this.hudContainer = new PIXI.Container();
    this.animationContainer = new PIXI.Container();

    this.scoreText = new PIXI.Text("SCORE: 0", {
      fontFamily: "RoadRage",
      fontSize: 30,
      fill: this.textColor,
      align: "left",
      stroke: 0x000000,
      strokeThickness: 1
    });

    this._setupHud();
    this.showLevelText(1);
  }

  /**
   * @method _setupHud
   * @description Sets up the HUD background element.
   */
  _setupHud() {
    const hudBar = new PIXI.Graphics()
      .rect(0, 0, this.c_width, this.bannerHeight)
      .fill({ color: 0xFAF1E6, alpha: 0.6 });

    this.scoreText.x = 20;
    this.scoreText.y = 15;

    this.hudContainer.addChild(hudBar);
    this.hudContainer.addChild(this.scoreText);
    this._setupLivesText();


    this.container.addChild(this.hudContainer);
    this.container.addChild(this.animationContainer);
  }

  /**
   * @method _setupLivesText
   * @description Sets up the lives #x♥ element in the HUD.
   * */
  _setupLivesText() {
    this.livesContainer = new PIXI.Container();
    const fillColor = 0xF30067;
    const strokeColor = 0x7C203A;

    this.livesNumber = new PIXI.Text(this.lives.toString(), {
      fontFamily: "Chewy",
      fontSize: 28,
      fill: fillColor,
      stroke: strokeColor,
      strokeThickness: 2
    });

    // × symbol (5px smaller)
    this.livesMultiplier = new PIXI.Text("×", {
      fontFamily: "Chewy",
      fontSize: 23,
      fill: fillColor,
      stroke: strokeColor,
      strokeThickness: 2
    });

    this.livesHeart = new PIXI.Text("♥", {
      fontFamily: "Chewy",
      fontSize: 28,
      fill: fillColor,
      stroke: strokeColor,
      strokeThickness: 2
    });

    this.livesMultiplier.x = this.livesNumber.width + 5;
    this.livesHeart.x = this.livesMultiplier.x + this.livesMultiplier.width + 3;

    this.livesContainer.addChild(this.livesNumber);
    this.livesContainer.addChild(this.livesMultiplier);
    this.livesContainer.addChild(this.livesHeart);

    this.livesContainer.x = this.c_width - 20 - this.livesContainer.width;
    this.livesContainer.y = 15;

    this.hudContainer.addChild(this.livesContainer);
  }

  /**
   * @method showLevelText
   * @description Displays the level text animation.
   * @param {number} level - The current game level
   */
  showLevelText(level) {
    const animationTask = {
      priority: this.animationPriorities.levelText,
      execute: (completeCallback) => {
        this._executeTextAnimation(new PIXI.Text(`LEVEL ${level}`, {
          fontFamily: "BungeeSpice",
          fontSize: 30,
          align: "center",
          stroke: 0x000000,
          strokeThickness: 5,
        }), completeCallback);
      }
    };

    this._queueAnimation(animationTask);
  }

  /**
   * @method showAutoRunTimer
   * @description Displays the countdown timer for auto-run.
   * @param {number} autoRunDuration - Duration of the auto-run in milliseconds
   */
  showAutoRunTimer(autoRunDuration) {
    const animationTask = {
      priority: this.animationPriorities.autoRunTimer,
      execute: (completeCallback) => {
        this._executeAutoRunTimerAnimation(autoRunDuration, completeCallback);
      }
    };

    this._queueAnimation(animationTask);
  }
  /**
   * @method _queueAnimation
   * @description Manages and queues an animation task based on its priority.
   * @param {Object} animationTask - The animation task to queue
   */
  _queueAnimation(animationTask) {
    if (animationTask.priority === this.animationPriorities.lostLife &&
      this.currentAnimation?.priority === this.animationPriorities.lostLife) {
      return;
    }

    if (this.currentAnimation?.priority === this.animationPriorities.lostLife &&
      animationTask.priority === this.animationPriorities.lostLife) {
      this.animationQueue = this.animationQueue.filter(
        task => task.priority !== this.animationPriorities.lostLife
      );
    }


    this.animationQueue.push(animationTask);
    this.animationQueue.sort((a, b) => b.priority - a.priority);

    if (!this.currentAnimation) {
      this._processNextAnimation();
    } else if (animationTask.priority > this.currentAnimation.priority) {
      this._speedUpCurrentAnimation();
      this.animationQueue.filter(task => task !== this.animationPriorities.lostLife);
    }
  }

  /**
   * @method _processNextAnimation
   * @description Processes the next animation in the queue.
   */
  _processNextAnimation() {
    if (this.animationQueue.length === 0) {
      this.currentAnimation = null;
      return;
    }

    const nextAnimation = this.animationQueue.shift();
    this.currentAnimation = nextAnimation;

    nextAnimation.execute(() => {
      this.currentAnimation = null;
      this._processNextAnimation();
    });
  }

  /**
   * @method _speedUpCurrentAnimation
   * @description Speeds up the current animation if it exists.
   */
  _speedUpCurrentAnimation() {
    if (this.currentLevelAnimation) {
      this.levelTextSpeedFactor = 4;
    }
  }

  /**
   * @method _executeTextAnimation
   * @description Executes the text animation for level or countdown.
   * @param {PIXI.Text} textToDisplay - The text to display
   * @param {function} completeCallback - Callback function to call when animation is complete
   */
  _executeTextAnimation(textToDisplay, completeCallback) {
    if (this.currentLevelAnimation) {
      this.animationContainer.removeChild(this.currentLevelAnimation);
    }

    const levelText = textToDisplay;

    levelText.anchor.set(0.5);
    levelText.x = this.c_width / 2;
    levelText.y = this.bannerHeight / 2;
    levelText.alpha = 0;
    levelText.scale.set(0.1);

    this.animationContainer.addChild(levelText);
    this.currentLevelAnimation = levelText;

    const animationDuration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (animationDuration / this.levelTextSpeedFactor), 1);

      if (progress < 0.3) {
        const growProgress = progress / 0.3;
        levelText.alpha = growProgress;
        levelText.scale.set(0.1 + (growProgress * 0.9));
      } else if (progress < 0.7) {
        levelText.scale.set(1);
        levelText.alpha = 1;
      } else {
        const moveProgress = (progress - 0.7) / 0.3;
        levelText.y = this.bannerHeight / 2 - (moveProgress * 200);
        levelText.alpha = 1 - moveProgress;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animationContainer.removeChild(levelText);
        this.currentLevelAnimation = null;
        this.levelTextSpeedFactor = 1;
        completeCallback();
      }
    };

    animate();
  }

  /**
   * @method _executeAutoRunTimerAnimation
   * @description Executes the countdown timer animation for auto-run.
   * @param {number} autoRunDuration 
   * @param {function} completeCallback 
   */
  _executeAutoRunTimerAnimation(autoRunDuration, completeCallback) {
    if (this.currentTimerAnimations) {
      this.currentTimerAnimations.forEach(anim => {
        if (anim && anim.parent) {
          this.animationContainer.removeChild(anim);
        }
      });
    }

    const totalSeconds = Math.ceil(autoRunDuration / 1000) + 1;
    this.currentTimerAnimations = [];
    this.soundManager.playCountdown();

    let completedCount = 0;
    const checkCompletion = () => {
      completedCount++;
      if (completedCount === totalSeconds) {
        completeCallback();
      }
    };

    for (let i = 0; i < totalSeconds; i++) {
      const timerText = new PIXI.Text((totalSeconds - i - 1).toString(), {
        fontFamily: "BungeeSpice",
        fontSize: 36,
        fill: 0xFFD700,
        align: "center",
        stroke: 0x8B4513,
        strokeThickness: 5
      });

      timerText.anchor.set(0.5);
      timerText.x = this.c_width / 2;
      timerText.y = this.bannerHeight / 2;
      timerText.alpha = 0;
      timerText.scale.set(0.1);

      this.animationContainer.addChild(timerText);
      this.currentTimerAnimations.push(timerText);

      setTimeout(() => {
        this._animateTimerText(timerText, (i + 1) === totalSeconds, checkCompletion);
      }, i * 1000);
    }
  }

  /**
   * @method _animateTimerText
   * @description Animates the countdown timer text.
   * @param {PIXI.Text} timerText - The timer text to animate
   * @param {boolean} isLast - Flag to indicate if this is the last timer text
   * @param {function} completionCallback - Callback function to call when animation is complete
   */
  _animateTimerText(timerText, isLast, completionCallback) {
    const animationDuration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      if (isLast)
        timerText.text = "GO!";
      if (progress < 0.3) {
        const growProgress = progress / 0.3;
        timerText.alpha = growProgress;
        timerText.scale.set(0.1 + (growProgress * 0.9));
      } else if (progress < 0.7) {
        timerText.scale.set(1);
        timerText.alpha = 1;
      } else {
        const shrinkProgress = (progress - 0.7) / 0.3;
        timerText.scale.set(1 - (shrinkProgress * 0.9));
        timerText.alpha = 1 - shrinkProgress;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (timerText.parent) {
          this.animationContainer.removeChild(timerText);
        }
        this.currentTimerAnimations = this.currentTimerAnimations?.filter(t => t !== timerText);
        completionCallback();
      }
    };

    animate();
  }

  /**
   * @method _updateLifeText
   * @description Updates the lives text in the HUD.
   */
  _updateLifeText() {
    this.livesNumber.text = this.lives.toString();
    this.livesMultiplier.x = this.livesNumber.width + 5;
    this.livesHeart.x = this.livesMultiplier.x + this.livesMultiplier.width + 5;
  }

  /**
   * @method addScore
   * @description Adds a score to the current score and updates the score text.
   * @param {number} score - The score to add
   */
  addScore(score) {
    this.score += score;
    this.scoreText.text = `SCORE: ${this.score}`;
    if (this.score > this.highestScore) {
      this.updateHighestScore(this.score);
    }
  }

  /**
   * @method _showWonTheGame
   * @description Displays the victory message when the game is won.
   */
  showWonTheGame() {
    if (this.hasShownVictory) return;
    this.hasShownVictory = true;

    this.animationQueue = [];
    if (this.currentAnimation) {
      this.currentAnimation = null;
    }
    if (this.currentLevelAnimation && this.currentLevelAnimation.parent) {
      this.animationContainer.removeChild(this.currentLevelAnimation);
    }
    if (this.currentTimerAnimations) {
      this.currentTimerAnimations.forEach(anim => {
        if (anim && anim.parent) {
          this.animationContainer.removeChild(anim);
        }
      });
      this.currentTimerAnimations = null;
    }

    const victoryContainer = new PIXI.Container();
    victoryContainer.alpha = 0;
    victoryContainer.scale.set(0);
    victoryContainer.x = this.c_width / 2;
    victoryContainer.y = this.c_height / 4;

    const congratsText = new PIXI.Text("CONGRATULATIONS!!!", {
      fontFamily: "BungeeSpice",
      fontSize: 48,
      fill: 0xFFD700,
      align: "center",
      stroke: 0x8B0000,
      strokeThickness: 8,
    });
    congratsText.anchor.set(0.5, 0);
    congratsText.y = 0;


    const escapedText = new PIXI.Text("You escaped the invaded city!", {
      fontFamily: "BungeeSpice",
      fontSize: 36,
      fill: 0xFFD700,
      align: "center",
      stroke: 0x8B0000,
      strokeThickness: 6,
    });
    escapedText.anchor.set(0.5, 0);
    escapedText.y = congratsText.height + 20;

    victoryContainer.addChild(congratsText);
    victoryContainer.addChild(escapedText);
    this.animationContainer.addChild(victoryContainer);


    const animationDuration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      if (progress < 0.3) {
        const growProgress = progress / 0.3;
        victoryContainer.alpha = growProgress;
        victoryContainer.scale.set(growProgress * 1.5);
      } else if (progress < 0.6) {
        const bounceProgress = (progress - 0.3) / 0.3;
        victoryContainer.scale.set(1.5 - (bounceProgress * 0.5));
      } else if (progress < 0.8) {
        victoryContainer.scale.set(1);
        victoryContainer.alpha = 1;
      } else {
        const glowProgress = (progress - 0.8) / 0.2;
        victoryContainer.scale.set(1 + glowProgress * 0.1);
        victoryContainer.tint = interpolateColor(0xFFD700, 0xFFFFFF, glowProgress);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        victoryContainer.scale.set(1);
        victoryContainer.tint = 0xFFFFFF;
      }
    };

    function interpolateColor(color1, color2, ratio) {
      const r1 = (color1 >> 16) & 0xFF;
      const g1 = (color1 >> 8) & 0xFF;
      const b1 = color1 & 0xFF;

      const r2 = (color2 >> 16) & 0xFF;
      const g2 = (color2 >> 8) & 0xFF;
      const b2 = color2 & 0xFF;

      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);

      return (r << 16) | (g << 8) | b;
    }

    animate();
  }

  /**
   * @method updateLife
   * @description Updates the lives count and displays an animation.
   * @param {number} value - The value to add to the current lives
   */
  updateLife(value) {
    if (this.lives + value > 0) {
      this.lives += value;
      this._updateLifeText();

      const animationTask = {
        priority: this.animationPriorities.lostLife,
        execute: (completeCallback) => {
          this._executeTextAnimation(new PIXI.Text("LIFE LOST!", {
            fontFamily: "RoadRage",
            fontSize: 30,
            align: "center",
            stroke: 0x000000,
            strokeThickness: 3,
            fill: 0xFF0000
          }), completeCallback);
        }
      };

      this._queueAnimation(animationTask);
      return true;
    }
    return false;
  }

  /**
   * @method drawScore
   * @description draws the current score on the HUD.
   */
  drawScore() {
    this.scoreText.text = `Score: ${this.score}`;
  }

  /**
   * @method getScore
   * @description Returns the current score.
   * @returns {number} - The current score
   */
  getScore() {
    return this.score;
  }

  /**
   * @method updateHighestScore
   * @description updates the highest score in local storage.
   */
  updateHighestScore(score) {
    this.highestScore = score;
    localStorage.setItem("highestScore", this.highestScore.toString());
  }
  /**
   * @method getHighestScore
   * @returns {number} - The highest score
   */
  getHighestScore() {
    return this.highestScore;
  }

}
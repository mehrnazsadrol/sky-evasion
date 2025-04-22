export class Hud {
  constructor(container, c_width, c_height, assets) {
    this.container = container;
    this.c_width = c_width;
    this.c_height = c_height;
    this.score = 0;
    this.lives = 20;
    this.assets = assets;
    this.bannerHeight = 60;

    this.highestScore = Number(localStorage.getItem("highestScore")) || 0;
    this.textColor = this.assets.getScoreTextColor();

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

  _setupHud() {
    const hudBar = new PIXI.Graphics();
    hudBar.beginFill(0xFAF1E6, 0.6);
    hudBar.drawRect(0, 0, this.c_width, this.bannerHeight);
    hudBar.endFill();

    this.scoreText.x = 20;
    this.scoreText.y = 15;

    this.hudContainer.addChild(hudBar);
    this.hudContainer.addChild(this.scoreText);
    this._setupLivesText();


    this.container.addChild(this.hudContainer);
    this.container.addChild(this.animationContainer);
  }

  updateLife(value) {
    if (this.lives + value > 0) {
      this.lives += value;
      this._updateLifeText();
      // this._showFloatingText("LIFE LOST!", 0xFF0000, this.c_width / 2, this.c_height / 2, 42);
      return true;
    }
    return false;
  }

  _setupLivesText() {
    // Create a container for the lives elements
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

    this.livesContainer.x = this.c_width - 20 - this.livesContainer.width ;
    this.livesContainer.y = 15;

    this.hudContainer.addChild(this.livesContainer);
  }


  _updateLifeText() {
    this.livesNumber.text = this.lives.toString();
    this.livesMultiplier.x = this.livesNumber.width + 5;
    this.livesHeart.x = this.livesMultiplier.x + this.livesMultiplier.width + 5;
  }

  addScore(score) {
    this.score += score;
    this.scoreText.text = `SCORE: ${this.score}`;
    // this._showFloatingText(`+${score}`, 0x00FF00, this.c_width / 2, this.c_height / 2, 36);

    if (this.score > this.highestScore) {
      this.updateHighestScore(this.score);
    }
  }

  showAutoRunTimer(autoRunDuration) {
    // Clear any existing timer animations
    if (this.currentTimerAnimations) {
      this.currentTimerAnimations.forEach(anim => {
        if (anim && anim.parent) {
          this.animationContainer.removeChild(anim);
        }
      });
    }
    
    // Convert milliseconds to seconds
    const totalSeconds = Math.ceil(autoRunDuration / 1000);
    this.currentTimerAnimations = [];
    
    // Create and animate each second's display
    for (let i = 0; i < totalSeconds; i++) {
      const timerText = new PIXI.Text((totalSeconds - i).toString(), {
        fontFamily: "BungeeSpice",
        fontSize: 36,
        fill: 0xFFD700, // Gold color
        align: "center",
        stroke: 0x8B4513, // Brown stroke
        strokeThickness: 5
      });
      
      timerText.anchor.set(0.5);
      timerText.x = this.c_width / 2;
      timerText.y = this.bannerHeight / 2;
      timerText.alpha = 0;
      timerText.scale.set(0.1);
      
      this.animationContainer.addChild(timerText);
      this.currentTimerAnimations.push(timerText);
      
      // Schedule each animation to start at the appropriate time
      setTimeout(() => {
        this._animateTimerText(timerText, i === totalSeconds - 1);
      }, i * 1000); // Stagger animations by 1 second
    }
  }
  
  _animateTimerText(timerText, isLast) {
    const animationDuration = 1000; // 1 second per number
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      if (progress < 0.3) {
        // Grow in
        const growProgress = progress / 0.3;
        timerText.alpha = growProgress;
        timerText.scale.set(0.1 + (growProgress * 0.9));
      } else if (progress < 0.7) {
        // Hold at full size
        timerText.scale.set(1);
        timerText.alpha = 1;
      } else {
        // Shrink out
        const shrinkProgress = (progress - 0.7) / 0.3;
        timerText.scale.set(1 - (shrinkProgress * 0.9));
        timerText.alpha = 1 - shrinkProgress;
        
        // On last number, optionally show "GO!" or similar
        if (isLast && progress > 0.9) {
          timerText.text = "GO!";
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (timerText.parent) {
          this.animationContainer.removeChild(timerText);
        }
        // Remove from current animations array
        this.currentTimerAnimations = this.currentTimerAnimations.filter(t => t !== timerText);
      }
    };
    
    animate();
  }

  showLevelText(level) {
    if (this.currentLevelAnimation) {
      this.animationContainer.removeChild(this.currentLevelAnimation);
    }

    const levelText = new PIXI.Text(`LEVEL ${level}`, {
      fontFamily: "BungeeSpice",
      fontSize: 30, 
      align: "center",
      stroke: 0x000000,
      strokeThickness: 5,
    });

    levelText.anchor.set(0.5);
    levelText.x = this.c_width / 2;
    levelText.y = this.bannerHeight / 2 ;
    levelText.alpha = 0;
    levelText.scale.set(0.1);

    this.animationContainer.addChild(levelText);
    this.currentLevelAnimation = levelText;

    const animationDuration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

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
      }
    };

    animate();
  }

  _showFloatingText(text, color, x, y, fontSize = 36) {
    let fontFamily = "RoadRage"; 
    if (text.startsWith("+")) fontFamily = "Chewy";
    if (text.startsWith("LEVEL")) fontFamily = "Nabla";

    const floatingText = new PIXI.Text(text, {
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: color,
      align: "center",
      stroke: 0x000000,
      strokeThickness: 3
    });

    floatingText.anchor.set(0.5);
    floatingText.x = x;
    floatingText.y = y;
    floatingText.alpha = 1;
    
    this.animationContainer.addChild(floatingText);

    const animate = () => {
      floatingText.y -= 1.5;
      floatingText.alpha -= 0.015;
      
      if (floatingText.alpha <= 0) {
        this.animationContainer.removeChild(floatingText);
      } else {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  drawScore() {
    this.scoreText.text = `Score: ${this.score}`;
  }

  getScore() {
    return this.score;
  }

  updateHighestScore(score) {
    this.highestScore = score;
    localStorage.setItem("highestScore", this.highestScore.toString());
  }

  getHighestScore() {
    return this.highestScore;
  }
  
}
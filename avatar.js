export class Avatar {


  constructor() {
    this.state = {
      idle: false,
      walk: false,
      run: false,
      jump: false,
      dead: false
    };
    this.animations = {
      idle: null,
      walk: null,
      run: null,
      jump: null,
      dead: null,
    };
  };

  async loadAssets(c_width) {
    const baseUrls = {
      idle: {
        url: "res/girl-character/Idle (",
        count: 16,
      },
      walk: {
        url: "res/girl-character/Walk (",
        count: 20,
      },
      run: {
        url: "res/girl-character/Run (",
        count: 20,
      },
      jump: {
        url: "res/girl-character/Jump (",
        count: 30,
      },
      dead: {
        url: "res/girl-character/Dead (",
        count: 30
      },
    };
    for (const [key, value] of Object.entries(baseUrls)) {
      const textures = [];
      let aspecRatio = 0;
      for (let i = 1; i <= value.count; i++) {
        const texture = await PIXI.Assets.load(`${value.url}${i}).png`);
        textures.push(texture);
        if (i === 1) {
          aspecRatio = texture.width / texture.height;
        }
      }
      this.animations[key] = new PIXI.AnimatedSprite(textures);
      this.animations[key].animationSpeed = 0.25;
      this.animations[key].loop = true;
      this.animations[key].width = c_width / 10;
      this.animations[key].height = c_width / 10 * aspecRatio;
      console.log(this.animations[key].width, this.animations[key].height);
    }
  }

  playIdle() {
    this.stopAllAnimations();
    this.animations.idle.play();
    this.state.idle = true;
  }

  playWalk() {
    this.stopAllAnimations();
    this.animations.walk.play();
    this.state.walk = true;
  }

  playRun() {
    this.stopAllAnimations();
    this.animations.run.play();
    this.state.run = true;
  }

  playJump() {
    this.stopAllAnimations();
    this.animations.jump.play();
    this.state.jump = true;
  }

  stopAllAnimations() {
    for (const animation of Object.values(this.animations)) {
      if (animation) {
        animation.stop();
      }
    }
  }

  addToStage(stage ) {
    for (const [key, animation] of Object.entries(this.animations)) {
      if (animation) {
        stage.addChild(animation);
        animation.visible = false;
      }
    }
    this.animations.run.visible = true;
  }
}

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
    this.activeAnimation = null;
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
      this.animations[key].animationSpeed = (key === "idle") ? 0.25 : 1;
      this.animations[key].loop = true;
      this.animations[key].width = c_width / 10;
      this.animations[key].height = c_width / 10 * aspecRatio;


    }
  }

  addToStage(container, x, y) {
    for (const animation of Object.values(this.animations)) {
      if (animation) {
        container.addChild(animation);
        animation.visible = false;
        animation.x = x;
        animation.y = y;
      }
    }

    this.activeAnimation = this.animations.idle;
    this.activeAnimation.visible = true;
    this.activeAnimation.play();
  }

  playAnimation(animationKey) {
    if (this.activeAnimation) {
      this.activeAnimation.visible = false;
      this.activeAnimation.stop();
    }
    this.activeAnimation = this.animations[animationKey];
    this.activeAnimation.visible = true;
    this.activeAnimation.play();
  }


  playIdle() {
    this.playAnimation("idle");
  }

  playWalk() {
    this.playAnimation("walk");
  }

  playRun() {
    this.playAnimation("run");
  }

  playJump() {
    this.playAnimation("jump");
  }

  getAvatarHeight() {
    return this.animations.idle.height;
  }
}

/**
 * @file AvatarOptions.js
 * @description Handles the avatar selection screen 
 * 
 * Called By: Main
 * Calls: Assets manager for textures and styles
 */
export class AvatarOptions {
  /**
   * @constructor
   * @description Initializes the avatar selection screen
   * @param {PIXI.Container} container - Parent container for UI elements
   * @param {Assets} assets - Game assets manager
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height
   * @param {function} onAvatarSelected - Callback when avatar is selected
   */
  constructor(container, assets, c_width, c_height, onAvatarSelected) {
    this.container = container;
    this.assets = assets;
    this.c_width = c_width;
    this.c_height = c_height;
    this.avatarSprites = [];
    this.avatarRects = [];
    this.onAvatarSelected = onAvatarSelected;
    this.textColor = this.assets.getThemeTextColor();
  }

  /**
   * @async
   * @method init
   * @description Initializes and builds the avatar selection screen
   */
  async init() {
    this._setupBackground();
    this._setupText();
    await this._setupAvatarOptions();
  }

  /**
   * @private
   * @method _setupBackground
   * @description Creates and positions the background elements
   */
  _setupBackground() {
    const bg = this.assets.getTexture('help_background');
    const bg_sprite = new PIXI.Sprite(bg);

    const targetWidth = this.c_width;
    const targetHeight = this.c_height;
    const textureRatio = bg.width / bg.height;
    const targetRatio = targetWidth / targetHeight;

    let scale, offsetX = 0, offsetY = 0;

    if (textureRatio > targetRatio) {
      scale = targetHeight / bg.height;
      offsetX = (bg.width * scale - targetWidth) / 2;
    } else {
      scale = targetWidth / bg.width;
      offsetY = (bg.height * scale - targetHeight) / 2;
    }

    bg_sprite.width = bg.width * scale;
    bg_sprite.height = bg.height * scale;

    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(0, 0, targetWidth, targetHeight);
    mask.endFill();
    this.container.addChild(mask);
    bg_sprite.mask = mask;

    bg_sprite.x = -offsetX;
    bg_sprite.y = -offsetY;
    this.container.addChild(bg_sprite);

    const rect = new PIXI.Graphics();
    rect.beginFill(0xFDF1DB, 0.5);
    rect.drawRect(this.c_width * 0.1, this.c_height * 0.1, this.c_width * 0.8, this.c_height * 0.8);
    rect.endFill();
    this.container.addChild(rect);
  }

  /**
   * @private
   * @method _setupText
   * @description Creates and positions the title text for the selection screen
   */
  _setupText() {
    const textStyle = new PIXI.TextStyle({
      fontFamily: "ubuntu-medium",
      fontSize: 40,
      fill: this.textColor,
      align: "center",
    });
    const text = new PIXI.Text("CHOOSE YOUR AVATAR", textStyle);
    text.anchor.set(0.5, 0);
    text.x = this.c_width * 0.5;
    text.y = 70;
    this.container.addChild(text);
    this.startY = text.height + text.y;
  }

  /**
   * @private
   * @async
   * @method _setupAvatarOptions
   * @description Creates and positions the avatar selection options
   */
  async _setupAvatarOptions() {
    const dropShadowFilter = this.assets.getDropFilterDark();
    const avatarContainer = new PIXI.Container();
    
    const containerWidth = this.c_width / 2;
    const containerHeight = this.c_height * (2 / 3);

    avatarContainer.x = (this.c_width - containerWidth) / 2;
    avatarContainer.y = (this.c_height) / 6;

    const avatar_sprite_h = containerHeight / 2;
    const num_avatars = 2;
    const avatarWidths = [];
    const avatarTextures = this.assets.getAvatarOptionTextures();

    for (let i = 0; i < num_avatars; i++) {
      const texture = avatarTextures[i];
      const aspectRatio = texture.width / texture.height;
      const avatar_sprite_w = avatar_sprite_h * aspectRatio;
      avatarWidths.push(avatar_sprite_w);

      const rect = new PIXI.Graphics();
      rect.beginFill(0x000000, 0);
      rect.drawRect(0, 0, avatar_sprite_w, avatar_sprite_h);
      rect.endFill();

      const avatar = new PIXI.Sprite(texture);
      avatar.width = avatar_sprite_w;
      avatar.height = avatar_sprite_h;
      rect.addChild(avatar);

      const remainingWidth = containerWidth - avatarWidths.reduce((sum, width) => sum + width, 0);
      rect.x = (i === 0) ? 0 : (remainingWidth + avatarWidths[0]);
      rect.y = this.startY;

      rect.interactive = true;
      rect.buttonMode = true;

      // Hover effects
      rect.on("pointerover", () => {
        rect.filters = [dropShadowFilter]; // Add shadow on hover
      });

      rect.on("pointerout", () => {
        rect.filters = []; // Remove shadow
      });

      // Selection handler
      rect.on("click", () => {
        const avatarIndex = i;
        this._onAvatarSelected(avatarIndex);
      });

      avatarContainer.addChild(rect);
      this.avatarSprites.push(avatar);
      this.avatarRects.push(rect);
    }
    this.container.addChild(avatarContainer);
  }
  
  /**
   * @private
   * @method _onAvatarSelected
   * @description Handles avatar selection and invokes callback
   * @param {number} avatarIndex - Index of selected avatar (0 or 1)
   */
  _onAvatarSelected(avatarIndex) {
    if (this.onAvatarSelected) {
      this.onAvatarSelected(avatarIndex);
    }
  }
}
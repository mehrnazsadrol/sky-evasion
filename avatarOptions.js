/**
 * AvatarOptions - The class that handles creation and interaction of avatar selection screen.
 * 
 * Inputs:
 * @param {PIXI.Container} container - The container to add avatar options to
 * @param {Assets} assets - Asset manager for textures and colors
 * @param {number} c_width - Canvas width for positioning elements
 * @param {number} c_height - Canvas height for positioning elements
 * @param {function} onAvatarSelected - Callback when avatar is selected (receives avatarIndex)
 */
export class AvatarOptions {
  constructor(container, assets, c_width, c_height, onAvatarSelected) {

    this.container = container;
    this.assets = assets;
    this.c_width = c_width;
    this.c_height = c_height;
    this.canvas_bg_color = this.assets.getCanvasBackgroundColor();
    this.avatarSprites = [];
    this.avatarRects = [];
    this.onAvatarSelected = onAvatarSelected;
  }

  /**
   * Loads the avatar selection screen
   * @async
   */
  async init() {
    this._setupBackground();
    this._setupText();
    await this._setupAvatarOptions();
  }

  /**
   * Creates the background rectangle for the screen
   * @private
   */
  _setupBackground() {
    const bgRect = new PIXI.Graphics();
    bgRect.beginFill(this.canvas_bg_color);
    bgRect.drawRect(0, 0, this.c_width, this.c_height);
    bgRect.endFill();
    this.container.addChild(bgRect);
  }

  /**
   * Creates and positions the title text
   * @private
   */
  _setupText() {
    const textStyle = new PIXI.TextStyle({
      fontFamily: "ubuntu-medium",
      fontSize: 40,
      fill: 0xffffff,
      align: "center",
    });
    const text = new PIXI.Text("CHOOSE YOUR AVATAR", textStyle);
    text.x = (this.c_width - text.width) / 2;
    text.y = 20;
    this.container.addChild(text);
    this.startY = text.height + 10;
  }

  /**
   * Creates interactive avatar selection options with hover effects
   * @private
   * @async
   */
  async _setupAvatarOptions() {
    const dropShadowFilter = new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 4,
      alpha: 0.6,
      color: 0xfff2db,
    });

    const avatarContainer = new PIXI.Container();
    const containerWidth = this.c_width / 2;
    const containerHeight = this.c_height * (2 / 3);

    avatarContainer.x = (this.c_width - containerWidth) / 2;
    avatarContainer.y = (this.c_height - this.startY - containerHeight) / 2 + this.startY;

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

      rect.on("pointerover", () => {
        rect.filters = [dropShadowFilter];
      });

      rect.on("pointerout", () => {
        rect.filters = [];
      });

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
   * Handles avatar selection and invokes callback
   * @private
   * @param {number} avatarIndex - Index of selected avatar
   */
  _onAvatarSelected(avatarIndex) {
    if (this.onAvatarSelected) {
      this.onAvatarSelected(avatarIndex);
    }
  }
}
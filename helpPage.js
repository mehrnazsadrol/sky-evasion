/**
 * HelpPage class - Manages the game play guid screen with scrolling content
 */
export class HelpPage {
  /**
   * Creates a HelpPage instance with scrollabe content
   * @param {PIXI.Container} container - The container to hold help page elements
   * @param {Assets} assets - Game assets manager
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height
   * @param {function} onClosed - Callback when help page is closed
   */
  constructor(container, assets, c_width, c_height, onClosed) {
    this.container = container;
    this.assets = assets;
    this.c_width = c_width;
    this.c_height = c_height;
    this.onClosed = onClosed;

    this.scrollContainer = null;
    this.contentContainer = null;
    this.textContainer = null;
    this.dragging = false;
    this.scrollbarThumb = null;
    this.scrollbarTrack = null;
    this.scrollParams = null;

    this.textPadding = 20;
    this.scrollWidth = this.c_width - this.c_width * 0.1;
    this.scrollX = this.c_width * 0.05;

  }

  /**
   * Initializes the help page with background, content, and close button
   */
  async init() {
    await this._setupBackgroung();
    await this._setupPageContent();
    await this._addCloseButton();
  }

  /**
   * Sets up the help page background with proper scaling and masking
   */
  async _setupBackgroung() {
    const bg = this.assets.getTexture('help_background');
    const bg_sprite = new PIXI.Sprite(bg);

    // Calculates scaling to fit background to canvas
    let scale, offsetX = 0, offsetY = 0;
    const targetWidth = this.c_width;
    const targetHeight = this.c_height;
    const textureRatio = bg.width / bg.height;
    const targetRatio = targetWidth / targetHeight;

    if (textureRatio > targetRatio) {
      scale = targetHeight / bg.height;
      offsetX = (bg.width * scale - targetWidth) / 2;
    } else {
      scale = targetWidth / bg.width;
      offsetY = (bg.height * scale - targetHeight) / 2;
    }

    // Create a mask to ensure background stays within canvas bounds
    bg_sprite.width = bg.width * scale;
    bg_sprite.height = bg.height * scale;

    const mask = new PIXI.Graphics()
      .rect(0, 0, targetWidth, targetHeight)
      .fill({ color: 0xFFFFFF });
    this.container.addChild(mask);
    bg_sprite.mask = mask;
    //centralize the background with the offset
    bg_sprite.x = -offsetX;
    bg_sprite.y = -offsetY;

    this.container.addChild(bg_sprite);
  }

  /**
   * Sets up the main content container with scrollable text
   */
  async _setupPageContent() {
    this.contentContainer = new PIXI.Container();
    // Create semi-transparent background for text content
    const bg = new PIXI.Graphics()
      .rect(this.scrollX, 0, this.scrollWidth, this.c_height)
      .fill({ color: 0xFDF1DB, alpha: 0.6 });
    this.contentContainer.addChild(bg);
    this.container.addChild(this.contentContainer);

    //text containe to hold the text
    this.textContainer = new PIXI.Container();
    await this._addTextToContainer();
    const contentHeight = this._calculateContentHeight();

    //scroll container with mask
    this.scrollContainer = new PIXI.Container();
    this.scrollContainer.addChild(this.textContainer);
    this.scrollContainer.height = contentHeight;

    const scrollMask = new PIXI.Graphics()
      .rect(this.scrollX, 50, this.scrollWidth, this.c_height)
      .fill({ color: 0xFFFFFF, alpha: 0 });
    this.contentContainer.addChild(scrollMask);
    this.scrollContainer.mask = scrollMask;
    this.contentContainer.addChild(this.scrollContainer);

    this._createScrollBar(contentHeight);
    this._enableScrolling();
    this.container.addChild(this.contentContainer);
  }

  /**
   * Creates a scrollbar for the content
   * @param {number} contentHeight - Total height of the text content
   */
  _createScrollBar(contentHeight) {
    const scrollbarWidth = 10;
    const scrollbarX = this.scrollX + this.scrollWidth - scrollbarWidth;
    const scrollbarHeight = this.c_height - 100;

    this.scrollbarTrack = new PIXI.Graphics()
      .rect(scrollbarX, 100, scrollbarWidth, scrollbarHeight)
      .fill({ color: 0xCCCCCC, alpha: 0 });
    this.contentContainer.addChild(this.scrollbarTrack);

    const thumbHeight = Math.max(30, scrollbarHeight * (scrollbarHeight / contentHeight));
    this.scrollbarThumb = new PIXI.Graphics()
      .rect(scrollbarX, 100, scrollbarWidth, thumbHeight)
      .fill({ color: 0x0C0950, alpha: 0.7 });
    this.scrollbarThumb.interactive = true;
    this.scrollbarThumb.buttonMode = true;
    this.contentContainer.addChild(this.scrollbarThumb);
    // scroll parameters for calculations
    this.scrollParams = {
      contentHeight: contentHeight,
      scrollHeight: scrollbarHeight,
      thumbHeight: thumbHeight,
      minY: 0,
      maxY: scrollbarHeight - thumbHeight,
      scrollRatio: (contentHeight - scrollbarHeight) / (scrollbarHeight - thumbHeight)
    };
  }

  /**
   * Enables scrolling via mouse wheel, drag, and click on scrollbar
   */
  _enableScrolling() {
    let lastY = 0;
    this.container.interactive = true;
    this.container.on('wheel', (event) => {
      const delta = event.deltaY;
      this._scrollContent(delta * 5);
    });

    this.scrollbarThumb.on('mousedown', (event) => {
      this.dragging = true;
      lastY = event.data.global.y;
    });

    this.container.on('mousemove', (event) => {
      if (!this.dragging) return;

      const deltaY = event.data.global.y - lastY;
      lastY = event.data.global.y;

      this.scrollbarThumb.y = Math.max(
        this.scrollParams.minY,
        Math.min(
          this.scrollParams.maxY,
          this.scrollbarThumb.y + deltaY
        )
      );

      const scrollPercent = (this.scrollbarThumb.y - this.scrollParams.minY) /
        (this.scrollParams.maxY - this.scrollParams.minY);
      this.scrollContainer.y = 100 - (scrollPercent * (this.scrollParams.contentHeight - (this.c_height - 200)));
    });

    this.container.on('mouseup', () => {
      this.dragging = false;
    });

    this.scrollbarTrack.interactive = true;
    this.scrollbarTrack.on('click', (event) => {
      const clickY = event.data.global.y - 100;
      const newThumbY = Math.min(
        clickY - (this.scrollParams.thumbHeight / 2),
        this.scrollParams.maxY
      );
      this.scrollbarThumb.y = Math.max(this.scrollParams.minY, newThumbY);

      const scrollPercent = (this.scrollbarThumb.y - this.scrollParams.minY) /
        (this.scrollParams.maxY - this.scrollParams.minY);
      this.scrollContainer.y = 100 - (scrollPercent * (this.scrollParams.contentHeight - (this.c_height - 200)));
    });
  }

  /**
   * Scrolls the content by a specified amount
   * @param {number} deltaY - Vertical scroll amount
   */
  _scrollContent(deltaY) {
    const newThumbY = this.scrollbarThumb.y + (deltaY / this.scrollParams.scrollRatio);

    this.scrollbarThumb.y = Math.max(
      this.scrollParams.minY,
      Math.min(this.scrollParams.maxY, newThumbY)
    );

    const scrollPercent = (this.scrollbarThumb.y - this.scrollParams.minY) /
      (this.scrollParams.maxY - this.scrollParams.minY);
    this.scrollContainer.y = 100 - (scrollPercent * (this.scrollParams.contentHeight - (this.c_height - 200)));
  }

  /**
   * Calculates the total height of the content
   * @returns {number} Total height of all content elements
   */
  _calculateContentHeight() {
    let maxY = 0;
    this.textContainer.children.forEach(child => {
      maxY = Math.max(maxY, child.y + child.height);
    });
    return maxY + 100;
  }

  /**
   * Creates a text element with specified style and position
   * @param {string} text - The text to display
   * @param {object} style - PIXI.Text style options
   * @param {number} x - x position
   * @param {number} y - y position
   * @param {object} anchor - Text anchor point
   * @returns {PIXI.Text} The created text element
   */
  _createTextElement(text, style, x = 0, y = 0, anchor = { x: 0, y: 0 }) {
    const textElement = new PIXI.Text(text, style);
    textElement.x = x;
    textElement.y = y;
    textElement.anchor.set(anchor.x, anchor.y);
    this.textContainer.addChild(textElement);
    return textElement;
  }

  /**
   * Adds all help text content to the container with proper formatting
   */
  async _addTextToContainer() {
    const textColor = this.assets.getThemeTextColor();
    const titleStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 40,
      fontWeight: 'bold',
      fill: 0x0C0950,
      align: 'center'
    };

    const headerStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0x0C0950,
      align: 'left'
    };

    const subHeaderStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 22,
      fontWeight: 'bold',
      fill: textColor,
      align: 'left'
    };

    const bodyStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 16,
      fill: textColor,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: this.scrollWidth - 40
    };

    const titleBottomMargin = 40;
    const headerBottomMargin = 15;
    const subHeaderBottomMargin = 10;
    const bulletListBottomMargin = 10;
    const sectionBottomMargin = 25;

    const title = this._createTextElement(
      'Sky Evasion Game play Guide',
      titleStyle,
      (this.scrollWidth) / 2,
      titleBottomMargin,
      { x: 0.5, y: 0 }
    );

    let currentY = title.y + title.height + titleBottomMargin;

    const gameObjectiveHeader = this._createTextElement(
      'Game Objective',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += gameObjectiveHeader.height + headerBottomMargin;

    const gameObjectiveText = this._createTextElement(
      'Escape the alien slime invasion by running across rooftops! ' +
      'You can\'t go backward—forward is the only way. \n Survive as ' +
      'long as possible while avoiding slimes and gaps.',
      bodyStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += gameObjectiveText.height + sectionBottomMargin;

    // Controls section
    const controlsHeader = this._createTextElement(
      'Controls',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += controlsHeader.height + headerBottomMargin;

    const movementHeader = this._createTextElement(
      'Movement',
      subHeaderStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += movementHeader.height + subHeaderBottomMargin;

    const movementText = this._createTextElement(
      '• Move Forward: Hold → (Right Arrow) or D to walk.\n' +
      '• Double-tap to sprint (faster but riskier).',
      bodyStyle,
      this.scrollX + this.textPadding * 2,
      currentY
    );
    currentY += movementText.height + bulletListBottomMargin;

    const jumpingHeader = this._createTextElement(
      'Jumping',
      subHeaderStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += jumpingHeader.height + subHeaderBottomMargin;

    const jumpingText = this._createTextElement(
      '• Jump: Press ↑ (Up Arrow) or W to jump.\n' +
      '• Jumps only move you upward. You must hold →/D to keep moving forward!\n' +
      '• Double Jump: Press ↑/W again mid-air for an extra boost.',
      bodyStyle,
      this.scrollX + this.textPadding * 2,
      currentY
    );
    currentY += jumpingText.height + sectionBottomMargin;

    const mechanicsHeader = this._createTextElement(
      'Key Mechanics',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += mechanicsHeader.height + headerBottomMargin;

    const noBackwardsHeader = this._createTextElement(
      'No Backwards Movement',
      subHeaderStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += noBackwardsHeader.height + subHeaderBottomMargin;

    const noBackwardsText = this._createTextElement(
      'The city collapses behind you. Keep moving right or fall!',
      bodyStyle,
      this.scrollX + this.textPadding * 2,
      currentY
    );
    currentY += noBackwardsText.height + subHeaderBottomMargin;

    const jumpNotForwardHeader = this._createTextElement(
      'Jumping ≠ Forward Movement',
      subHeaderStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += jumpNotForwardHeader.height + subHeaderBottomMargin;

    const jumpNotForwardText = this._createTextElement(
      'Pressing jump alone won\'t move you horizontally. Hold →/D while jumping to clear gaps. Why this matters?\n' +
      ' If you stop holding →/D, you\'ll halt mid-air during a jump—likely falling into a gap! ',
      bodyStyle,
      this.scrollX + this.textPadding * 2,
      currentY
    );
    currentY += jumpNotForwardText.height + subHeaderBottomMargin;

    const speedHeader = this._createTextElement(
      'Speed Matters',
      subHeaderStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += speedHeader.height + subHeaderBottomMargin;

    const speedText = this._createTextElement(
      '• Walk (slow): Easier to time jumps.\n' +
      '• Run (fast): Covers ground quicker but shortens reaction time.',
      bodyStyle,
      this.scrollX + this.textPadding * 2,
      currentY
    );
    currentY += speedText.height + sectionBottomMargin;
    const obstaclesHeader = this._createTextElement(
      'Obstacles',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += obstaclesHeader.height + headerBottomMargin;

    const obstaclesText = this._createTextElement(
      '• Slimes: Touch them, and it\'s game over! Jump over them to earn bonus points.\n' +
      '• Gaps: Fall between buildings, and your run ends. Time your jumps carefully!',
      bodyStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += obstaclesText.height + sectionBottomMargin;

    const difficultyHeader = this._createTextElement(
      'Difficulty',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += difficultyHeader.height + headerBottomMargin;

    const difficultyText = this._createTextElement(
      'The game gets harder the longer you survive:\n' +
      '• Slimes spawn more frequently.\n' +
      '• Gaps between rooftops become wider.',
      bodyStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += difficultyText.height + sectionBottomMargin;


    const scoringHeader = this._createTextElement(
      'Scoring',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += scoringHeader.height + headerBottomMargin;

    const scoringText = this._createTextElement(
      '• Distance: Earn points for every rooftop you cross.\n' +
      '• Slimes Jumped: Bonus points for each slime you stay clear.',
      bodyStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += scoringText.height + sectionBottomMargin;

    const finalMessage = this._createTextElement(
      'Good luck, and have fun!',
      headerStyle,
      (this.scrollWidth) / 2,
      currentY,
      { x: 0.5, y: 0 }
    );
  }

  async _addCloseButton() {
    const iconSize = this.c_width * 0.05;
    const closeButton = new PIXI.Sprite(this.assets.getTexture('close_icon'));
    closeButton.anchor.set(1, 0.5);
    closeButton.x = this.c_width - this.scrollX;
    closeButton.y = iconSize;
    closeButton.width = iconSize;
    closeButton.height = iconSize;
    closeButton.interactive = true;
    closeButton.buttonMode = true;

    closeButton.on('pointerdown', () => {
      this.onClosed();
    });

    closeButton.on('pointerover', () => {
      closeButton.filters = [this.assets.getDropFilterDark()];
    });

    closeButton.on('pointerout', () => {
      closeButton.filters = [];
    });

    this.container.addChild(closeButton);
  }
}
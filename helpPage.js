export class HelpPage {
  constructor(app, container, assets, c_width, c_height, onClosed) {
    this.container = container;
    this.assets = assets;
    this.c_width = c_width;
    this.c_height = c_height;
    this.onClosed = onClosed;
    this.app = app;

    this.scrollContainer = null;
    this.contentContainer = null;
    this.textContainer = null;
    this.dragging = false;
    this.scrollbarThumb = null;
    this.scrollbarTrack = null;
    this.scrollParams = null;
    this.textPadding = 20;

    this.scrollWidth = this.c_width - this.c_width * 0.1;  // 80% of screen width
    this.scrollX = this.c_width * 0.05; // 10% margin

  }

  async init() {
    await this._setupBackgroung();
    await this._setupPageContent();
    await this._addCloseButton();
  }

  async _setupBackgroung() {
    const bg = this.assets.getTexture('help_background');
    const bg_sprite = new PIXI.Sprite(bg);

    const targetWidth = this.c_width;
    const targetHeight = this.c_height;
    const textureRatio = bg.width / bg.height;
    const targetRatio = targetWidth / targetHeight;

    let scale, offsetX = 0, offsetY = 0;

    if (textureRatio > targetRatio) {
      // Texture is wider - fit to height
      scale = targetHeight / bg.height;
      offsetX = (bg.width * scale - targetWidth) / 2;
    } else {
      // Texture is taller - fit to width
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

  }

  async _setupPageContent() {

    this.contentContainer = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(0xFDF1DB, 0.6);
    bg.drawRect(this.scrollX, 0, this.scrollWidth, this.c_height);
    bg.endFill();
    this.contentContainer.addChild(bg);
    this.container.addChild(this.contentContainer);

    this.textContainer = new PIXI.Container();
    await this._addTextToContainer();
    const contentHeight = this._calculateContentHeight();

    this.scrollContainer = new PIXI.Container();
    this.scrollContainer.addChild(this.textContainer);
    this.scrollContainer.height = contentHeight;

    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0xFFFFFF, 0);
    scrollMask.drawRect(this.scrollX, 100, this.scrollWidth, this.c_height - 200); // 100px top/bottom margin
    scrollMask.endFill();
    this.contentContainer.addChild(scrollMask);
    this.scrollContainer.mask = scrollMask;

    this.contentContainer.addChild(this.scrollContainer);

    this._createScrollBar(contentHeight);

    this._enableScrolling();

    this.container.addChild(this.contentContainer);
  }

  _createScrollBar(contentHeight) {
    const scrollbarWidth = 10;
    const scrollbarX = this.scrollX + this.scrollWidth - scrollbarWidth;
    const scrollbarHeight = this.c_height - 100;

    // Scrollbar track
    this.scrollbarTrack = new PIXI.Graphics();
    this.scrollbarTrack.beginFill(0xCCCCCC, 0);
    this.scrollbarTrack.drawRect(scrollbarX, 100, scrollbarWidth, scrollbarHeight);
    this.scrollbarTrack.endFill();
    this.contentContainer.addChild(this.scrollbarTrack);

    // Scrollbar thumb
    const thumbHeight = Math.max(30, scrollbarHeight * (scrollbarHeight / contentHeight));
    console.log('thumbHeight', thumbHeight);
    this.scrollbarThumb = new PIXI.Graphics();
    this.scrollbarThumb.beginFill(0x888888);
    this.scrollbarThumb.drawRect(scrollbarX, 100, scrollbarWidth, thumbHeight);
    this.scrollbarThumb.endFill();
    this.scrollbarThumb.interactive = true;
    this.scrollbarThumb.buttonMode = true;
    this.contentContainer.addChild(this.scrollbarThumb);

    // Store scroll parameters
    this.scrollParams = {
      contentHeight: contentHeight,
      scrollHeight: scrollbarHeight,
      thumbHeight: thumbHeight,
      minY: 0,
      maxY: scrollbarHeight - thumbHeight,
      scrollRatio: (contentHeight - scrollbarHeight) / (scrollbarHeight - thumbHeight)
    };
  }

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

  _calculateContentHeight() {
    let maxY = 0;
    this.textContainer.children.forEach(child => {
      maxY = Math.max(maxY, child.y + child.height);
    });
    return maxY + 100;
  }

  _createTextElement(text, style, x = 0, y = 0, anchor = { x: 0, y: 0 }) {
    const textElement = new PIXI.Text(text, style);
    textElement.x = x;
    textElement.y = y;
    textElement.anchor.set(anchor.x, anchor.y);
    this.textContainer.addChild(textElement);
    return textElement;
  }

  async _addTextToContainer() {
    const titleStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 40,
      fontWeight: 'bold',
      fill: 0x000000,
      align: 'center'
    };

    const headerStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0x000000,
      align: 'left'
    };

    const subHeaderStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0x000000,
      align: 'left'
    };

    const bodyStyle = {
      fontFamily: 'ubuntu-medium',
      fontSize: 16,
      fill: 0x000000,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: this.scrollWidth - 40
    };

    // Define consistent spacing values
    const titleBottomMargin = 40;
    const headerBottomMargin = 15;
    const subHeaderBottomMargin = 10;
    const paragraphBottomMargin = 25;
    const bulletListBottomMargin = 10;
    const sectionBottomMargin = 25;

    // Add title (centered)
    const title = this._createTextElement(
      'Sky Evasion (Game Guide)',
      titleStyle,
      (this.scrollWidth) / 2,
      0,
      { x: 0.5, y: 0 }
    );

    let currentY = title.y + title.height + titleBottomMargin;

    // Game Objective section
    const gameObjectiveHeader = this._createTextElement(
      'Game Objective',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += gameObjectiveHeader.height + headerBottomMargin;

    const gameObjectiveText = this._createTextElement(
      'Escape the alien slime invasion by running across rooftops! ' +
      'You can\'t go backward—forward is the only way. Survive as ' +
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

    // Movement subsection
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

    // Jumping subsection
    const jumpingHeader = this._createTextElement(
      'Jumping',
      subHeaderStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += jumpingHeader.height + subHeaderBottomMargin;

    const jumpingText = this._createTextElement(
      '• Jump: Press ↑ (Up Arrow) or W to jump.\n' +
      '• Jumps only move you upward—you must hold →/D to keep moving forward!\n' +
      '• Double Jump: Press ↑/W again mid-air for an extra boost.',
      bodyStyle,
      this.scrollX + this.textPadding * 2,
      currentY
    );
    currentY += jumpingText.height + sectionBottomMargin;

    // Key Mechanics section
    const mechanicsHeader = this._createTextElement(
      'Key Mechanics',
      headerStyle,
      this.scrollX + this.textPadding,
      currentY
    );
    currentY += mechanicsHeader.height + headerBottomMargin;

    // No Backwards Movement
    const noBackwardsHeader = this._createTextElement(
      'No Backwards Movement',
      subHeaderStyle,
      this.scrollX + this.textPadding * 1.5,
      currentY
    );
    currentY += noBackwardsHeader.height + subHeaderBottomMargin;

    const noBackwardsText = this._createTextElement(
      'The city collapses behind you—keep moving right or fall!',
      bodyStyle,
      this.scrollX + this.textPadding * 2,
      currentY
    );
    currentY += noBackwardsText.height + subHeaderBottomMargin;

    // Jumping ≠ Forward Movement
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

    // Speed Matters
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
      '• Slimes Jumped: Bonus points for each slime you clear.',
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
    const closeButton = new PIXI.Sprite(this.assets.getTexture('close_icon'));
    closeButton.anchor.set(1,0);
    closeButton.x = this.c_width - this.scrollX;
    closeButton.y = 50;
    closeButton.width = 50;
    closeButton.height = 50;
    closeButton.interactive = true;
    closeButton.buttonMode = true;

    closeButton.on('pointerdown', () => {
      this.onClosed();
    });

    this.container.addChild(closeButton);
  }
}
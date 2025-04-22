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
    this.closeButton = null;
    this.dragging = false;
    this.dragStart = 0;
    this.scrollStart = 0;

    this.scrollWidth = this.c_width;  // 80% of screen width
    this.scrollHeight = this.c_height; // 80% of screen height
    this.scrollX = this.c_width * 0.05;     // 10% margin
    this.scrollY = this.c_height * 0.05;    // 10% margin
  }

  async init() {
    await this._setupPage();
  }

  async _setupPage() {
    // Create main container with white background
    const bg = new PIXI.Graphics();
    bg.beginFill(0xffffff);
    bg.drawRect(0, 0, this.c_width, this.c_height);
    bg.endFill();
    this.container.addChild(bg);

    // Calculate scroll container dimensions



    console.log('this.scrollWidth', this.scrollWidth, ' this.scrollHeight', this.scrollHeight, ' this.scrollX', this.scrollX, ' this.scrollY', this.scrollY);
    console.log('container.width', this.container.width, ' container.height', this.container.height);
    
    
    // Create scrollable container
    this.scrollContainer = new PIXI.Container();
    this.container.addChild(this.scrollContainer);


    // Create mask for scrolling - MUST be added to the same parent as the scrollContainer
    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(0, 0, this.scrollWidth, this.scrollHeight);
    mask.endFill();
    this.container.addChild(mask); // Add to same parent as scrollContainer
    this.scrollContainer.mask = mask;

    // Create content container
    this.contentContainer = new PIXI.Container();
    this.contentContainer.x = 0;
    this.contentContainer.y = 0;
    this.contentContainer.backgroundColor = 0xFFFFFF;
    this.scrollContainer.addChild(this.contentContainer);
    console.log('scrollcontainer.width', this.scrollContainer.width, ' scrollcontainer.height', this.scrollContainer.height);

    // Add all content first so we can calculate scroll dimensions
    await this._addTextContent();
    console.log('scrollcontainer.width', this.scrollContainer.width, ' scrollcontainer.height', this.scrollContainer.height);

    await this._addScrollBar();
    await this._addCloseButton();

    // Enable mouse wheel scrolling
    this.scrollContainer.interactive = true;
    this.scrollContainer.hitArea = new PIXI.Rectangle(0, 0, this.scrollWidth, this.scrollHeight);
    this.scrollContainer.on('wheel', (e) => {
      this._handleScroll(-e.deltaY);
    });

    // Force initial render
    this.app.render();
  }

  async _addScrollBar() {
    // Calculate scroll dimensions after content is added
    this.maxScroll = Math.max(0, this.contentContainer.height - this.scrollContainer.height);
    console.log('maxScroll', this.maxScroll, ' contentContainer.height', this.contentContainer.height, ' scrollContainer.height', this.scrollContainer.height);
    this.scrollRatio = this.scrollContainer.height / Math.max(this.contentContainer.height, 1);

    // Only add scrollbar if content is scrollable
    if (this.maxScroll > 0) {
      console.log('scrollContainer.width', this.scrollContainer.width, ' scrollContainer.height', this.scrollContainer.height);
      // Scrollbar track
      const track = new PIXI.Graphics();
      track.beginFill(0xCCCCCC);
      track.drawRect(this.scrollContainer.width - 10, 0, 8, this.scrollContainer.height);
      track.endFill();
      track.alpha = 0.5;
      this.scrollContainer.addChild(track);

      // Scrollbar thumb
      this.scrollThumb = new PIXI.Graphics();
      this.scrollThumb.beginFill(0x888888);
      this.scrollThumb.drawRect(this.scrollContainer.width - 10, 0, 8,
        Math.max(20, this.scrollContainer.height * this.scrollRatio));
      this.scrollThumb.endFill();
      this.scrollContainer.addChild(this.scrollThumb);

      // Make scrollbar draggable
      this.scrollThumb.interactive = true;
      this.scrollThumb.buttonMode = true;

      this.scrollThumb.on('mousedown', (e) => {
        this.dragging = true;
        this.dragStart = e.data.global.y;
        this.scrollStart = this.contentContainer.y;
      });

      const onDragMove = (e) => {
        if (this.dragging) {
          const delta = e.data.global.y - this.dragStart;
          const newY = this.scrollStart + delta;
          this._scrollTo(newY);
        }
      };

      const onDragEnd = () => {
        this.dragging = false;
      };

      this.scrollContainer.on('mousemove', onDragMove);
      this.scrollContainer.on('mouseup', onDragEnd);
      this.scrollContainer.on('mouseupoutside', onDragEnd);
    }
  }

  async _scrollTo(y) {
    const maxY = 0;
    const minY = -this.maxScroll;
    y = Math.min(maxY, Math.max(minY, y));
    this.contentContainer.y = y;

    // Update scroll thumb position
    if (this.scrollThumb && this.maxScroll > 0) {
      const thumbPos = (-y / this.maxScroll) * (this.scrollContainer.height - this.scrollThumb.height);
      this.scrollThumb.y = thumbPos;
    }
    this.app.render();
  }

  _handleScroll(delta) {
    const newY = this.contentContainer.y + delta * 0.5;
    this._scrollTo(newY);
  }

  async _addTextContent() {
    const contentWidth = this.scrollWidth- (this.maxScroll > 0 ? 30 : 10); // Adjust for scrollbar if present
    let currentY = 0;
    const padding = 20;
    console.log('contentWidth', contentWidth, ' scrollWidth', this.scrollWidth, ' maxScroll', this.maxScroll);
    const titleStyle = new PIXI.TextStyle({
      fontFamily: 'Arial', // Fallback if 'ubuntu-medium' not available
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0x000000,
      align: 'center'
    });

    const subtitleStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0x000000,
      align: 'left'
    });

    const normalStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x000000,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: contentWidth,
      lineHeight: 24
    });

    const bulletStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x000000,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: contentWidth - 20,
      lineHeight: 24
    });

    // Title
    const title = new PIXI.Text('Sky Evasion - Help Guide', titleStyle);
    title.x = contentWidth / 2;
    title.y = currentY;
    title.anchor.set(0.5, 0);
    this.contentContainer.addChild(title);
    currentY += title.height + padding * 2;

    // Sections
    currentY = this._addSection('Game Objective', [
      'Escape the alien slime invasion by running across rooftops! Survive as long as possible while avoiding slimes and gaps between buildings. Your score increases the farther you run and the more slimes you jump over.'
    ], currentY, contentWidth, subtitleStyle, normalStyle) + padding;

    currentY = this._addSection('Controls', [
      'Move Forward: Hold → (Right Arrow) or D to walk.',
      'Double-tap to sprint (faster but riskier).',
      'Jump: Press ↑ (Up Arrow) or W to jump.',
      'Jumps only move you upward—you must hold →/D to keep moving forward!',
      'Double Jump: Press ↑/W again mid-air for an extra boost.'
    ], currentY, contentWidth, subtitleStyle, bulletStyle) + padding;

    currentY = this._addSection('Mechanics', [
      'Movement & Speed',
      'Walk (Slow): Safe for precise jumps but covers less distance.',
      'Run (Fast): Covers more ground but reduces reaction time and makes jumps riskier.',
      '',
      'Jumping',
      'Single Jump: Clears small gaps and slimes.',
      'Double Jump: Extends your jump distance and height for trickier obstacles.',
      '',
      'No Backwards Movement: The city collapses behind you—keep moving right or fall!',
      'Jumping ≠ Forward Movement: Pressing jump alone won\'t move you horizontally. Hold →/D while jumping to clear gaps.',
      '',
      'Speed Matters:',
      'Walk (slow): Easier to time jumps.',
      'Run (fast): Covers ground quicker but shortens reaction time.',
      '',
      'Why This Matters',
      'If you stop holding →/D, you\'ll halt mid-air during a jump—likely falling into a gap!',
      'Always keep moving to survive longer!'
    ], currentY, contentWidth, subtitleStyle, bulletStyle) + padding;

    currentY = this._addSection('Obstacles', [
      'Slimes: Touch them, and it\'s game over! Jump over them to earn bonus points.',
      'Gaps: Fall between buildings, and your run ends. Time your jumps carefully!'
    ], currentY, contentWidth, subtitleStyle, bulletStyle) + padding;

    currentY = this._addSection('Difficulty', [
      'The game gets harder the longer you survive:',
      'Slimes spawn more frequently.',
      'Gaps between rooftops become wider.'
    ], currentY, contentWidth, subtitleStyle, bulletStyle) + padding;

    currentY = this._addSection('Scoring', [
      'Distance: Earn points for every rooftop you cross.',
      'Slimes Jumped: Bonus points for each slime you clear.'
    ], currentY, contentWidth, subtitleStyle, bulletStyle) + padding;

    // Tip
    const tip = new PIXI.Text('Tip: Master switching between walking and running to handle gaps and slimes effectively!', normalStyle);
    tip.x = contentWidth / 2;
    tip.y = currentY;
    tip.anchor.set(0.5, 0);
    this.contentContainer.addChild(tip);
    currentY += tip.height + padding;

    // Good luck
    const luck = new PIXI.Text('Good luck, and evade those slimes!', titleStyle);
    luck.style.fontSize = 24;
    luck.x = contentWidth / 2;
    luck.y = currentY;
    luck.anchor.set(0.5, 0);
    this.contentContainer.addChild(luck);
  }

  _addSection(title, lines, y, width, titleStyle, textStyle) {
    const titleText = new PIXI.Text(title, titleStyle);
    titleText.x = 0;
    titleText.y = y;
    this.contentContainer.addChild(titleText);
    y += titleText.height + 10;

    for (const line of lines) {
      if (line === '') {
        y += 10;
        continue;
      }

      const isSubtitle = line.endsWith(':') || ['Movement & Speed', 'Jumping', 'Why This Matters'].includes(line);
      const style = isSubtitle ? new PIXI.TextStyle({ ...textStyle, fontWeight: 'bold' }) : textStyle;

      const text = new PIXI.Text(line, style);
      text.x = isSubtitle ? 0 : 20;
      text.y = y;
      this.contentContainer.addChild(text);
      y += text.height + 5;
    }

    return y;
  }

  async _addCloseButton() {
    this.closeButton = new PIXI.Sprite(this.assets.getTexture('close_icon'));
    this.closeButton.width = 60;
    this.closeButton.height = 60;
    this.closeButton.anchor.set(0.5);
    this.closeButton.x = this.c_width - 40;
    this.closeButton.y = 40;
    this.closeButton.interactive = true;
    this.closeButton.buttonMode = true;

    this.closeButton.on('pointerdown', () => {
      this.onClosed();
    });

    this.container.addChild(this.closeButton);
  }
}
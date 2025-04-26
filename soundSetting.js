/**
 * @file SoundSetting.js
 * @description Handles the sound setting screen 
 * 
 * Called By: Main
 * Calls: Assets manager for textures and styles
 */
export class SoundSetting {
  /**
   * @constructor
   * @description Initializes the avatar selection screen
   * @param {PIXI.Container} container - Parent container for UI elements
   * @param {Assets} assets - Game assets manager
   * @param {SoundManager} soundManager - Game sound manager for audio control
   * @param {number} c_width - Canvas width
   * @param {number} c_height - Canvas height
   * @param {function} onCloseSetting - Callback when the setting is closed
   */
  constructor(container, assets, soundManager, c_width, c_height, onCloseSetting) {
    this.container = container;
    this.assets = assets;
    this.soundManager = soundManager;
    this.c_width = c_width;
    this.c_height = c_height;
    this.avatarSprites = [];
    this.avatarRects = [];
    this.onCloseSetting = onCloseSetting;
    this.dropShadowFilter = this.assets.getDropFilterDark();
    this.textColor = this.assets.getThemeTextColor();

    this.volBarConfig = {
      barCount: 5,
      totalWidth: this.c_width * 0.3,
      barWidth: this.c_width * 0.3 / 6,
      gap: this.c_width * 0.3 / 24,
      volBarX: 0,
      volBarHeight: 0,
      volBarY: {
        music: 0,
        sfx: 0,
      }
    };

    this.musicConfig = {
      music: {
        volBar: null,
        muteButton: null,
        isMuted: !this.soundManager.getMusicEnabled(),
        volLvl: this.soundManager.getMusicVolume(),
        volDownButton: null,
        volUpButton: null,
      },
      sfx: {
        volBar: null,
        muteButton: null,
        isMuted: !this.soundManager.getSfxEnabled(),
        volLvl: this.soundManager.getSfxVolume(),
        volDownButton: null,
        volUpButton: null,
      }
    };
  }

  /**
   * @async
   * @method init
   * @description Initializes and builds the sound setting screen
   */
  async init() {
    await this._setupBackground();
    await this._createTitle();
    await this._createMusicControls();
    await this._createSfxControls();
    await this._createExitButton();
  }

  /**
   * @private @async
   * @method _setupBackground
   * @description Creates and positions the background elements
   */
  async _setupBackground() {
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

    const mask = new PIXI.Graphics()
    .rect(0, 0, targetWidth, targetHeight)
    .fill({color:0xFFFFFF});

    this.container.addChild(mask);
    bg_sprite.mask = mask;

    bg_sprite.x = -offsetX;
    bg_sprite.y = -offsetY;
    this.container.addChild(bg_sprite);

    const rect = new PIXI.Graphics()
    .rect(this.c_width * 0.1, this.c_height * 0.1, this.c_width * 0.8, this.c_height * 0.8)
    .fill({color:0xFFFFFF, alpha:0.8});
    this.container.addChild(rect);
  }

  /**
   * @private @async
   * @method _createTitle
   * @description Creates and positions the title text for the sound settings screen
   */
  async _createTitle() {
    const style = new PIXI.TextStyle({
      fontFamily: 'ubuntu-medium',
      fontSize: 36,
      fontWeight: 'bold',
      fill: this.textColor,
    });

    const title = new PIXI.Text('SOUND SETTINGS', style);
    title.anchor.set(0.5);
    title.x = this.c_width / 2;
    title.y = this.c_height * 0.2;
    this.container.addChild(title);
  }

  /**
   * @private @async
   * @method _createMusicControls
   * @description Creates and positions the volume controls for music
   */
  async _createMusicControls() {
    const yPos = this.c_height * 0.35;
    await this._createVolumeControl('MUSIC', yPos,
      this.musicConfig.music.volLvl,
      (vol) => {
        this.musicConfig.music.volLvl = vol;
        this.soundManager.setMusicVolume(vol);
        if (this.musicConfig.music.isMuted && vol > 0) {
          this.musicConfig.music.isMuted = false;
          this.soundManager.setMusicDisable(this.musicConfig.music.isMuted);
        }
      },
      () => {
        this.musicConfig.music.isMuted = !this.musicConfig.music.isMuted;
        this.soundManager.setMusicDisable(this.musicConfig.music.isMuted);
        this._updateMuteButton(this.musicConfig.music.muteButton, this.musicConfig.music.isMuted, 'music');

      }
    );
    this._updateVolumeButtonsState('music', this.musicConfig.music.isMuted);
  }

  /**
   * @private @async
   * @method _createSfxControls
   * @description Creates and positions the volume controls for sound effects
   */
  async _createSfxControls() {
    const yPos = this.c_height * 0.55;
    await this._createVolumeControl('SFX', yPos,
      this.musicConfig.sfx.volLvl,
      (vol) => {
        this.musicConfig.sfx.volLvl = vol;
        this.soundManager.setSfxVolume(vol);
        if (this.musicConfig.sfx.isMuted && vol > 0) {
          this.musicConfig.sfx.isMuted = false;
          this.soundManager.setSfxDisable(this.musicConfig.sfx.isMuted);
        }
      },
      () => {
        this.musicConfig.sfx.isMuted = !this.musicConfig.sfx.isMuted;
        this.soundManager.setSfxDisable(this.musicConfig.sfx.isMuted);
        this._updateMuteButton(this.musicConfig.sfx.muteButton, this.musicConfig.sfx.isMuted, 'sfx');
      }
    );
    this._updateVolumeButtonsState('sfx', this.musicConfig.sfx.isMuted);
  }
  /**
   * @private
   * @method _createVolumeControl
   * @description Creates and positions the volume control elements (buttons and bars)
   * @param {string} label - Label for the volume control (e.g., 'MUSIC', 'SFX')
   * @param {number} yPos - Y position for the volume control
   * @param {function} setVolume - Function to set the volume
   * @param {function} handleMuteBtn - Function to handle mute button click
   */
  async _createVolumeControl(label, yPos, setVolume, handleMuteBtn) {
    const iconSize = this.c_width * 0.05;
    const paddingX = iconSize * 0.75;
    const paddingY = iconSize * 0.5;
    const startX = this.c_width * 0.15;
    let currx = startX;

    const style = new PIXI.TextStyle({
      fontFamily: 'RoadRage',
      fontSize: 24,
      fill: this.textColor,
    });
    const labelText = new PIXI.Text(label, style);
    labelText.anchor.set(0, 0.5);
    labelText.x = currx;
    labelText.y = yPos;
    this.container.addChild(labelText);
    currx += 2 * paddingX;

    const volDown = this._createIconButton(
      'volume_down',
      currx,
      yPos + paddingY,
      iconSize,
      () => {
        const vol = this.musicConfig[label.toLowerCase()].volLvl;
        const newVol = Math.max(0, vol - 0.2);
        if (newVol !== vol) {
          setVolume(newVol);
          this._updateVolume(label, newVol);
        }
      }
    );
    this.musicConfig[label.toLowerCase()].volDownButton = volDown;
    currx += iconSize + paddingX;

    this.volBarConfig.volBarX = currx;
    this.volBarConfig.volBarY[label.toLowerCase()] = yPos + paddingY + iconSize * 0.2;
    this.volBarConfig.volBarHeight = iconSize * 0.6;
    const volLevelContainer = new PIXI.Container();
    this._createVolumeBar(volLevelContainer, label);
    this.container.addChild(volLevelContainer);
    this.musicConfig[label.toLowerCase()].volBar = volLevelContainer;
    currx += this.volBarConfig.totalWidth + paddingX;


    const volUp = this._createIconButton(
      'volume_up',
      currx,
      yPos + paddingY,
      iconSize,
      () => {
        const vol = this.musicConfig[label.toLowerCase()].volLvl;
        const newVol = Math.min(1, vol + 0.2);
        if (newVol !== vol) {
          setVolume(newVol);
          this._updateVolume(label, newVol);
        }
      }
    );
    currx += iconSize + paddingX * 2;
    this.musicConfig[label.toLowerCase()].volUpButton = volUp;

    const muteButton = this._createIconButton(
      this.musicConfig[label.toLowerCase()].isMuted ? 'silent':'sound',
      currx,
      yPos + paddingY,
      iconSize,
      handleMuteBtn
    );
    this.musicConfig[label.toLowerCase()].muteButton = muteButton;
  }

  /**
   * @method _createVolumeBar
   * @description Creates the volume bar for the specified label
   * @param {PIXI.Container} volContainer - Container for the volume bar
   * @param {string} label - Label for the volume bar (e.g., 'MUSIC', 'SFX')
   */
  _createVolumeBar(volContainer, label) {
    volContainer.removeChildren();
    const barCount = this.volBarConfig.barCount;

    for (let i = 0; i < barCount; i++) {
      const bar = new PIXI.Graphics();
      volContainer.addChild(bar);
    }

    this._updateVolumeBars(volContainer, label, this.musicConfig[label.toLowerCase()].volLvl);
  }

  /**
   * @method _updateVolumeBars
   * @description Updates the volume bars based on the current volume level
   * @param {PIXI.Container} volContainer - Container for the volume bar
   * @param {string} label - Label for the volume bar (e.g., 'MUSIC', 'SFX')
   * @param {number} volLevel - Current volume level (0 to 1)
   */
  _updateVolumeBars(volContainer, label, volLevel) {
    const barCount = this.volBarConfig.barCount;
    const barWidth = this.volBarConfig.barWidth;
    const gap = this.volBarConfig.gap;
    const startY = this.volBarConfig.volBarY[label.toLowerCase()];
    const volBarX = this.volBarConfig.volBarX;
    const filledBars = Math.round(volLevel * barCount);
    const height = this.volBarConfig.volBarHeight;

    volContainer.children.forEach((bar, index) => {
      bar.clear();
      if (index < filledBars) {
        bar.beginFill(0x6DE1D2);
      } else {
        bar.beginFill(0xFFFFFF);
      }
      bar.lineStyle(2, 0x2973B2);
      bar.drawRect(
        volBarX + (barWidth + gap) * index,
        startY,
        barWidth,
        height
      );
      bar.endFill();
    });
  }

  /**
   * @private
   * @method _updateVolume
   * @description Updates the volume level and redraws the volume bar
   * @param {string} label - Label for the volume control (e.g., 'MUSIC', 'SFX')
   * @param {number} newVol - New volume level (0 to 1)
   */
  _updateVolume(label, newVol) {
    const config = this.musicConfig[label.toLowerCase()];
    const volContainer = config.volBar;

    if (!volContainer || volContainer.children.length === 0) return;

    this._updateVolumeBars(volContainer, label, newVol);
    config.volLvl = newVol;
  }

  /**
   * @private
   * @method _createIconButton
   * @description Creates an icon button with hover and click effects
   * @param {string} iconName - Name of the icon texture
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {number} size - Size of the button
   * @param {function} onClick - Function to call on button click
   * @returns {PIXI.Container} - The created button container
   */
  _createIconButton(iconName, x, y, size, onClick) {
    const button = new PIXI.Container();
    button.interactive = true;
    button.buttonMode = true;

    const icon = new PIXI.Sprite(this.assets.getTexture(iconName));
    icon.width = size;
    icon.height = size;
    icon.anchor.set(0);
    button.addChild(icon);

    button.x = x;
    button.y = y;

    button.on('pointerover', () => {
      button.filters = [this.dropShadowFilter];
    });

    button.on('pointerout', () => {
      button.filters = [];
    });

    button.on('click', () => {
      this.soundManager.playButtonClick();
      onClick();
    });

    this.container.addChild(button);
    return button;
  }

  /**
   * @private
   * @method _updateMuteButton
   * @description Updates the mute button icon and state of the volume buttons and bar
   * @param {PIXI.Container} button - The mute button container
   * @param {boolean} isMuted - Whether the sound is muted
   * @param {string} label - Label for the volume control (e.g., 'MUSIC', 'SFX')
   */
  _updateMuteButton(button, isMuted, label) {
    const width = button.width;
    const height = button.height;
    button.removeChildren();
    const icon = new PIXI.Sprite(this.assets.getTexture(isMuted ? 'silent' : 'sound'));
    icon.width = width;
    icon.height = height;
    icon.anchor.set(0);
    button.addChild(icon);
    this._updateVolumeButtonsState(label, isMuted);
  }

  /**
   * @private
   * @method _updateVolumeButtonsState
   * @description Updates the state of the volume buttons and bar based on mute status
   * @param {string} label - Label for the volume control (e.g., 'MUSIC', 'SFX')
   * @param {boolean} isMuted - Whether the sound is muted
   */
  _updateVolumeButtonsState(label, isMuted) {
    const config = this.musicConfig[label];

    config.volDownButton.interactive = !isMuted;
    config.volDownButton.alpha = isMuted ? 0.5 : 1;

    config.volUpButton.interactive = !isMuted;
    config.volUpButton.alpha = isMuted ? 0.5 : 1;

    const volBar = config.volBar;
    if (volBar && volBar.children) {
      volBar.children.forEach(child => {
        child.alpha = isMuted ? 0.5 : 1;
      });
    }
  }

  /**
   * @private @async
   * @method _createExitButton
   * @description Creates the exit button to close the settings screen
   */
  async _createExitButton() {
    const iconSize = this.c_width * 0.04;
    this._createIconButton(
      'close_icon',
      this.c_width * 0.9 - iconSize * 1.5,
      this.c_height * 0.1 + iconSize * 0.5,
      iconSize,
      () => this.onCloseSetting()
    );
  }
}
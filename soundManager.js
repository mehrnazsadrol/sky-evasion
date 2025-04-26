/**
 * @file SoundManager.js
 * @description Handles all audio playback in the game
 */
export class SoundManager {
  /**
   * @param {Assets} assets - Game's asset manager
   */
  constructor(assets) {
    this.assets = assets;

    this.currentMusicIndex = 0; // Index in-game tracks
    this.currentMusic = null;
    this.isPlaying = false;

    this.musicEnabled = false;
    this.sfxEnabled = false;
    this.musicVolume = 0;
    this.sfxVolume = 0;

    this.loadSettings();
  }

  /**
   * @method loadSettings
   * @description Loads audio settings from localStorage
   */
  loadSettings() {
    this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    this.sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
    this.musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1;
    this.sfxVolume = parseFloat(localStorage.getItem('sfxVolume')) || 1;
  }

  /**
   * @method saveSettings
   * @description Saves audio settings to localStorage
   * @param {boolean} musicEnabled - Whether music is enabled
   * @param {boolean} sfxEnabled - Whether sound effects are enabled
   * @param {number} musicVolume - Music volume level (0 to 1)
   * @param {number} sfxVolume - Sound effects volume level (0 to 1)
   */
  saveSettings() {
    localStorage.setItem('musicEnabled', this.musicEnabled);
    localStorage.setItem('sfxEnabled', this.sfxEnabled);
    localStorage.setItem('musicVolume', this.musicVolume);
    localStorage.setItem('sfxVolume', this.sfxVolume);
  }

  /**
   * @method playMainMusic
   * @description Plays the main background music. used for start page and gameover screen
   */
  playMainMusic() {
    if (!this.musicEnabled) return;
    this.stopMusic();
    try {
      this.currentMusic = PIXI.sound.play('main', {
        loop: true,
        volume: this.musicVolume * this.assets.getMusicMaxVol()
      });
      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing main music:', error);
      this.currentMusic = null;
      this.isPlaying = false;
    }
  }

  /**
  * @method playGameMusic
  * @description Plays the in-game music
  */
    playGameMusic() {
      if (!this.musicEnabled) return;
  
      this.stopMusic();
      this.currentMusicIndex = 0;
      this.isPlaying = true;
      this._playNextGameTrack();
    }

  /**
 * @private
 * @method _playNextGameTrack
 * @description Plays the next track in the game music playlist
 */
  _playNextGameTrack() {
    if (!this.musicEnabled) return;

    const gameTracks = this.assets.getGameTracks();
    if (!gameTracks || gameTracks.length === 0) {
      console.error('No game tracks available');
      return;
    }

    const trackName = gameTracks[this.currentMusicIndex];
    this.stopMusic();

    this.currentMusic = PIXI.sound.play(trackName, {
      loop: false,
      volume: this.musicVolume * this.assets.getMusicMaxVol(),
      complete: () => {
        this.currentMusicIndex = (this.currentMusicIndex + 1) % gameTracks.length;
        this.playNextGameTrack();
      }
    });

    this.isPlaying = true;
  }

  /**
  * @method stopMusic
  * @description Stops the currently playing music
  */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
    this.isPlaying = false;
  }

  /**
  * @method playButtonClick
  * @description Plays the button click sound effect
  */
  playButtonClick() {
    if (!this.sfxEnabled) return;

    try {
      PIXI.sound.play('button_click', {
        volume: this.sfxVolume * this.assets.getSfxMaxVol(),
        singleInstance: true
      });
    } catch (error) {
      console.error('Error playing button click:', error);
    }
  }

  /**
   * @method playCountdown
   * @description Plays the countdown sound effects for autorun. (4x countDown1, 1x countDown2)
   */
  playCountdown() {
    if (!this.sfxEnabled) return;

    let count = 0;
    const sfxMaxVol = this.assets.getSfxMaxVol();

    const playNext = () => {
      if (!this.sfxEnabled) return;
      try {
        if (count < 4) {
          PIXI.sound.play('timer1', {
            volume: this.sfxVolume * sfxMaxVol,
            complete: playNext
          });
          count++;
        } else {
          PIXI.sound.play('timer2', {
            volume: this.sfxVolume * sfxMaxVol
          });
        }
      } catch (error) {
        console.error('Error in countdown sequence:', error);
      }
    };

    playNext();
  }

  /**
   * @method resumeMusic
   * @description Resumes the currently playing music
   */
  resumeMusic() {
    if (this.currentMusic && !this.isPlaying) {
      this.currentMusic.resume();
      this.isPlaying = true;
    }
  }

  /**
   * @method setMusicDisable
   * @description Toggle music on/off
   * @param {boolean} isMuted - Whether music is muted
   */
  setMusicDisable(isMuted) {
    this.musicEnabled = !isMuted;
    if (isMuted) {
      this.stopMusic();
    } else if (!this.isPlaying && this.currentMusic) {
      this.resumeMusic();
    }
    this.saveSettings();
  }

  /**
   * @method setSfxDisable
   * @description Toggle sound effects on/off
   * @param {boolean} isMuted - Whether sound effects is muted
   */
  setSfxDisable(isMuted) {
    this.sfxEnabled = !isMuted;
    this.saveSettings();
  }

  /**
   * @method setMusicVolume
   * @description Set music volume
   * @param {number} volume - Volume level (0 to 1)
   */
  setMusicVolume(volume) {
    const maxVol = this.assets.getMusicMaxVol();
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic && this.currentMusic.volume !== undefined) {
      this.currentMusic.volume = this.musicVolume * maxVol;
    }
    this.saveSettings();
  }

  /**
   * @method setSfxVolume
   * @description Set sound effects volume
   * @param {number} volume - Volume level (0 to 1)
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * @method getMusicVolume
   * @description Get current music volume
   * @returns {number} Current music volume
   */
  getMusicVolume() {
    return this.musicVolume;
  }

  /**
   * @method getSfxVolume
   * @description Get current sound effects volume
   * @returns {number} Current sound effects volume
   */
  getSfxVolume() {
    return this.sfxVolume;
  }

  /**
   * @method getMusicEnabled
   * @description Get whether music is enabled
   * @returns {boolean} Whether music is enabled
   */
  getMusicEnabled() {
    return this.musicEnabled;
  }

  /**
   * @method getSfxEnabled
   * @description Get whether sound effects are enabled
   * @returns {boolean} Whether sound effects are enabled
   */
  getSfxEnabled() {
    return this.sfxEnabled;
  }

  /**
   * @method getIsMainPlaying
   * @description Get whether the music is currently playing
   * @returns {boolean} Whether the music is playing
   */
  getIsMainPlaying() {
    return this.isPlaying;
  }
}

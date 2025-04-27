# Sky Evasion

![Game Screenshot](res/readme/StartScreen.png)

The city has fallen to an alien slime invasion! With streets overrun and rooftops becoming increasingly perilous, your only chance is to escape by leaping across buildings while avoiding deadly slimes. This enhanced edition features new gameplay mechanics, visual customization, and progressive difficulty.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [How to Play](#how-to-play)
- [Game Mechanics](#game-mechanics)
- [Customization](#customization)
- [Progression System](#progression-system)

## Features

### Enhanced Gameplay
- 🏃 Multiple avatar selection (boy/girl characters)
![Game Screenshot](res/readme/AvatarSelection.png)
- 🏙️ 8 unique parallax city backgrounds with different themes
![Game Screenshot](res/readme/BackgroundOptions.png)
- 💎 New gem collection system (life restoration and speed boosts)
- ❤️ Lives system with visual indicators
![Game Screenshot](res/readme/LifeLost.png)
- 🎚️ Comprehensive sound settings with volume control
![Game Screenshot](res/readme/SoundSetting.png)

### Technical Information
- 12 predefined levels with progressive difficulty
- Dynamic slime evolution system
- Optimized performance with object pooling
- Local storage for preferences and high scores

## Installation

### Using http-server
1. Install http-server (if you don't have it):  
   `npm install -g http-server`  
2. Navigate to your project folder and run:  
   `http-server -c false -p 8080`  
3. Open in your browser:  
   `http://localhost:8080` 

### Prerequisites
- npm
- Modern web browser

## 🎮 How to Play

### 🚀 Getting Started
1. **Launch the game** using one of the local server methods above
2. **Customize your experience** (avatar, background theme, sound settings)
3. **Click "Start"** to begin your escape

### 🏹️ Basic Controls
- **Right Arrow / D** → Move forward (Double tap for run)
- **Up Arrow / W** → Jump (Double tap for double jump)

### 🧩 Gameplay Elements
- **Avoid Tile Gaps** by jumping (some require double jumps)
- **Evade Slimes** that appear on rooftops
  - Blue: Static
  - Green: Moves randomly (from Level 4)
  - Red: Jumps aggressively (from Level 7)
![Game Screenshot](res/readme/GameOverOrWon.png)
- **Collect Gems**:
  - ❤️ Life Gems: Restore lost lives
  - 💎 Velocity Gems: Auto-run activated with temporary immunity
![Game Screenshot](res/readme/Timer.png)

### 🏆 Scoring System
| Action                | Points          |
|-----------------------|-----------------|
| Every Tile Passed     | +10 points      |
| Every Slime Passed    | +50 bonus       |
| Level Completion      | +300 bonus      |
| Gem Collected         | +100 bonus      |
| High score           | Saved locally   |

## Game Mechanics

### Dynamic Difficulty
- **12 Progressive Levels** with increasing challenge
- **Slime Evolution**:
  - Levels 1-3: Static blue slimes
  - Level 4: Green slimes introduced (some move randomly)
  - Level 7: Red slimes appear (double damage)
  - Level 9+: All slimes move with intense patterns

### Jump Physics
- Precise platforming with calculated jump distances
- Single jumps cover 2x minimum gap width
- Double jumps extend distance by 100%
- Gap difficulty scales with level progression

### Lives System
- Start with 2 lives
- Earn 2 lives upon completing a level
- Collision with slimes removes 1-2 lives
- Game over when all lives are lost

## Customization

### Background Themes
Choose from 8 unique cityscapes:
1. Neon Downtown (default)
2. Sunset Skyline
3. Arctic Outpost
4. Industrial Zone
5. Bright District
6. Cyber District
7. Rainy Metropolis
8. Void City

### Player Avatars
- Girl character (default)
- Boy character

### Sound Settings
- Adjustable music and SFX volume
- Mute/unmute options
- Settings persist across sessions

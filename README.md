# Sky Evasion

![Game Screenshot](res/readme-files/startPage.png)

The city has been invaded by alien slimes! You must escape through the rooftops, avoiding deadly slimes that block your path. As you run, the streets below become more infested, and the rooftops grow increasingly dangerous. Your goal is to survive as long as possible while racking up the highest score.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [How to Play](#how-to-play)

## Features

- 🏃 Multiple avatar selection
![Game Screenshot](res/readme-files/avatarSelectionPage.png)
- 🏙️ Parallax city background
![Game Screenshot](res/readme-files/gameView.png)
- ⚡ Smooth running and jumping mechanics
- 📊 Score tracking with HUD display
![Game ScreenShot](res/readme-files/gameOverScreen.png)

## Installation

### Using http-server
1. Install http-server (if you don't have it):  
    npm install -g http-server  
Navigate to your project folder and run:
    http-server -c false -p 8080  
Open in your browser:
    http://localhost:8080  

### Prerequisites
- npm
- Modern web browser

## 🎮 How to Play

### 🚀 Getting Started
1. **Launch the game** using one of the local server methods above
2. **Wait for assets to load** (you'll see the game menu)
3. **Click "Start"** to begin your run

### 🏃‍♂️ Gameplay Basics
1.	Right Arrow / D → Move forward (Double tap for run)
2.	Up Arrow / W → Jump (Double tap for double jump)
- **Avoid Tile Gaps and Slimes** by jumping over them
- **Survive as long as possible** to score points

### 🏆 Scoring System
| Action          | Points          |
|-----------------|-----------------|
| Every Tile Passed | +10 points    |
| Every Slime Passed  | +5 bonus    |
| High score      | Saved locally   |


### 🏁 Game Over
When you crash:
1. Your final score appears
2. Option to restart immediately
4. Return to main menu

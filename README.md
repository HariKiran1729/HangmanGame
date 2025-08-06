# 🎮 Hangman Game - 10 Levels

A modern, interactive hangman game with 10 challenging levels, built with HTML, CSS, and JavaScript.

## 🌟 Features

- **10 Progressive Levels**: Each level features a unique word with increasing difficulty
- **Interactive QWERTY Keyboard**: Click letters with mouse or type on your keyboard
- **Visual Hangman Display**: Beautiful SVG-based hangman drawing
- **Hint System**: Each level provides a helpful hint
- **Chance Management**: 5 chances per level to guess incorrectly
- **Admin Panel**: Host can configure words, hints, and view results
- **Results Tracking**: Secure results storage accessible only by admin
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## 🎯 How to Play

1. **Start the Game**: Click the "Start Game" button
2. **Guess Letters**: 
   - Click letters on the on-screen keyboard, OR
   - Type letters on your physical keyboard
3. **Use Hints**: Read the hint provided for each level
4. **Progress Through Levels**: Complete all 10 levels to win
5. **Watch Your Chances**: You have 5 incorrect guesses per level

## 🎮 Game Rules

- Each level has a word to guess
- You have 5 chances to make incorrect guesses
- Correct guesses reveal letters in the word
- Incorrect guesses add parts to the hangman drawing
- Complete a word to advance to the next level
- Complete all 10 levels to win the game

## 🔧 Admin Features

### Accessing Admin Panel
1. Click the "Admin Panel" button
2. Use the admin panel to:
   - Configure words and hints for all 10 levels
   - View game results (password protected)
   - Clear results history

### Default Admin Password
- **Password**: `hangman2024`
- Only the admin can view game results for privacy

### Configuring Words and Hints
1. Open Admin Panel
2. Modify words and hints for each level
3. Click "Save Configuration"
4. Changes are saved locally and persist between sessions

## 📁 File Structure

```
Hangman/
├── index.html          # Main game interface
├── style.css           # Beautiful styling and animations
├── script.js           # Game logic and functionality
└── README.md           # This documentation
```

## 🚀 Getting Started

1. **Download/Clone** the game files
2. **Open** `index.html` in any modern web browser
3. **Start Playing** immediately - no installation required!

## 💾 Data Storage

- **Game Configuration**: Stored in browser's localStorage
- **Game Results**: Stored locally and protected by admin password
- **Privacy**: All data remains on the user's device

## 🎨 Default Word List

The game comes with 10 pre-configured words and hints:

1. **JAVASCRIPT** - A popular programming language for web development
2. **COMPUTER** - Electronic device for processing data
3. **KEYBOARD** - Input device with letters and numbers
4. **INTERNET** - Global network connecting computers worldwide
5. **ALGORITHM** - Step-by-step procedure for solving problems
6. **DATABASE** - Organized collection of structured information
7. **PROGRAMMING** - Process of creating computer software
8. **CYBERSECURITY** - Protection of digital information and systems
9. **ARTIFICIAL** - Made by humans, not occurring naturally
10. **TECHNOLOGY** - Application of scientific knowledge for practical purposes

## 🔒 Security Features

- **Password Protection**: Results are protected by admin password
- **Local Storage**: All data stays on the user's device
- **No External Dependencies**: Game works completely offline

## 📱 Compatibility

- **Browsers**: Chrome, Firefox, Safari, Edge (modern versions)
- **Devices**: Desktop, laptop, tablet, mobile
- **Operating Systems**: Windows, macOS, Linux, iOS, Android

## 🎯 Admin Instructions for Host

### Setting Up Custom Words
1. Click "Admin Panel"
2. Modify the word and hint fields for each level
3. Ensure words are appropriate and challenging
4. Save configuration

### Viewing Results
1. Click "Admin Panel"
2. Enter admin password: `hangman2024`
3. Click "View Results"
4. Review player performance and statistics

### Managing Data
- Results show completion status, attempts used, and timestamps
- Clear results when needed for fresh starts
- Configuration changes apply immediately to new games

## 🏆 Scoring System

Players are tracked on:
- **Levels Completed**: How many of the 10 levels were finished
- **Attempts Used**: Number of incorrect guesses per level
- **Completion Time**: Timestamp of each game session
- **Success Rate**: Overall performance across all levels

## 🎉 Winning

Complete all 10 levels to achieve victory! The game tracks your progress and celebrates your success with special animations and messages.

---

**Enjoy playing Hangman! Good luck guessing all the words! 🎮** 
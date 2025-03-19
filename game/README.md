# SNAKE GAME

A retro-style Snake Game with real-time leaderboard.

## Features

- Classic Snake gameplay with responsive design
- Retro-style pixelated graphics
- Leaderboard system to track top scores
- Compatible with desktop and mobile devices
- Keyboard and touch/swipe controls
- Game audio with mute option

## Getting Started

### Play Without Server (Static Mode)

Simply open the `index.html` file in your web browser to play the game. The leaderboard will be stored locally in your browser.

### Run with Server (Full Features)

To enable the leaderboard server:

1. Navigate to the API folder:
```
cd game/api
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
npm start
```

4. Open your browser and go to:
```
http://localhost:3000
```

## Controls

- **Keyboard**: Arrow keys or WASD to control the snake
- **Mobile**: Swipe gestures to change direction
- **Space**: Restart game
- **P**: Pause/Resume game

## Development

### Project Structure

```
game/
├── index.html      # Main game page
├── css/            # Stylesheets
├── js/             # Game logic
│   ├── game.js     # Game controller
│   ├── snake.js    # Snake mechanics
│   ├── renderer.js # Graphics renderer
│   ├── input.js    # Input handling
│   └── audio.js    # Sound management
├── audio/          # Game sounds
└── api/            # Server-side code
    ├── server.js         # API server
    ├── leaderboard.json  # Leaderboard data storage
    └── package.json      # Server dependencies
```

### Leaderboard API Endpoints

- `GET /api/getLeaderboard` - Get top 10 scores
- `POST /api/saveScore` - Save a new score

## Credits

- Font: "Press Start 2P" - The perfect font for retro-style games
- Icons: Bootstrap Icons
- Sound effects: Created using retro game audio tools 
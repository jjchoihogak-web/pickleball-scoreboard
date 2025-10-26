const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Game state
let gameState = {
  team1: {
    name: "Team 1",
    score: 0,
    sets: [0, 0, 0] // Best of 3 sets
  },
  team2: {
    name: "Team 2", 
    score: 0,
    sets: [0, 0, 0]
  },
  currentSet: 1,
  serving: 1, // 1 or 2
  gameStatus: "ready", // ready, playing, paused, finished
  matchFormat: "best_of_3" // best_of_3, best_of_5
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/overlay', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overlay.html'));
});

app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

// API endpoints
app.get('/api/game-state', (req, res) => {
  res.json(gameState);
});

app.post('/api/update-score', (req, res) => {
  const { team, action } = req.body;
  
  if (team === 1) {
    if (action === 'increment') {
      gameState.team1.score++;
    } else if (action === 'decrement' && gameState.team1.score > 0) {
      gameState.team1.score--;
    }
  } else if (team === 2) {
    if (action === 'increment') {
      gameState.team2.score++;
    } else if (action === 'decrement' && gameState.team2.score > 0) {
      gameState.team2.score--;
    }
  }
  
  // Check for set win (first to 11, win by 2)
  checkSetWin();
  
  io.emit('gameStateUpdate', gameState);
  res.json({ success: true, gameState });
});

app.post('/api/reset-game', (req, res) => {
  gameState = {
    team1: { name: "Team 1", score: 0, sets: [0, 0, 0] },
    team2: { name: "Team 2", score: 0, sets: [0, 0, 0] },
    currentSet: 1,
    serving: 1,
    gameStatus: "ready",
    matchFormat: "best_of_3"
  };
  
  io.emit('gameStateUpdate', gameState);
  res.json({ success: true, gameState });
});

app.post('/api/update-team-names', (req, res) => {
  const { team1Name, team2Name } = req.body;
  
  if (team1Name) gameState.team1.name = team1Name;
  if (team2Name) gameState.team2.name = team2Name;
  
  io.emit('gameStateUpdate', gameState);
  res.json({ success: true, gameState });
});

app.post('/api/change-serving', (req, res) => {
  gameState.serving = gameState.serving === 1 ? 2 : 1;
  io.emit('gameStateUpdate', gameState);
  res.json({ success: true, gameState });
});

function checkSetWin() {
  const { team1, team2, currentSet } = gameState;
  
  // Pickleball scoring: first to 11, win by 2
  if (team1.score >= 11 && team1.score - team2.score >= 2) {
    team1.sets[currentSet - 1] = 1;
    nextSet();
  } else if (team2.score >= 11 && team2.score - team1.score >= 2) {
    team2.sets[currentSet - 1] = 1;
    nextSet();
  }
}

function nextSet() {
  gameState.currentSet++;
  gameState.team1.score = 0;
  gameState.team2.score = 0;
  
  // Check for match win
  const team1Sets = gameState.team1.sets.reduce((a, b) => a + b, 0);
  const team2Sets = gameState.team2.sets.reduce((a, b) => a + b, 0);
  
  if (gameState.matchFormat === "best_of_3") {
    if (team1Sets >= 2 || team2Sets >= 2) {
      gameState.gameStatus = "finished";
    }
  } else if (gameState.matchFormat === "best_of_5") {
    if (team1Sets >= 3 || team2Sets >= 3) {
      gameState.gameStatus = "finished";
    }
  }
  
  if (gameState.currentSet > 3 && gameState.matchFormat === "best_of_3") {
    gameState.gameStatus = "finished";
  } else if (gameState.currentSet > 5 && gameState.matchFormat === "best_of_5") {
    gameState.gameStatus = "finished";
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current game state to new client
  socket.emit('gameStateUpdate', gameState);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Pickleball Scoreboard Server running on port ${PORT}`);
  console.log(`Main interface: http://localhost:${PORT}`);
  console.log(`Overlay: http://localhost:${PORT}/overlay`);
  console.log(`Control panel: http://localhost:${PORT}/control`);
});

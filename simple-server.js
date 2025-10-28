const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Game state - Pickleball Doubles Format
let gameState = {
  team1: {
    name: "Team Apple",
    score: 0,
    sets: [0, 0, 0]
  },
  team2: {
    name: "Team Cherry", 
    score: 0,
    sets: [0, 0, 0]
  },
  currentSet: 1,
  servingTeam: 1,
  serveNumber: 1,
  gameStatus: "ready",
  matchFormat: "best_of_3",
  servingPlayer: "A",
  receivingPlayer: "C"
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
  
  res.json({ success: true, gameState });
});

app.post('/api/change-serving', (req, res) => {
  // In Pickleball doubles, serving alternates between teams and players
  if (gameState.serveNumber === 1) {
    // First serve failed, second serve
    gameState.serveNumber = 2;
  } else {
    // Second serve failed or point scored, switch teams
    gameState.serveNumber = 1;
    gameState.servingTeam = gameState.servingTeam === 1 ? 2 : 1;
    
    // Update serving and receiving players
    if (gameState.servingTeam === 1) {
      gameState.servingPlayer = gameState.servingPlayer === "A" ? "B" : "A";
      gameState.receivingPlayer = gameState.receivingPlayer === "C" ? "D" : "C";
    } else {
      gameState.servingPlayer = gameState.servingPlayer === "C" ? "D" : "C";
      gameState.receivingPlayer = gameState.receivingPlayer === "A" ? "B" : "A";
    }
  }
  
  res.json({ success: true, gameState });
});

app.post('/api/reset-game', (req, res) => {
  gameState = {
    team1: { name: "Team Apple", score: 0, sets: [0, 0, 0] },
    team2: { name: "Team Cherry", score: 0, sets: [0, 0, 0] },
    currentSet: 1,
    servingTeam: 1,
    serveNumber: 1,
    gameStatus: "ready",
    matchFormat: "best_of_3",
    servingPlayer: "A",
    receivingPlayer: "C"
  };
  
  res.json({ success: true, gameState });
});

app.post('/api/update-team-names', (req, res) => {
  const { team1Name, team2Name } = req.body;
  
  if (team1Name) gameState.team1.name = team1Name;
  if (team2Name) gameState.team2.name = team2Name;
  
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
  
  // Reset serving for new set
  gameState.serveNumber = 1;
  gameState.servingPlayer = "A";
  gameState.receivingPlayer = "C";
  
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

// Start server
app.listen(PORT, () => {
  console.log(`Pickleball Scoreboard Server running on port ${PORT}`);
  console.log(`Main interface: http://localhost:${PORT}`);
  console.log(`Overlay: http://localhost:${PORT}/overlay`);
  console.log(`Control panel: http://localhost:${PORT}/control`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Railway URL: ${process.env.RAILWAY_STATIC_URL || 'Not set'}`);
});

// Error handling
app.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

# 🏓 Pickleball Scoreboard Overlay Server

A real-time Pickleball scoreboard overlay system designed for streaming and live events. Built with Node.js, Express, and Socket.IO for instant score updates across multiple displays.

## ✨ Features

- **Real-time Score Updates**: WebSocket-based live score synchronization
- **Streaming Overlay**: Clean, transparent overlay perfect for OBS/streaming
- **Control Panel**: Web-based control interface for score management
- **Pickleball Rules**: Implements official Pickleball scoring (first to 11, win by 2)
- **Set Management**: Best of 3 sets with automatic set progression
- **Team Customization**: Customizable team names
- **Serving Indicator**: Visual indicator for which team is serving
- **Mobile Responsive**: Works on all devices

## 🚀 Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd pickleball-scoreboard-overlay
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

3. **Access the Application**
   - Main Page: http://localhost:3000
   - Control Panel: http://localhost:3000/control
   - Overlay: http://localhost:3000/overlay

## 🚂 Railway Deployment

This project is configured for easy deployment on [Railway](https://railway.com/).

### Method 1: Deploy from GitHub

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [Railway](https://railway.com/)
   - Click "Deploy from GitHub Repo"
   - Select your repository
   - Railway will automatically detect the Node.js app and deploy it

### Method 2: Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

### Method 3: Direct Upload

1. **Create New Project**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub Repo" or "Empty Project"

2. **Configure Environment**
   - Railway will automatically detect the Node.js configuration
   - No additional environment variables needed for basic functionality

## 📱 Usage

### For Streamers/Event Organizers

1. **Open Control Panel**: Navigate to `/control` on your deployed URL
2. **Set Team Names**: Enter team names and click "Update Names"
3. **Manage Scores**: Use +/- buttons to update scores in real-time
4. **Change Serving**: Click "Change Serving" to switch serving team
5. **Reset Game**: Use "Reset Game" to start a new match

### For Overlay Display

1. **Open Overlay**: Navigate to `/overlay` on your deployed URL
2. **Add to OBS**: Use Browser Source in OBS Studio
   - URL: `https://your-railway-url.railway.app/overlay`
   - Width: 400px
   - Height: 300px
3. **Position**: Place in top-right corner or preferred location

## 🎮 API Endpoints

### GET Endpoints
- `GET /` - Main page
- `GET /overlay` - Scoreboard overlay
- `GET /control` - Control panel
- `GET /api/game-state` - Current game state (JSON)

### POST Endpoints
- `POST /api/update-score` - Update team score
  ```json
  { "team": 1, "action": "increment" }
  ```
- `POST /api/update-team-names` - Update team names
  ```json
  { "team1Name": "Team A", "team2Name": "Team B" }
  ```
- `POST /api/change-serving` - Change serving team
- `POST /api/reset-game` - Reset entire game

## 🏓 Pickleball Rules Implementation

- **Scoring**: First to 11 points, must win by 2
- **Sets**: Best of 3 sets (configurable)
- **Serving**: Alternates between teams
- **Set Progression**: Automatic progression when set is won
- **Match Completion**: Game ends when a team wins majority of sets

## 🛠️ Technical Details

### Tech Stack
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO for WebSocket communication
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Deployment**: Railway with Docker support

### Project Structure
```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── railway.json          # Railway configuration
├── Dockerfile            # Docker configuration
├── public/               # Static files
│   ├── index.html        # Main page
│   ├── overlay.html      # Streaming overlay
│   └── control.html      # Control panel
└── README.md             # This file
```

### Environment Variables
- `PORT`: Server port (default: 3000, Railway sets automatically)

## 🎨 Customization

### Styling
- Modify CSS in HTML files to match your brand
- Overlay is designed to be transparent and stream-friendly
- Colors and fonts can be easily customized

### Scoring Rules
- Modify `checkSetWin()` function in `server.js` for different scoring rules
- Adjust set limits in game state management

## 🔧 Development

### Adding Features
1. **Backend**: Add routes in `server.js`
2. **Frontend**: Update HTML/CSS/JS in `public/` directory
3. **Real-time**: Use Socket.IO events for live updates

### Testing
```bash
# Test locally
npm start
# Open multiple browser tabs to test real-time updates
```

## 📞 Support

For issues or feature requests:
1. Check the [Railway Documentation](https://docs.railway.app/)
2. Review the code comments for implementation details
3. Test locally before deploying changes

## 📄 License

MIT License - feel free to use and modify for your events!

---

**Ready to deploy?** Push to GitHub and deploy on Railway in minutes! 🚂

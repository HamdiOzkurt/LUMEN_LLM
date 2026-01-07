# LLM Dashboard Backend

Central monitoring backend for LLM usage, cost, and performance tracking.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Setup MongoDB

```bash
# Windows (MongoDB Community kurulu ise)
net start MongoDB

# Or use MongoDB Atlas (cloud)
# Update .env with your connection string
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/llm_dashboard
NODE_ENV=development
```

### Run Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### POST /api/logs
Create a new log entry

### GET /api/logs
Get logs with filtering
```
?projectId=my-app
&provider=openai
&model=gpt-4o-mini
&status=success
&startDate=2026-01-01
&endDate=2026-01-31
&limit=100
&skip=0
```

### GET /api/metrics/summary
Get aggregated summary statistics

### GET /api/metrics/by-provider
Get breakdown by provider/model

### GET /api/metrics/timeseries
Get time-series data
```
?projectId=my-app
&interval=hour|day
```

## 🔌 WebSocket Events

```javascript
const socket = io('http://localhost:3000');

// Subscribe to project updates
socket.emit('subscribe:project', 'my-app');

// Listen for new logs
socket.on('new-log', (log) => {
  console.log('New LLM call:', log);
});
```

## 📊 Database Schema

### llm_logs Collection

```javascript
{
  id: String,              // UUID
  timestamp: Date,
  projectId: String,
  environment: String,
  provider: String,        // openai, gemini
  model: String,
  promptTokens: Number,
  completionTokens: Number,
  totalTokens: Number,
  duration: Number,        // ms
  status: String,          // success, error
  cost: Number,            // USD
  metadata: Object,
}
```

## 🛠️ Tech Stack

- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time updates
- **CORS** - Cross-origin support

## 📝 License

ISC

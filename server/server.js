import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import { createTasksRouter } from './routes/tasks.js';
import { createCategoriesRouter } from './routes/categories.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Client joins their personal user room to receive real-time sync across devices/tabs
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room user:${userId}`);
      socket.emit('joined_room', { room: `user:${userId}` });
    }
  });

  // Client leaves room
  socket.on('leave_user_room', (userId) => {
    if (userId) {
      socket.leave(`user:${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', createTasksRouter(io));
app.use('/api/categories', createCategoriesRouter(io));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TaskBuddy Realtime API',
    uptime: process.uptime()
  });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 TaskBuddy Server running on port ${PORT}`);
  console.log(`⚡ Real-time WebSockets enabled`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Web App:    http://localhost:${PORT}`);
  console.log(`=========================================`);
});


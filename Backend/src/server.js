import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import redisClient from './config/redis.js';

// Importar rutes
import boardRoutes from './routes/boardRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

// Importar gestors de Socket.IO
import { initializeSocketHandlers } from './sockets/gameHandlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Per imatges personalitzades

// Rutes API REST
app.use('/api/boards', boardRoutes);
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', redis: redisClient.isOpen });
});

// Inicialitzar gestors de WebSocket
initializeSocketHandlers(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor executant-se al port ${PORT}`);
  console.log(`📡 WebSocket disponible per comunicació en temps real`);
});

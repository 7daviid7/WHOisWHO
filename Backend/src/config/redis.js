import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Client de Redis per gestionar dades del joc
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
});

redisClient.on('error', (err) => console.error('Error de Redis:', err));
redisClient.on('connect', () => console.log('✅ Connectat a Redis'));

await redisClient.connect();

export default redisClient;

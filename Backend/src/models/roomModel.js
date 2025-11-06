import redisClient from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Model per gestionar sales de joc
 * Cada sala té dos jugadors i una partida activa
 */

export class RoomModel {
  
  // Crear una sala nova
  static async createRoom(roomData) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: roomData.name,
      boardId: roomData.boardId, // ID del tauler escollit
      maxPlayers: 2,
      players: [], // Array de jugadors
      status: 'waiting', // waiting, playing, finished
      createdAt: new Date().toISOString(),
      password: roomData.password || null // Opcional per sales privades
    };

    await redisClient.set(`room:${roomId}`, JSON.stringify(room));
    await redisClient.sAdd('rooms:all', roomId);

    return room;
  }

  // Obtenir una sala per ID
  static async getRoomById(roomId) {
    const roomData = await redisClient.get(`room:${roomId}`);
    return roomData ? JSON.parse(roomData) : null;
  }

  // Llistar totes les sales disponibles
  static async getAllRooms() {
    const roomIds = await redisClient.sMembers('rooms:all');
    const rooms = [];

    for (const id of roomIds) {
      const room = await this.getRoomById(id);
      if (room && room.status !== 'finished') rooms.push(room);
    }

    return rooms;
  }

  // Afegir un jugador a una sala
  static async addPlayerToRoom(roomId, player) {
    const room = await this.getRoomById(roomId);
    if (!room) return { success: false, message: 'Sala no trobada' };
    if (room.players.length >= room.maxPlayers) {
      return { success: false, message: 'Sala completa' };
    }

    room.players.push({
      id: player.id,
      name: player.name,
      socketId: player.socketId,
      joinedAt: new Date().toISOString()
    });

    // Si la sala està plena, iniciar la partida
    if (room.players.length === room.maxPlayers) {
      room.status = 'playing';
    }

    await redisClient.set(`room:${roomId}`, JSON.stringify(room));
    return { success: true, room };
  }

  // Eliminar un jugador d'una sala
  static async removePlayerFromRoom(roomId, playerId) {
    const room = await this.getRoomById(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    
    // Si no queden jugadors, eliminar la sala
    if (room.players.length === 0) {
      await this.deleteRoom(roomId);
      return null;
    }

    room.status = 'waiting';
    await redisClient.set(`room:${roomId}`, JSON.stringify(room));
    return room;
  }

  // Actualitzar l'estat d'una sala
  static async updateRoom(roomId, updateData) {
    const room = await this.getRoomById(roomId);
    if (!room) return null;

    const updatedRoom = {
      ...room,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await redisClient.set(`room:${roomId}`, JSON.stringify(updatedRoom));
    return updatedRoom;
  }

  // Eliminar una sala
  static async deleteRoom(roomId) {
    await redisClient.del(`room:${roomId}`);
    await redisClient.sRem('rooms:all', roomId);
    return true;
  }
}

import express from 'express';
import { RoomModel } from '../models/roomModel.js';

const router = express.Router();

// Crear una sala nova
router.post('/', async (req, res) => {
  try {
    const room = await RoomModel.createRoom(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir totes les sales
router.get('/', async (req, res) => {
  try {
    const rooms = await RoomModel.getAllRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir una sala específica
router.get('/:id', async (req, res) => {
  try {
    const room = await RoomModel.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala no trobada' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unir-se a una sala (via API REST - també disponible per WebSocket)
router.post('/:id/join', async (req, res) => {
  try {
    const { playerId, playerName } = req.body;
    const result = await RoomModel.addPlayerToRoom(req.params.id, {
      id: playerId,
      name: playerName,
      socketId: null // S'actualitzarà via WebSocket
    });
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.json(result.room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sortir d'una sala
router.post('/:id/leave', async (req, res) => {
  try {
    const { playerId } = req.body;
    const room = await RoomModel.removePlayerFromRoom(req.params.id, playerId);
    
    if (!room) {
      return res.status(200).json({ message: 'Sala eliminada' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una sala
router.delete('/:id', async (req, res) => {
  try {
    await RoomModel.deleteRoom(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

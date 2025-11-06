import express from 'express';
import { BoardModel } from '../models/boardModel.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuració de Multer per pujar imatges
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Només es permeten imatges'));
  }
});

// Crear un tauler nou
router.post('/', async (req, res) => {
  try {
    const board = await BoardModel.createBoard(req.body);
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir tots els taulers
router.get('/', async (req, res) => {
  try {
    const boards = await BoardModel.getAllBoards();
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un tauler específic
router.get('/:id', async (req, res) => {
  try {
    const board = await BoardModel.getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Tauler no trobat' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualitzar un tauler
router.put('/:id', async (req, res) => {
  try {
    const board = await BoardModel.updateBoard(req.params.id, req.body);
    if (!board) {
      return res.status(404).json({ error: 'Tauler no trobat' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un tauler
router.delete('/:id', async (req, res) => {
  try {
    await BoardModel.deleteBoard(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pujar una imatge per una carta
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No s\'ha pujat cap imatge' });
    }
    res.json({ 
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

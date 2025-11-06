import redisClient from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Model per gestionar taulers personalitzats
 * Un tauler conté cartes amb imatges i atributs
 */

export class BoardModel {
  
  // Crear un tauler nou
  static async createBoard(boardData) {
    const boardId = uuidv4();
    const board = {
      id: boardId,
      name: boardData.name,
      description: boardData.description || '',
      cards: boardData.cards, // Array de cartes amb atributs
      createdAt: new Date().toISOString(),
      createdBy: boardData.createdBy || 'anonymous'
    };

    await redisClient.set(`board:${boardId}`, JSON.stringify(board));
    await redisClient.sAdd('boards:all', boardId);

    return board;
  }

  // Obtenir un tauler per ID
  static async getBoardById(boardId) {
    const boardData = await redisClient.get(`board:${boardId}`);
    return boardData ? JSON.parse(boardData) : null;
  }

  // Llistar tots els taulers
  static async getAllBoards() {
    const boardIds = await redisClient.sMembers('boards:all');
    const boards = [];

    for (const id of boardIds) {
      const board = await this.getBoardById(id);
      if (board) boards.push(board);
    }

    return boards;
  }

  // Actualitzar un tauler
  static async updateBoard(boardId, updateData) {
    const board = await this.getBoardById(boardId);
    if (!board) return null;

    const updatedBoard = {
      ...board,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await redisClient.set(`board:${boardId}`, JSON.stringify(updatedBoard));
    return updatedBoard;
  }

  // Eliminar un tauler
  static async deleteBoard(boardId) {
    await redisClient.del(`board:${boardId}`);
    await redisClient.sRem('boards:all', boardId);
    return true;
  }
}

/**
 * Estructura d'una carta:
 * {
 *   id: string,
 *   name: string,
 *   image: string (URL o path),
 *   attributes: {
 *     attributeName: value,
 *     exemple: { barba: true, ullsBlaus: false, cabell: "castany" }
 *   }
 * }
 */

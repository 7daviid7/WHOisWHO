import redisClient from '../config/redis.js';

/**
 * Model per gestionar l'estat de les partides
 * Inclou torns, personatges secrets, cartes eliminades, etc.
 */

export class GameModel {
  
  // Crear una partida nova
  static async createGame(roomId, players, boardId) {
    const game = {
      roomId,
      boardId,
      players: {
        [players[0].id]: {
          id: players[0].id,
          name: players[0].name,
          secretCharacter: null, // S'assignarà aleatòriament
          flippedCards: [], // IDs de cartes eliminades
          hasAnswered: false
        },
        [players[1].id]: {
          id: players[1].id,
          name: players[1].name,
          secretCharacter: null,
          flippedCards: [],
          hasAnswered: false
        }
      },
      currentTurn: players[0].id, // El primer jugador comença
      turnHistory: [],
      status: 'active', // active, finished
      winner: null,
      createdAt: new Date().toISOString()
    };

    await redisClient.set(`game:${roomId}`, JSON.stringify(game));
    return game;
  }

  // Obtenir l'estat d'una partida
  static async getGame(roomId) {
    const gameData = await redisClient.get(`game:${roomId}`);
    return gameData ? JSON.parse(gameData) : null;
  }

  // Assignar personatges secrets aleatòriament
  static async assignSecretCharacters(roomId, cards) {
    const game = await this.getGame(roomId);
    if (!game) return null;

    const playerIds = Object.keys(game.players);
    
    // Seleccionar dues cartes aleatòries diferents
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    game.players[playerIds[0]].secretCharacter = shuffled[0].id;
    game.players[playerIds[1]].secretCharacter = shuffled[1].id;

    await redisClient.set(`game:${roomId}`, JSON.stringify(game));
    return game;
  }

  // Canviar el torn
  static async switchTurn(roomId) {
    const game = await this.getGame(roomId);
    if (!game) return null;

    const playerIds = Object.keys(game.players);
    const currentIndex = playerIds.indexOf(game.currentTurn);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    game.currentTurn = playerIds[nextIndex];
    
    // Resetejar l'estat de resposta
    Object.keys(game.players).forEach(pid => {
      game.players[pid].hasAnswered = false;
    });

    await redisClient.set(`game:${roomId}`, JSON.stringify(game));
    return game;
  }

  // Registrar una pregunta i resposta
  static async addTurnToHistory(roomId, turnData) {
    const game = await this.getGame(roomId);
    if (!game) return null;

    game.turnHistory.push({
      playerId: turnData.playerId,
      question: turnData.question,
      answer: turnData.answer,
      timestamp: new Date().toISOString()
    });

    // Marcar que l'oponent ha respost
    const opponentId = Object.keys(game.players).find(pid => pid !== turnData.playerId);
    if (opponentId) {
      game.players[opponentId].hasAnswered = true;
    }

    await redisClient.set(`game:${roomId}`, JSON.stringify(game));
    return game;
  }

  // Actualitzar cartes eliminades d'un jugador
  static async updateFlippedCards(roomId, playerId, cardIds) {
    const game = await this.getGame(roomId);
    if (!game || !game.players[playerId]) return null;

    game.players[playerId].flippedCards = cardIds;
    await redisClient.set(`game:${roomId}`, JSON.stringify(game));
    return game;
  }

  // Processar una aposta final
  static async processFinalGuess(roomId, playerId, guessedCardId) {
    const game = await this.getGame(roomId);
    if (!game) return null;

    const opponentId = Object.keys(game.players).find(pid => pid !== playerId);
    const opponentSecretCard = game.players[opponentId].secretCharacter;

    // Comprovar si l'aposta és correcta
    const isCorrect = guessedCardId === opponentSecretCard;

    game.status = 'finished';
    game.winner = isCorrect ? playerId : opponentId;
    game.finishedAt = new Date().toISOString();

    await redisClient.set(`game:${roomId}`, JSON.stringify(game));
    return { game, isCorrect, winner: game.winner };
  }

  // Eliminar una partida
  static async deleteGame(roomId) {
    await redisClient.del(`game:${roomId}`);
    return true;
  }
}

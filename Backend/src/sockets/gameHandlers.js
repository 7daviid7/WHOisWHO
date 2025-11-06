import { RoomModel } from '../models/roomModel.js';
import { GameModel } from '../models/gameModel.js';
import { BoardModel } from '../models/boardModel.js';

/**
 * Gestors de WebSocket per comunicació en temps real
 * Gestiona: connexions, desconnexions, torns, preguntes/respostes, apostes finals
 */

export function initializeSocketHandlers(io) {
  
  io.on('connection', (socket) => {
    console.log(`✅ Jugador connectat: ${socket.id}`);

    // 1. UNIR-SE A UNA SALA
    socket.on('joinRoom', async (data) => {
      try {
        const { roomId, playerId, playerName } = data;

        // Afegir jugador a la sala
        const result = await RoomModel.addPlayerToRoom(roomId, {
          id: playerId,
          name: playerName,
          socketId: socket.id
        });

        if (!result.success) {
          socket.emit('error', { message: result.message });
          return;
        }

        const room = result.room;
        socket.join(roomId);

        // Notificar a tots els jugadors de la sala
        io.to(roomId).emit('roomUpdate', room);

        // Si la sala està plena, iniciar la partida
        if (room.status === 'playing') {
          // Obtenir el tauler
          const board = await BoardModel.getBoardById(room.boardId);
          
          // Crear la partida
          const game = await GameModel.createGame(
            roomId,
            room.players,
            room.boardId
          );

          // Assignar personatges secrets
          await GameModel.assignSecretCharacters(roomId, board.cards);
          const updatedGame = await GameModel.getGame(roomId);

          // Enviar informació de la partida a cada jugador
          room.players.forEach(player => {
            const playerSocket = io.sockets.sockets.get(player.socketId);
            if (playerSocket) {
              playerSocket.emit('gameStart', {
                game: {
                  ...updatedGame,
                  mySecretCharacter: updatedGame.players[player.id].secretCharacter
                },
                board
              });
            }
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 2. FER UNA PREGUNTA
    socket.on('askQuestion', async (data) => {
      try {
        const { roomId, playerId, question } = data;

        const game = await GameModel.getGame(roomId);
        
        // Validar que és el torn del jugador
        if (game.currentTurn !== playerId) {
          socket.emit('error', { message: 'No és el teu torn' });
          return;
        }

        // Enviar la pregunta a l'oponent
        const opponentId = Object.keys(game.players).find(pid => pid !== playerId);
        const opponent = game.players[opponentId];
        const room = await RoomModel.getRoomById(roomId);
        const opponentPlayer = room.players.find(p => p.id === opponentId);

        if (opponentPlayer) {
          io.to(opponentPlayer.socketId).emit('questionReceived', {
            question,
            fromPlayer: playerId
          });
        }

        // Notificar al jugador que ha fet la pregunta
        socket.emit('questionSent', { question });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 3. RESPONDRE A UNA PREGUNTA
    socket.on('answerQuestion', async (data) => {
      try {
        const { roomId, playerId, question, answer } = data;

        // Registrar la pregunta i resposta a l'historial
        await GameModel.addTurnToHistory(roomId, {
          playerId: data.askedBy, // El jugador que va fer la pregunta
          question,
          answer
        });

        const room = await RoomModel.getRoomById(roomId);
        const askerPlayer = room.players.find(p => p.id === data.askedBy);

        // Enviar la resposta al jugador que va fer la pregunta
        if (askerPlayer) {
          io.to(askerPlayer.socketId).emit('answerReceived', {
            question,
            answer,
            fromPlayer: playerId
          });
        }

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 4. ACTUALITZAR CARTES ELIMINADES
    socket.on('updateFlippedCards', async (data) => {
      try {
        const { roomId, playerId, flippedCards } = data;

        await GameModel.updateFlippedCards(roomId, playerId, flippedCards);

        // Opcional: notificar a l'oponent (només el nombre de cartes)
        const game = await GameModel.getGame(roomId);
        const room = await RoomModel.getRoomById(roomId);
        
        room.players.forEach(player => {
          if (player.id !== playerId) {
            io.to(player.socketId).emit('opponentFlippedCards', {
              count: flippedCards.length
            });
          }
        });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 5. PASSAR EL TORN
    socket.on('endTurn', async (data) => {
      try {
        const { roomId, playerId } = data;

        const game = await GameModel.getGame(roomId);
        
        // Validar que és el torn del jugador
        if (game.currentTurn !== playerId) {
          socket.emit('error', { message: 'No és el teu torn' });
          return;
        }

        // Canviar el torn
        const updatedGame = await GameModel.switchTurn(roomId);

        // Notificar a tots els jugadors
        io.to(roomId).emit('turnChanged', {
          currentTurn: updatedGame.currentTurn,
          turnHistory: updatedGame.turnHistory
        });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 6. FER L'APOSTA FINAL
    socket.on('makeFinalGuess', async (data) => {
      try {
        const { roomId, playerId, guessedCardId } = data;

        const result = await GameModel.processFinalGuess(roomId, playerId, guessedCardId);

        // Notificar a tots els jugadors del resultat
        io.to(roomId).emit('gameEnd', {
          winner: result.winner,
          isCorrect: result.isCorrect,
          guesser: playerId,
          game: result.game
        });

        // Actualitzar l'estat de la sala
        await RoomModel.updateRoom(roomId, { status: 'finished' });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 7. SORTIR D'UNA SALA
    socket.on('leaveRoom', async (data) => {
      try {
        const { roomId, playerId } = data;

        const room = await RoomModel.removePlayerFromRoom(roomId, playerId);

        if (room) {
          // Notificar als altres jugadors
          io.to(roomId).emit('playerLeft', { playerId, room });
        } else {
          // La sala s'ha eliminat
          io.to(roomId).emit('roomClosed');
        }

        socket.leave(roomId);

        // Eliminar també la partida si existia
        await GameModel.deleteGame(roomId);

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 8. DESCONNEXIÓ
    socket.on('disconnect', async () => {
      console.log(`❌ Jugador desconnectat: ${socket.id}`);
      
      // Buscar i eliminar el jugador de totes les sales
      const rooms = await RoomModel.getAllRooms();
      
      for (const room of rooms) {
        const player = room.players.find(p => p.socketId === socket.id);
        
        if (player) {
          const updatedRoom = await RoomModel.removePlayerFromRoom(room.id, player.id);
          
          if (updatedRoom) {
            io.to(room.id).emit('playerLeft', { playerId: player.id, room: updatedRoom });
          } else {
            io.to(room.id).emit('roomClosed');
          }
          
          await GameModel.deleteGame(room.id);
        }
      }
    });
  });
}

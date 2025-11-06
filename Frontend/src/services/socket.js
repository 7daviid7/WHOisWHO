import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Connectat al servidor');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Desconnectat del servidor');
      });

      this.socket.on('error', (error) => {
        console.error('Error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Unir-se a una sala
  joinRoom(roomId, playerId, playerName) {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomId, playerId, playerName });
    }
  }

  // Fer una pregunta
  askQuestion(roomId, playerId, question) {
    if (this.socket) {
      this.socket.emit('askQuestion', { roomId, playerId, question });
    }
  }

  // Respondre una pregunta
  answerQuestion(roomId, playerId, question, answer, askedBy) {
    if (this.socket) {
      this.socket.emit('answerQuestion', { roomId, playerId, question, answer, askedBy });
    }
  }

  // Actualitzar cartes eliminades
  updateFlippedCards(roomId, playerId, flippedCards) {
    if (this.socket) {
      this.socket.emit('updateFlippedCards', { roomId, playerId, flippedCards });
    }
  }

  // Passar el torn
  endTurn(roomId, playerId) {
    if (this.socket) {
      this.socket.emit('endTurn', { roomId, playerId });
    }
  }

  // Fer l'aposta final
  makeFinalGuess(roomId, playerId, guessedCardId) {
    if (this.socket) {
      this.socket.emit('makeFinalGuess', { roomId, playerId, guessedCardId });
    }
  }

  // Sortir de la sala
  leaveRoom(roomId, playerId) {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId, playerId });
    }
  }

  // Escoltar events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();

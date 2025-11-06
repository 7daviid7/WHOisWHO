import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardService } from '../services/api';
import socketService from '../services/socket';
import './GameRoom.css';

function GameRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [playerId] = useState(localStorage.getItem('playerId'));
  const [playerName] = useState(localStorage.getItem('playerName'));
  const [board, setBoard] = useState(null);
  const [game, setGame] = useState(null);
  const [mySecretCharacter, setMySecretCharacter] = useState(null);
  const [flippedCards, setFlippedCards] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [turnHistory, setTurnHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!playerId || !playerName) {
      navigate('/rooms');
      return;
    }

    // Connectar WebSocket
    socketRef.current = socketService.connect();

    // Unir-se a la sala
    socketService.joinRoom(roomId, playerId, playerName);

    // Escoltar events
    socketService.on('roomUpdate', handleRoomUpdate);
    socketService.on('gameStart', handleGameStart);
    socketService.on('questionReceived', handleQuestionReceived);
    socketService.on('questionSent', handleQuestionSent);
    socketService.on('answerReceived', handleAnswerReceived);
    socketService.on('turnChanged', handleTurnChanged);
    socketService.on('gameEnd', handleGameEnd);
    socketService.on('playerLeft', handlePlayerLeft);
    socketService.on('error', handleError);

    return () => {
      socketService.leaveRoom(roomId, playerId);
      socketService.off('roomUpdate', handleRoomUpdate);
      socketService.off('gameStart', handleGameStart);
      socketService.off('questionReceived', handleQuestionReceived);
      socketService.off('questionSent', handleQuestionSent);
      socketService.off('answerReceived', handleAnswerReceived);
      socketService.off('turnChanged', handleTurnChanged);
      socketService.off('gameEnd', handleGameEnd);
      socketService.off('playerLeft', handlePlayerLeft);
      socketService.off('error', handleError);
    };
  }, [roomId, playerId, playerName, navigate]);

  const handleRoomUpdate = (room) => {
    showToast(`Jugadors: ${room.players.length}/${room.maxPlayers}`, 'info');
  };

  const handleGameStart = async (data) => {
    setGame(data.game);
    setMySecretCharacter(data.game.mySecretCharacter);
    setBoard(data.board);
    showToast('La partida ha començat!', 'success');
  };

  const handleQuestionReceived = (data) => {
    setPendingQuestion(data);
    showToast(`Pregunta de ${data.fromPlayer}: ${data.question}`, 'info');
  };

  const handleQuestionSent = (data) => {
    showToast('Pregunta enviada. Esperant resposta...', 'info');
  };

  const handleAnswerReceived = (data) => {
    const answerText = data.answer ? 'Sí' : 'No';
    showToast(`Resposta: ${answerText}`, 'success');
    setTurnHistory(prev => [...prev, {
      question: data.question,
      answer: data.answer
    }]);
  };

  const handleTurnChanged = (data) => {
    setGame(prev => ({ ...prev, currentTurn: data.currentTurn }));
    setTurnHistory(data.turnHistory);
    const isMyTurn = data.currentTurn === playerId;
    showToast(isMyTurn ? 'És el teu torn!' : 'Torn de l\'oponent', 'info');
  };

  const handleGameEnd = (data) => {
    setGameOver(true);
    setWinner(data.winner);
    const didIWin = data.winner === playerId;
    showToast(didIWin ? '🎉 Has guanyat!' : '😢 Has perdut', didIWin ? 'success' : 'error');
  };

  const handlePlayerLeft = () => {
    showToast('L\'altre jugador ha sortit', 'error');
    setTimeout(() => navigate('/rooms'), 3000);
  };

  const handleError = (error) => {
    showToast(error.message, 'error');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAskQuestion = () => {
    if (!currentQuestion.trim()) return;
    if (game.currentTurn !== playerId) {
      showToast('No és el teu torn!', 'error');
      return;
    }

    socketService.askQuestion(roomId, playerId, currentQuestion);
    setCurrentQuestion('');
  };

  const handleAnswerQuestion = (answer) => {
    if (!pendingQuestion) return;

    socketService.answerQuestion(
      roomId,
      playerId,
      pendingQuestion.question,
      answer,
      pendingQuestion.fromPlayer
    );

    setPendingQuestion(null);
  };

  const handleFlipCard = (cardId) => {
    if (cardId === mySecretCharacter) {
      showToast('No pots eliminar el teu personatge secret!', 'error');
      return;
    }

    const newFlippedCards = flippedCards.includes(cardId)
      ? flippedCards.filter(id => id !== cardId)
      : [...flippedCards, cardId];

    setFlippedCards(newFlippedCards);
    socketService.updateFlippedCards(roomId, playerId, newFlippedCards);
  };

  const handleEndTurn = () => {
    if (game.currentTurn !== playerId) {
      showToast('No és el teu torn!', 'error');
      return;
    }

    socketService.endTurn(roomId, playerId);
  };

  const handleFinalGuess = (cardId) => {
    if (game.currentTurn !== playerId) {
      showToast('No és el teu torn!', 'error');
      return;
    }

    const confirmed = window.confirm('Estàs segur que vols fer l\'aposta final? Si falles, perdràs!');
    if (confirmed) {
      socketService.makeFinalGuess(roomId, playerId, cardId);
    }
  };

  if (!board || !game) {
    return <div className="loading">Carregant joc...</div>;
  }

  const isMyTurn = game.currentTurn === playerId;
  const mySecretCard = board.cards.find(c => c.id === mySecretCharacter);

  return (
    <div className="game-room">
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div className="game-header">
        <div className="game-info">
          <h2>🎮 {board.name}</h2>
          <div className={`turn-indicator ${isMyTurn ? 'my-turn' : ''}`}>
            {isMyTurn ? '✨ És el teu torn!' : '⏳ Torn de l\'oponent'}
          </div>
        </div>

        {mySecretCard && (
          <div className="secret-character">
            <h3>El teu personatge secret:</h3>
            <div className="secret-card">
              <img src={mySecretCard.image} alt={mySecretCard.name} />
              <p>{mySecretCard.name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="game-content">
        <div className="board-section">
          <h3>Tauler de Cartes</h3>
          <div className="cards-grid">
            {board.cards.map(card => (
              <div
                key={card.id}
                className={`game-card ${flippedCards.includes(card.id) ? 'flipped' : ''} ${card.id === mySecretCharacter ? 'secret' : ''}`}
                onClick={() => !gameOver && handleFlipCard(card.id)}
              >
                <img src={card.image} alt={card.name} />
                <p className="card-name">{card.name}</p>
                {!gameOver && isMyTurn && card.id !== mySecretCharacter && (
                  <button 
                    className="guess-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFinalGuess(card.id);
                    }}
                  >
                    🎯 Apostar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="interaction-section">
          {pendingQuestion ? (
            <div className="question-panel">
              <h3>Pregunta Rebuda:</h3>
              <p className="question-text">{pendingQuestion.question}</p>
              <div className="answer-buttons">
                <button className="primary" onClick={() => handleAnswerQuestion(true)}>
                  ✅ Sí
                </button>
                <button className="danger" onClick={() => handleAnswerQuestion(false)}>
                  ❌ No
                </button>
              </div>
            </div>
          ) : (
            <div className="question-panel">
              <h3>Fer una Pregunta:</h3>
              <textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Escriu una pregunta que es pugui respondre amb Sí o No..."
                disabled={!isMyTurn || gameOver}
              />
              <div className="question-actions">
                <button 
                  className="primary"
                  onClick={handleAskQuestion}
                  disabled={!isMyTurn || !currentQuestion.trim() || gameOver}
                >
                  📤 Enviar Pregunta
                </button>
                <button 
                  className="secondary"
                  onClick={handleEndTurn}
                  disabled={!isMyTurn || gameOver}
                >
                  ⏭️ Passar Torn
                </button>
              </div>
            </div>
          )}

          <div className="history-panel">
            <h3>Historial de Torns:</h3>
            <div className="history-list">
              {turnHistory.length === 0 ? (
                <p className="empty-history">Encara no hi ha preguntes</p>
              ) : (
                turnHistory.map((turn, index) => (
                  <div key={index} className="history-item">
                    <p className="history-question">❓ {turn.question}</p>
                    <p className={`history-answer ${turn.answer ? 'yes' : 'no'}`}>
                      {turn.answer ? '✅ Sí' : '❌ No'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-modal">
          <div className="game-over-content">
            <h2>{winner === playerId ? '🎉 Has Guanyat!' : '😢 Has Perdut'}</h2>
            <button className="primary" onClick={() => navigate('/rooms')}>
              Tornar a Sales
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameRoom;

import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { Login } from './components/Login';
import { RoomBrowser } from './components/RoomBrowser';
import { WaitingScreen } from './components/WaitingScreen';
import { GameOverModal } from './components/GameOverModal';
import { GameBoard } from './components/GameBoard';
import { CharacterCard } from './components/CharacterCard';
import { Character, GameState, PredefinedQuestion } from './types';

function App() {
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [predefinedQuestions, setPredefinedQuestions] = useState<PredefinedQuestion[]>([]);
  const [eliminatedIds, setEliminatedIds] = useState<number[]>([]);
  const [mySecret, setMySecret] = useState<Character | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [showLogs, setShowLogs] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  
  // Question State
  const [selectedAttr, setSelectedAttr] = useState<string>('gender');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [showPredefinedQuestions, setShowPredefinedQuestions] = useState(false);
  
  // Incoming Question State
  const [incomingQuestion, setIncomingQuestion] = useState<{question: string, attribute: string, value: any} | null>(null);

  // Timer effect
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || !gameState.turnStartTime || !gameState.turnTimeLimit) {
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - gameState.turnStartTime!) / 1000);
      const remaining = Math.max(0, gameState.turnTimeLimit! - elapsed);
      setTimeRemaining(remaining);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [gameState?.turnStartTime, gameState?.turn, gameState?.status]);

  useEffect(() => {
    fetch('/api/characters')
      .then(res => res.json())
      .then(data => setCharacters(data));

    fetch('/api/predefined-questions')
      .then(res => res.json())
      .then(data => setPredefinedQuestions(data));

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRoomUpdate(room: GameState) {
      setGameState(room);
    }

    function onSecretCharacter(char: Character) {
      setMySecret(char);
    }

    function onGameStarted(room: GameState) {
      setGameState(room);
      setLogs(prev => [...prev, "Partida Començada!"]);
    }

    function onReceiveQuestion(data: {question: string, attribute: string, value: any}) {
      setIncomingQuestion(data);
    }

    function onReceiveAnswer(data: {answer: boolean, attribute: string, value: any, from: string}) {
        const answerText = data.answer ? "SÍ" : "NO";
        setLogs(prev => [...prev, `Resposta: ${answerText}`]);
    }

    function onGameOver(data: {winner: string, reason: string}) {
        setGameState(prev => prev ? {...prev, status: 'finished', winner: data.winner, reason: data.reason} as any : null);
    }

    function onStatsUpdate(data: {wins: number, losses: number}) {
        if (!data) return;
        setWins(data.wins || 0);
        setLosses(data.losses || 0);
    }

    function onTurnTimeout(data: {playerId: string}) {
        setLogs(prev => [...prev, `⏰ Temps esgotat!`]);
    }

    function onLifeLost(data: {livesRemaining: number}) {
        setLogs(prev => [...prev, `💔 Has perdut una vida! Vides restants: ${data.livesRemaining}`]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room_update', onRoomUpdate);
    socket.on('secret_character', onSecretCharacter);
    socket.on('game_started', onGameStarted);
    socket.on('receive_question', onReceiveQuestion);
    socket.on('receive_answer', onReceiveAnswer);
    socket.on('game_over', onGameOver);
    socket.on('turn_timeout', onTurnTimeout);
    socket.on('life_lost', onLifeLost);
    socket.on('stats_update', onStatsUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_update', onRoomUpdate);
      socket.off('secret_character', onSecretCharacter);
      socket.off('game_started', onGameStarted);
      socket.off('receive_question', onReceiveQuestion);
      socket.off('receive_answer', onReceiveAnswer);
      socket.off('game_over', onGameOver);
      socket.off('turn_timeout', onTurnTimeout);
            socket.off('life_lost', onLifeLost);
        socket.off('stats_update', onStatsUpdate);
    };
  }, []);

  const handleLogin = (name: string) => {
      setUsername(name);
  };

    // Load persistent stats when username is set (after login)
    useEffect(() => {
        if (!username) return;
        fetch(`/api/stats/${encodeURIComponent(username)}`)
            .then(res => res.json())
            .then(data => {
                if (data && typeof data === 'object') {
                    setWins(data.wins || 0);
                    setLosses(data.losses || 0);
                }
            }).catch(err => {
                console.warn('Could not load stats:', err);
            });
    }, [username]);

    const joinRoom = (roomId: string, config?: any) => {
    socket.connect();
        socket.emit('join_room', { roomId, username, config });
  };

  const toggleEliminate = (id: number) => {
    setEliminatedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const formatQuestion = (attr: string, val: any) => {
      switch(attr) {
          case 'gender': return `El teu personatge és ${val}?`;
          case 'hairColor': return `El teu personatge té el cabell ${val}?`;
          case 'eyeColor': return `El teu personatge té els ulls de color ${val}?`;
          case 'hasBeard': return val === 'true' ? `El teu personatge té barba?` : `El teu personatge no té barba?`;
          case 'hasGlasses': return val === 'true' ? `El teu personatge porta ulleres?` : `El teu personatge no porta ulleres?`;
          case 'hasHat': return val === 'true' ? `El teu personatge porta barret?` : `El teu personatge no porta barret?`;
          default: return `El teu personatge té ${attr} ${val}?`;
      }
  };

  const askQuestion = () => {
    if (!gameState || gameState.turn !== socket.id) return;
    const question = formatQuestion(selectedAttr, selectedValue);
    socket.emit('ask_question', { 
        roomId: gameState.roomId, 
        question, 
        attribute: selectedAttr, 
        value: selectedValue 
    });
    setLogs(prev => [...prev, `Has preguntat: ${question}`]);
  };

  const askPredefinedQuestion = (q: PredefinedQuestion) => {
    if (!gameState || gameState.turn !== socket.id) return;
    socket.emit('ask_question', {
        roomId: gameState.roomId,
        question: q.question,
        attribute: q.attribute,
        value: q.value
    });
    setLogs(prev => [...prev, `Has preguntat: ${q.question}`]);
    setShowPredefinedQuestions(false);
  };

  const answerQuestion = (answer: boolean) => {
    if (!gameState || !incomingQuestion) return;
    socket.emit('answer_question', {
        roomId: gameState.roomId,
        answer,
        attribute: incomingQuestion.attribute,
        value: incomingQuestion.value
    });
    setIncomingQuestion(null);
  };

  const guessCharacter = (charId: number) => {
      if (!gameState || gameState.turn !== socket.id) return;
      if (confirm("Estàs segur que vols fer l'intent final? Si falles, perds!")) {
          socket.emit('guess_character', { roomId: gameState.roomId, characterId: charId });
      }
  };

  const restartGame = () => {
      setGameState(null);
      setEliminatedIds([]);
      setMySecret(undefined);
      setLogs([]);
      setIncomingQuestion(null);
      // Optionally disconnect or stay connected to lobby
      // For now, let's go back to lobby
      // socket.disconnect(); // Keep connection for lobby updates?
  };

  if (!username) {
      return <Login onLogin={handleLogin} />;
  }

  if (!gameState) {
        return <RoomBrowser onJoinRoom={joinRoom} wins={wins} losses={losses} />;
  }

  if (gameState.status === 'waiting') {
      return <WaitingScreen />;
  }

  const isMyTurn = gameState.turn === socket.id;
  const opponent = gameState.players.find(p => p.id !== socket.id);
  const opponentName = opponent?.name || 'Rival';
    const myPlayer = gameState.players.find(p => p.id === socket.id);
    const myLives = myPlayer?.lives;
    const opponentLives = opponent?.lives;

  return (
    <div style={{ 
        padding: '0', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', 
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column'
    }}>
      {gameState.status === 'finished' && (
          <GameOverModal 
            winner={gameState.winner === socket.id ? username : opponentName} 
            isMe={gameState.winner === socket.id}
            reason={(gameState as any).reason || 'Partida Acabada'}
            onRestart={restartGame}
          />
      )}

      {/* Top Navigation Bar */}
      <div style={{
          background: 'linear-gradient(90deg, #0f1729 0%, #1a2847 100%)',
          padding: '10px 16px',
          borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0,
          zIndex: 100
      }}>
          {/* Left Info: Players and Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div>
                  <h3 style={{ 
                      color: '#FFD700',
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 'bold'
                  }}>
                      🎮 {gameState.roomId}
                  </h3>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {/* Your Stats */}
                  <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: 'rgba(74, 144, 226, 0.2)',
                      borderRadius: '6px',
                      border: '1px solid rgba(74, 144, 226, 0.5)'
                  }}>
                      <span style={{ color: '#ecf0f1', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {username}
                      </span>
                      {gameState.config?.mode === 'lives' && (
                          <span style={{ fontSize: '1rem' }}>
                              {Array.from({ length: myLives || 0 }).map(() => '❤️').join('')}
                              {Array.from({ length: 2 - (myLives || 0) }).map(() => '🖤').join('')}
                          </span>
                      )}
                  </div>

                  {/* VS */}
                  <span style={{ color: '#FFD700', fontWeight: 'bold' }}>VS</span>

                  {/* Opponent Stats */}
                  <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: 'rgba(231, 76, 60, 0.2)',
                      borderRadius: '6px',
                      border: '1px solid rgba(231, 76, 60, 0.5)'
                  }}>
                      <span style={{ color: '#ecf0f1', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {opponentName}
                      </span>
                      {gameState.config?.mode === 'lives' && (
                          <span style={{ fontSize: '1rem' }}>
                              {Array.from({ length: opponentLives || 0 }).map(() => '❤️').join('')}
                              {Array.from({ length: 2 - (opponentLives || 0) }).map(() => '🖤').join('')}
                          </span>
                      )}
                  </div>
              </div>
          </div>

          {/* Center: Turn and Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                  padding: '6px 14px',
                  background: isMyTurn ? 'linear-gradient(135deg, rgba(39, 174, 96, 0.3), rgba(46, 204, 113, 0.3))' : 'linear-gradient(135deg, rgba(149, 165, 166, 0.3), rgba(108, 117, 125, 0.3))',
                  border: `2px solid ${isMyTurn ? '#27ae60' : '#95a5a6'}`,
                  borderRadius: '6px',
                  color: isMyTurn ? '#2ecc71' : '#bdc3c7',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  textAlign: 'center'
              }}>
                  {isMyTurn ? '⏰ TU TORN' : '⌛ TORN RIVAL'}
              </div>

              <div style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: timeRemaining <= 10 ? '#e74c3c' : '#FFD700',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                  animation: timeRemaining <= 10 ? 'pulse 1s infinite' : 'none',
                  minWidth: '50px',
                  textAlign: 'center'
              }}>
                  {timeRemaining}s
              </div>

              {/* Mini timer bar */}
              <div style={{
                  width: '80px',
                  height: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.2)'
              }}>
                  <div style={{
                      height: '100%',
                      width: `${(timeRemaining / (gameState.turnTimeLimit || 60)) * 100}%`,
                      backgroundColor: timeRemaining <= 10 ? '#e74c3c' : timeRemaining <= 30 ? '#f39c12' : '#27ae60',
                      transition: 'width 0.1s linear'
                  }}></div>
              </div>
          </div>

          {/* Right: Game Mode and Game Log */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {gameState.config && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{
                          backgroundColor: '#9b59b6',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                      }}>
                          {gameState.config.mode === 'hardcore' && '⚡ HARDCORE'}
                          {gameState.config.mode === 'lives' && '❤️ VIDES'}
                      </span>
                  </div>
              )}
          </div>
      </div>

      {/* Incoming Question - Modal Overlay */}
      {incomingQuestion && (
          <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(3px)'
          }}>
              <div style={{
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  padding: '30px 40px',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  border: '2px solid #FFD700',
                  textAlign: 'center',
                  maxWidth: '500px',
                  animation: 'slideIn 0.3s ease-out'
              }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❓</div>
                  <h2 style={{
                      color: '#FFD700',
                      margin: '0 0 12px 0',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                  }}>
                      El rival pregunta:
                  </h2>
                  <p style={{
                      color: '#ecf0f1',
                      fontSize: '1.1rem',
                      margin: '0 0 24px 0',
                      lineHeight: '1.6'
                  }}>
                      {incomingQuestion.question}
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      <button onClick={() => answerQuestion(true)} style={{
                          padding: '12px 35px',
                          backgroundColor: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          boxShadow: '0 4px 12px rgba(39, 174, 96, 0.4)',
                          transition: 'all 0.2s',
                          transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                          ✓ SÍ
                      </button>
                      <button onClick={() => answerQuestion(false)} style={{
                          padding: '12px 35px',
                          backgroundColor: '#c0392b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          boxShadow: '0 4px 12px rgba(192, 57, 43, 0.4)',
                          transition: 'all 0.2s',
                          transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                          ✗ NO
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Game Area with 3-column layout */}
      <div style={{
          flex: 1,
          display: 'flex',
          gap: '12px',
          padding: '12px',
          minHeight: 0,
          overflow: 'hidden'
      }}>
          {/* Left Sidebar - Controls */}
          <div style={{
              width: '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflow: 'auto',
              flexShrink: 0
          }}>
              {/* Turn Controls */}
              {isMyTurn && !incomingQuestion && (
                  <div style={{
                      background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a7f 100%)',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '2px solid rgba(74, 144, 226, 0.5)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                  }}>
                      <h3 style={{
                          color: '#FFD700',
                          margin: '0 0 12px 0',
                          fontSize: '0.95rem',
                          fontWeight: 'bold'
                      }}>
                          💭 Hacer Pregunta
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <select 
                              value={selectedAttr} 
                              onChange={e => setSelectedAttr(e.target.value)}
                              style={{
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #555',
                                  fontSize: '0.85rem',
                                  fontWeight: 'bold',
                                  backgroundColor: '#2c3e50',
                                  color: 'white',
                                  cursor: 'pointer'
                              }}
                          >
                              <option value="gender">👤 Gènere</option>
                              <option value="hairColor">💇 Cabell</option>
                              <option value="eyeColor">👁️ Ulls</option>
                              <option value="hasBeard">🧔 Barba</option>
                              <option value="hasGlasses">👓 Ulleres</option>
                              <option value="hasHat">🎩 Barret</option>
                          </select>

                          {['gender', 'hairColor', 'eyeColor'].includes(selectedAttr) ? (
                              <input 
                                  type="text" 
                                  placeholder="Valor (p.e. Noia, Marró)" 
                                  value={selectedValue} 
                                  onChange={e => setSelectedValue(e.target.value)}
                                  style={{
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #555',
                                      fontSize: '0.85rem',
                                      backgroundColor: '#2c3e50',
                                      color: '#ecf0f1'
                                  }}
                              />
                          ) : (
                              <select 
                                  value={selectedValue} 
                                  onChange={e => setSelectedValue(e.target.value)}
                                  style={{
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #555',
                                      fontSize: '0.85rem',
                                      fontWeight: 'bold',
                                      backgroundColor: '#2c3e50',
                                      color: 'white',
                                      cursor: 'pointer'
                                  }}
                              >
                                  <option value="">Selecciona...</option>
                                  <option value="true">✓ Sí</option>
                                  <option value="false">✗ No</option>
                              </select>
                          )}

                          <button onClick={askQuestion} style={{
                              padding: '10px',
                              backgroundColor: '#27ae60',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)',
                              transition: 'all 0.2s',
                              transform: 'scale(1)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                              ❓ Preguntar
                          </button>

                          <button 
                              onClick={() => setShowPredefinedQuestions(!showPredefinedQuestions)}
                              style={{
                                  padding: '10px',
                                  backgroundColor: '#9b59b6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem',
                                  boxShadow: '0 4px 10px rgba(155, 89, 182, 0.3)',
                                  transition: 'all 0.2s',
                                  transform: 'scale(1)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                              📝 Preguntes Ràpides
                          </button>
                      </div>

                      {/* Predefined Questions Collapse */}
                      {showPredefinedQuestions && (
                          <div style={{
                              marginTop: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              maxHeight: '150px',
                              overflowY: 'auto'
                          }}>
                              {predefinedQuestions.slice(0, 5).map(q => (
                                  <button
                                      key={q.id}
                                      onClick={() => askPredefinedQuestion(q)}
                                      style={{
                                          padding: '8px',
                                          backgroundColor: '#34495e',
                                          border: '1px solid #4a90e2',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.75rem',
                                          color: '#ecf0f1',
                                          transition: 'all 0.2s',
                                          textAlign: 'left'
                                      }}
                                      onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = '#4a90e2';
                                          e.currentTarget.style.color = 'white';
                                      }}
                                      onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = '#34495e';
                                          e.currentTarget.style.color = '#ecf0f1';
                                      }}
                                  >
                                      {q.question.substring(0, 25)}...
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              )}

              {/* Guess Final Character */}
              {isMyTurn && (
                  <div style={{
                      background: 'linear-gradient(135deg, #5a3a2a 0%, #7a4a2a 100%)',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '2px solid rgba(230, 126, 34, 0.5)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                  }}>
                      <h3 style={{
                          color: '#FFD700',
                          margin: '0 0 10px 0',
                          fontSize: '0.95rem',
                          fontWeight: 'bold'
                      }}>
                          🎯 Intent Final
                      </h3>

                      <select id="guessSelect" style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #555',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          backgroundColor: '#2c3e50',
                          color: 'white',
                          cursor: 'pointer',
                          marginBottom: '8px'
                      }}>
                          {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>

                      <button onClick={() => {
                          const select = document.getElementById('guessSelect') as HTMLSelectElement;
                          guessCharacter(parseInt(select.value));
                      }} style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#c0392b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 10px rgba(192, 57, 43, 0.3)',
                          transition: 'all 0.2s',
                          transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                          🎲 Endevinar
                      </button>

                      <p style={{
                          color: '#FFD700',
                          fontSize: '0.7rem',
                          margin: '8px 0 0 0',
                          textAlign: 'center',
                          fontWeight: 'bold'
                      }}>
                          ⚠️ Si falles, perds!
                      </p>
                  </div>
              )}

              {/* Game Log */}
              <div style={{
                  background: '#1a2838',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,215,0,0.2)',
                  flex: showLogs ? 1 : 'auto',
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: showLogs ? '100%' : '40px'
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{
                          color: '#FFD700',
                          margin: '0',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                      }}>
                          📋 Registre
                      </h4>
                      <button onClick={() => setShowLogs(!showLogs)} style={{
                          background: 'none',
                          border: 'none',
                          color: '#FFD700',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          padding: '4px 8px'
                      }}>
                          {showLogs ? '−' : '+'}
                      </button>
                  </div>
                  <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      fontSize: '0.75rem',
                      color: '#bdc3c7'
                  }}>
                      {logs.length === 0 ? (
                          <p style={{ color: '#7f8c8d', textAlign: 'center', margin: 0 }}>
                              -
                          </p>
                      ) : (
                          logs.slice(-15).map((l, i) => (
                              <div key={i} style={{
                                  padding: '4px 0',
                                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                                  lineHeight: '1.3'
                              }}>
                                  {l}
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>

          {/* Center - Game Board */}
          <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              overflow: 'auto'
          }}>
              <GameBoard 
                  characters={characters} 
                  eliminatedIds={eliminatedIds} 
                  onToggleEliminate={(id) => {
                      toggleEliminate(id);
                  }}
                  secretCharacter={mySecret}
                  playerColor="blue"
              />
          </div>

          {/* Right Sidebar - Stats & Info */}
          <div style={{
              width: showRightSidebar ? '200px' : '40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflow: 'auto',
              flexShrink: 0,
              transition: 'width 0.3s ease',
              position: 'relative'
          }}>
              {/* Toggle button */}
              <button onClick={() => setShowRightSidebar(!showRightSidebar)} style={{
                  position: 'absolute',
                  top: '8px',
                  right: '4px',
                  background: 'linear-gradient(135deg, #2a3a5a 0%, #1a2a4a 100%)',
                  border: '1px solid rgba(100, 150, 200, 0.3)',
                  color: '#4a90e2',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  padding: '6px 6px',
                  borderRadius: '6px',
                  zIndex: 10
              }}>
                  {showRightSidebar ? '→' : '←'}
              </button>
              
              {showRightSidebar && (
                  <>
                  {/* Player Stats */}
              <div style={{
                  background: 'linear-gradient(135deg, #1e4620 0%, #2a5a2a 100%)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(46, 204, 113, 0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                  <h4 style={{
                      color: '#2ecc71',
                      margin: '0 0 10px 0',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                  }}>
                      📊 Estadístiques
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: '#ecf0f1'
                      }}>
                          <span>Victòries:</span>
                          <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>{wins}</span>
                      </div>
                      <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: '#ecf0f1'
                      }}>
                          <span>Derrotes:</span>
                          <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>{losses}</span>
                      </div>
                      <div style={{
                          height: '1px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          margin: '5px 0'
                      }}></div>
                      <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: '#ecf0f1',
                          fontWeight: 'bold'
                      }}>
                          <span>Win Rate:</span>
                          <span style={{ color: '#FFD700' }}>
                              {wins + losses === 0 ? '0%' : ((wins / (wins + losses)) * 100).toFixed(1) + '%'}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Game Status */}
              <div style={{
                  background: 'linear-gradient(135deg, #2a3a5a 0%, #1a2a4a 100%)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(100, 150, 200, 0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                  <h4 style={{
                      color: '#4a90e2',
                      margin: '0 0 10px 0',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                  }}>
                      ⚙️ Configuració
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: '#bdc3c7'
                      }}>
                          <span>Modo:</span>
                          <span style={{ fontWeight: 'bold', color: '#FFD700' }}>
                              {gameState.config?.mode === 'hardcore' ? '⚡ Hardcore' : '❤️ Vides'}
                          </span>
                      </div>
                      <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: '#bdc3c7'
                      }}>
                          <span>Temps/torn:</span>
                          <span style={{ fontWeight: 'bold', color: '#FFD700' }}>
                              {gameState.config?.turnTime}s
                          </span>
                      </div>
                  </div>
              </div>

              {/* Secret Card under Config */}
              {mySecret && (
                  <div style={{
                      background: 'linear-gradient(135deg, #2b2b3a 0%, #1e1f2e 100%)',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                  }}>
                      <h4 style={{ color: '#FFD700', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          🔒 Carta Secreta
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                          <div style={{ width: '110px', height: '150px', minHeight: 0 }}>
                              <CharacterCard compact character={mySecret} eliminated={false} onClick={() => {}} />
                          </div>
                      </div>
                  </div>
              )}</>
              )}
          </div>
      </div>
    </div>
  );
}

export default App;

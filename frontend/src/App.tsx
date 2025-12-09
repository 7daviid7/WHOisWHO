import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { Login } from './components/Login';
import { RoomBrowser } from './components/RoomBrowser';
import { WaitingScreen } from './components/WaitingScreen';
import { GameOverModal } from './components/GameOverModal';
import { GameBoard } from './components/GameBoard';
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
        if (data.winner === socket.id) {
            setWins(prev => prev + 1);
        } else {
            setLosses(prev => prev + 1);
        }
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
    };
  }, []);

  const handleLogin = (name: string) => {
      setUsername(name);
  };

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
        padding: '10px', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
        background: 'linear-gradient(to bottom, #ecf0f1 0%, #bdc3c7 100%)', 
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

      {/* Header Section - Compact */}
      <div style={{ 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          padding: '10px 15px',
          borderRadius: '10px',
          marginBottom: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          border: '2px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                  <h2 style={{ 
                      color: '#FFD700',
                      margin: 0,
                      fontSize: '1.2rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}>
                      🎮 {gameState.roomId}
                  </h2>
                  <h3 style={{ 
                      color: '#ecf0f1', 
                      margin: '3px 0 0 0',
                      fontSize: '0.9rem'
                  }}>
                      {username} vs {opponentName}
                  </h3>
              </div>
              
              <div style={{
                  padding: '8px 15px',
                  backgroundColor: isMyTurn ? '#27ae60' : '#e74c3c',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  animation: isMyTurn ? 'pulse 2s infinite' : 'none'
              }}>
                  {gameState.config && (
                      <div style={{
                          marginTop: '5px',
                          display: 'flex',
                          gap: '8px',
                          fontSize: '0.75rem'
                      }}>
                          <span style={{
                              backgroundColor: '#9b59b6',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              color: 'white',
                              fontWeight: 'bold'
                          }}>
                              {gameState.config.mode === 'hardcore' && '⚡ HARDCORE'}
                              {gameState.config.mode === 'lives' && '❤️ VIDES'}
                          </span>
                          <span style={{
                              backgroundColor: '#3498db',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              color: 'white',
                              fontWeight: 'bold'
                          }}>
                              ⏱️ {gameState.config.turnTime}s
                          </span>
                      </div>
                  )}
                                    {/* Lives Display for Lives Mode */}
                                    {gameState.config?.mode === 'lives' && (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            padding: '10px 15px',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#FFD700', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                    Tu:
                                                </span>
                                                <span style={{ fontSize: '1.2rem' }}>
                                                    {Array.from({ length: myLives || 0 }).map(() => '❤️').join(' ')}
                                                    {Array.from({ length: 2 - (myLives || 0) }).map(() => '🖤').join(' ')}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#ecf0f1', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                    {opponentName}:
                                                </span>
                                                <span style={{ fontSize: '1.2rem' }}>
                                                    {Array.from({ length: opponentLives || 0 }).map(() => '❤️').join(' ')}
                                                    {Array.from({ length: 2 - (opponentLives || 0) }).map(() => '🖤').join(' ')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <p style={{ 
                                        fontSize: '1rem', 
                                        fontWeight: 'bold', 
                                        color: 'white',
                                        margin: 0,
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                                    }}>
                                        {isMyTurn ? "⏰ EL TEU TORN" : "⌛ TORN RIVAL"}
                                    </p>
              </div>

              {/* Timer Display */}
              <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px'
              }}>
                  <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: timeRemaining <= 10 ? '#e74c3c' : '#FFD700',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      animation: timeRemaining <= 10 ? 'pulse 1s infinite' : 'none',
                      minWidth: '70px',
                      textAlign: 'center'
                  }}>
                      {timeRemaining}s
                  </div>
                  <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                      <div style={{
                          height: '100%',
                          width: `${(timeRemaining / (gameState.turnTimeLimit || 60)) * 100}%`,
                          backgroundColor: timeRemaining <= 10 ? '#e74c3c' : timeRemaining <= 30 ? '#f39c12' : '#27ae60',
                          transition: 'width 0.1s linear, background-color 0.3s ease',
                          boxShadow: timeRemaining <= 10 ? '0 0 10px #e74c3c' : 'none'
                      }}></div>
                  </div>
              </div>
          </div>
          
          {/* Game Log - Compact */}
          <div style={{ 
              width: '280px', 
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              border: '2px solid #FFD700'
          }}>
              <div style={{
                  backgroundColor: '#FFD700',
                  padding: '6px 10px',
                  borderBottom: '1px solid #DAA520'
              }}>
                  <h4 style={{ 
                      margin: 0, 
                      color: '#2c3e50',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                  }}>
                      📋 Registre
                  </h4>
              </div>
              <div style={{ 
                  height: '80px', 
                  overflowY: 'auto', 
                  padding: '8px',
              }}>
                  {logs.length === 0 ? (
                      <p style={{ color: '#95a5a6', textAlign: 'center', margin: '10px 0', fontSize: '0.8rem' }}>
                          No hi ha jugades...
                      </p>
                  ) : (
                      logs.map((l, i) => (
                          <div key={i} style={{ 
                              fontSize: '0.75rem', 
                              marginBottom: '5px',
                              padding: '5px',
                              backgroundColor: i % 2 === 0 ? '#f8f9fa' : 'white',
                              borderRadius: '4px',
                              borderLeft: '2px solid #3498db'
                          }}>
                              {l}
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {incomingQuestion && (
          <div style={{ 
              background: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)', 
              padding: '15px 20px', 
              margin: '10px 0', 
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              textAlign: 'center',
              border: '3px solid #e67e22',
              animation: 'shake 0.5s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px'
          }}>
              <div style={{
                  fontSize: '2rem'
              }}>
                  ❓
              </div>
              <h3 style={{ 
                  color: '#2c3e50',
                  fontSize: '1.1rem',
                  margin: 0,
                  textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
                  flex: 1
              }}>
                  <strong>El rival pregunta:</strong> {incomingQuestion.question}
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => answerQuestion(true)} style={{
                    padding: '10px 30px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                    transform: 'scale(1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ✓ SÍ
                </button>
                <button onClick={() => answerQuestion(false)} style={{
                    padding: '10px 30px',
                    backgroundColor: '#c0392b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                    transform: 'scale(1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ✗ NO
                </button>
              </div>
          </div>
      )}

      {isMyTurn && !incomingQuestion && (
          <div style={{ 
              margin: '10px 0', 
              padding: '12px 15px', 
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.2)'
          }}>
              <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center', 
                  flexWrap: 'wrap'
              }}>
                <span style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    marginRight: '5px'
                }}>
                    💭 Pregunta:
                </span>
                <select 
                    value={selectedAttr} 
                    onChange={e => setSelectedAttr(e.target.value)}
                    style={{ 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: '2px solid #2c3e50',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        backgroundColor: 'white',
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
                        placeholder="Valor" 
                        value={selectedValue} 
                        onChange={e => setSelectedValue(e.target.value)} 
                        style={{ 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            border: '2px solid #2c3e50',
                            fontSize: '0.9rem',
                            minWidth: '150px'
                        }}
                    />
                ) : (
                    <select 
                        value={selectedValue} 
                        onChange={e => setSelectedValue(e.target.value)}
                        style={{ 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            border: '2px solid #2c3e50',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Selecciona...</option>
                        <option value="true">✓ Sí</option>
                        <option value="false">✗ No</option>
                    </select>
                )}

                <button onClick={askQuestion} style={{ 
                    padding: '8px 20px', 
                    backgroundColor: '#27ae60', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
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
                        padding: '8px 20px', 
                        backgroundColor: '#9b59b6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                        transform: 'scale(1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    📝 Preguntes ràpides
                </button>
                
                <span style={{ 
                    color: 'white', 
                    fontSize: '0.8rem',
                    marginLeft: 'auto',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '5px 10px',
                    borderRadius: '5px'
                }}>
                    💡 Clica carta per descartar
                </span>
              </div>

              {/* Predefined Questions Dropdown */}
              {showPredefinedQuestions && (
                  <div style={{
                      marginTop: '10px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '8px',
                      padding: '10px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}>
                      <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '8px'
                      }}>
                          {predefinedQuestions.map(q => (
                              <button
                                  key={q.id}
                                  onClick={() => askPredefinedQuestion(q)}
                                  style={{
                                      padding: '10px',
                                      backgroundColor: '#ecf0f1',
                                      border: '2px solid #3498db',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      fontSize: '0.85rem',
                                      transition: 'all 0.2s',
                                      fontWeight: '500',
                                      color: '#2c3e50'
                                  }}
                                  onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#3498db';
                                      e.currentTarget.style.color = 'white';
                                  }}
                                  onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#ecf0f1';
                                      e.currentTarget.style.color = '#2c3e50';
                                  }}
                              >
                                  {q.question}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}

      <div style={{ 
          flex: 1, 
          display: 'flex', 
          gap: '10px',
          minHeight: 0,
          overflow: 'hidden'
      }}>
          <GameBoard 
            characters={characters} 
            eliminatedIds={eliminatedIds} 
            onToggleEliminate={(id) => {
                if (isMyTurn && !incomingQuestion) {
                    toggleEliminate(id);
                } else {
                    toggleEliminate(id);
                }
            }}
            secretCharacter={mySecret}
            playerColor="blue"
          />
      </div>
      
      {isMyTurn && (
          <div style={{ 
              marginTop: '10px', 
              textAlign: 'center', 
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              border: '3px solid #c0392b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
          }}>
              <span style={{ fontSize: '1.5rem' }}>🎯</span>
              <span style={{ 
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                  Intent final:
              </span>
              <select id="guessSelect" style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '2px solid #2c3e50',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  backgroundColor: 'white',
                  cursor: 'pointer'
              }}>
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={() => {
                  const select = document.getElementById('guessSelect') as HTMLSelectElement;
                  guessCharacter(parseInt(select.value));
              }} style={{
                  padding: '8px 25px',
                  backgroundColor: '#c0392b',
                  color: 'white',
                  border: '2px solid #922b21',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                  transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.backgroundColor = '#a93226';
              }}
              onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#c0392b';
              }}
              >
                  🎲 Endevinar
              </button>
              <span style={{
                  color: '#fff',
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(192,57,43,0.5)',
                  padding: '5px 10px',
                  borderRadius: '5px'
              }}>
                  ⚠️ Si falles, perds!
              </span>
          </div>
      )}
    </div>
  );
}

export default App;

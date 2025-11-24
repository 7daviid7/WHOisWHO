import { useEffect, useState } from 'react';
import { socket } from './socket';
import { Login } from './components/Login';
import { RoomBrowser } from './components/RoomBrowser';
import { WaitingScreen } from './components/WaitingScreen';
import { GameOverModal } from './components/GameOverModal';
import { GameBoard } from './components/GameBoard';
import { Character, GameState } from './types';

function App() {
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [eliminatedIds, setEliminatedIds] = useState<number[]>([]);
  const [mySecret, setMySecret] = useState<Character | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  
  // Question State
  const [selectedAttr, setSelectedAttr] = useState<string>('gender');
  const [selectedValue, setSelectedValue] = useState<string>('');
  
  // Incoming Question State
  const [incomingQuestion, setIncomingQuestion] = useState<{question: string, attribute: string, value: any} | null>(null);

  useEffect(() => {
    fetch('/api/characters')
      .then(res => res.json())
      .then(data => setCharacters(data));

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

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room_update', onRoomUpdate);
    socket.on('secret_character', onSecretCharacter);
    socket.on('game_started', onGameStarted);
    socket.on('receive_question', onReceiveQuestion);
    socket.on('receive_answer', onReceiveAnswer);
    socket.on('game_over', onGameOver);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_update', onRoomUpdate);
      socket.off('secret_character', onSecretCharacter);
      socket.off('game_started', onGameStarted);
      socket.off('receive_question', onReceiveQuestion);
      socket.off('receive_answer', onReceiveAnswer);
      socket.off('game_over', onGameOver);
    };
  }, []);

  const handleLogin = (name: string) => {
      setUsername(name);
  };

  const joinRoom = (roomId: string) => {
    socket.connect();
    socket.emit('join_room', { roomId, username });
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f6f7', minHeight: '100vh' }}>
      {gameState.status === 'finished' && (
          <GameOverModal 
            winner={gameState.winner === socket.id ? username : opponentName} 
            isMe={gameState.winner === socket.id}
            reason={(gameState as any).reason || 'Partida Acabada'}
            onRestart={restartGame}
          />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
            <h2 style={{ color: '#2c3e50' }}>Sala: {gameState.roomId}</h2>
            <h3 style={{ color: '#7f8c8d', marginTop: '5px' }}>Rival: {opponentName}</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isMyTurn ? '#27ae60' : '#c0392b' }}>
                {isMyTurn ? "EL TEU TORN" : "TORN DEL RIVAL"}
            </p>
        </div>
        <div style={{ 
            width: '300px', 
            height: '150px', 
            overflowY: 'scroll', 
            border: '1px solid #bdc3c7', 
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '5px'
        }}>
            <h4 style={{ marginTop: 0, color: '#7f8c8d' }}>Registre</h4>
            {logs.map((l, i) => <div key={i} style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{l}</div>)}
        </div>
      </div>

      {incomingQuestion && (
          <div style={{ 
              backgroundColor: '#f1c40f', 
              padding: '20px', 
              margin: '20px 0', 
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
          }}>
              <h3 style={{ color: '#2c3e50' }}>El rival pregunta: {incomingQuestion.question}</h3>
              <div style={{ marginTop: '15px' }}>
                <button onClick={() => answerQuestion(true)} style={{
                    padding: '10px 30px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    fontWeight: 'bold'
                }}>SÍ</button>
                <button onClick={() => answerQuestion(false)} style={{
                    padding: '10px 30px',
                    backgroundColor: '#c0392b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>NO</button>
              </div>
          </div>
      )}

      {isMyTurn && !incomingQuestion && (
          <div style={{ 
              margin: '20px 0', 
              padding: '20px', 
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Fes una Pregunta</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select 
                    value={selectedAttr} 
                    onChange={e => setSelectedAttr(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                >
                    <option value="gender">Gènere</option>
                    <option value="hairColor">Color de Cabell</option>
                    <option value="eyeColor">Color d'Ulls</option>
                    <option value="hasBeard">Té Barba</option>
                    <option value="hasGlasses">Té Ulleres</option>
                    <option value="hasHat">Porta Barret</option>
                </select>
                
                {['gender', 'hairColor', 'eyeColor'].includes(selectedAttr) ? (
                    <input 
                        type="text" 
                        placeholder="Valor (ex. home, ros)" 
                        value={selectedValue} 
                        onChange={e => setSelectedValue(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                    />
                ) : (
                    <select 
                        value={selectedValue} 
                        onChange={e => setSelectedValue(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                    >
                        <option value="">Selecciona...</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                    </select>
                )}

                <button onClick={askQuestion} style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#3498db', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>Preguntar</button>
              </div>
              <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '10px' }}>
                  Per endevinar un personatge, fes clic a la seva carta durant el teu torn.
              </p>
          </div>
      )}

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
      />
      
      {isMyTurn && (
          <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', backgroundColor: '#ecf0f1', borderRadius: '10px' }}>
              <h3 style={{ color: '#e67e22' }}>Preparat per endevinar?</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <select id="guessSelect" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}>
                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={() => {
                    const select = document.getElementById('guessSelect') as HTMLSelectElement;
                    guessCharacter(parseInt(select.value));
                }} style={{
                    padding: '10px 20px',
                    backgroundColor: '#e67e22',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>Fer l'intent final</button>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;

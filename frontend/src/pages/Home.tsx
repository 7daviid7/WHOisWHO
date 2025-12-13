import React, { useEffect, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { socket } from '../socket';
import { RoomBrowser } from '../components/RoomBrowser';
import { WaitingScreen } from '../components/WaitingScreen';
import { GameOverModal } from '../components/GameOverModal';
import { GameBoard } from '../components/GameBoard'; // We might replace this with inline grid
import { Character, GameState, PredefinedQuestion } from '../types';
import { LayoutContextType } from '../components/Layout';
import './Home.css';

interface HomeProps {
    username: string;
}

export default function Home({ username }: HomeProps) {
    const location = useLocation();
    const { setSidebarHidden } = useOutletContext<LayoutContextType>();

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
    const [incomingQuestion, setIncomingQuestion] = useState<{ question: string, attribute: string, value: any } | null>(null);

    // Hide sidebar when game is active
    useEffect(() => {
        if (gameState && gameState.status === 'playing') {
            setSidebarHidden(true);
        } else {
            setSidebarHidden(false);
        }
    }, [gameState?.status, setSidebarHidden]);

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

        updateTimer();
        const interval = setInterval(updateTimer, 100);
        return () => clearInterval(interval);
    }, [gameState?.turnStartTime, gameState?.turn, gameState?.status]);

    useEffect(() => {
        fetch('/api/characters').then(res => res.json()).then(data => setCharacters(data));
        fetch('/api/predefined-questions').then(res => res.json()).then(data => setPredefinedQuestions(data));

        function onConnect() { setIsConnected(true); }
        function onDisconnect() { setIsConnected(false); }
        function onRoomUpdate(room: GameState) { setGameState(room); }
        function onSecretCharacter(char: Character) { setMySecret(char); }
        function onGameStarted(room: GameState) { setGameState(room); setLogs(prev => [...prev, "Partida Començada!"]); }
        function onReceiveQuestion(data: { question: string, attribute: string, value: any }) { setIncomingQuestion(data); }
        function onReceiveAnswer(data: { answer: boolean, attribute: string, value: any, from: string }) {
            const answerText = data.answer ? "SÍ" : "NO";
            setLogs(prev => [...prev, `Resposta: ${answerText}`]);
        }
        function onGameOver(data: { winner: string, reason: string }) {
            setGameState(prev => prev ? { ...prev, status: 'finished', winner: data.winner, reason: data.reason } as any : null);
        }
        function onStatsUpdate(data: { wins: number, losses: number }) {
            if (!data) return;
            setWins(data.wins || 0);
            setLosses(data.losses || 0);
        }
        function onTurnTimeout(data: { playerId: string }) { setLogs(prev => [...prev, `⏰ Temps esgotat!`]); }
        function onLifeLost(data: { livesRemaining: number }) { setLogs(prev => [...prev, `💔 Has perdut una vida! Vides restants: ${data.livesRemaining}`]); }

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

    // Load persistent stats
    useEffect(() => {
        if (!username) return;
        fetch(`/api/stats/${encodeURIComponent(username)}`)
            .then(res => res.json())
            .then(data => {
                if (data && typeof data === 'object') {
                    setWins(data.wins || 0);
                    setLosses(data.losses || 0);
                }
            }).catch(err => console.warn('Could not load stats:', err));
    }, [username]);

    // Check for auto-join from invitation
    useEffect(() => {
        const state = location.state as { joinRoomId?: string, config?: any };
        if (state?.joinRoomId) {
            joinRoom(state.joinRoomId, state.config);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const joinRoom = (roomId: string, config?: any) => {
        console.log(`[DEBUG] Connecting to socket...`);
        socket.connect();
        console.log(`[DEBUG] Emitting join_room: roomId=${roomId}, username=${username}, config=`, config);
        socket.emit('join_room', { roomId, username, config });
    };

    const toggleEliminate = (id: number) => {
        setEliminatedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const formatQuestion = (attr: string, val: any) => {
        switch (attr) {
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
        socket.emit('ask_question', { roomId: gameState.roomId, question, attribute: selectedAttr, value: selectedValue });
        setLogs(prev => [...prev, `Has preguntat: ${question}`]);
    };

    const askPredefinedQuestion = (q: PredefinedQuestion) => {
        if (!gameState || gameState.turn !== socket.id) return;
        socket.emit('ask_question', { roomId: gameState.roomId, question: q.question, attribute: q.attribute, value: q.value });
        setLogs(prev => [...prev, `Has preguntat: ${q.question}`]);
        setShowPredefinedQuestions(false);
    };

    const answerQuestion = (answer: boolean) => {
        if (!gameState || !incomingQuestion) return;
        socket.emit('answer_question', { roomId: gameState.roomId, answer, attribute: incomingQuestion.attribute, value: incomingQuestion.value });
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
        setSidebarHidden(false);
    };

    if (!gameState) {
        return <RoomBrowser onJoinRoom={joinRoom} wins={wins} losses={losses} />;
    }

    if (gameState.status === 'waiting') {
        return <WaitingScreen />;
    }

    const isMyTurn = gameState.turn === socket.id;
    const opponent = gameState.players.find(p => p.id !== socket.id);
    const opponentName = opponent?.name || 'Rival';

    // RENDER: GAME UI
    return (
        <div className="game-container">
            {gameState.status === 'finished' && (
                <GameOverModal
                    winner={gameState.winner === socket.id ? username : opponentName}
                    isMe={gameState.winner === socket.id}
                    reason={(gameState as any).reason || 'Partida Acabada'}
                    onRestart={restartGame}
                />
            )}

            {/* TOP BAR */}
            <div className="top-bar">
                <div className="game-info-badge" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Left side avatars could go here if needed, keeping simple like ref image which shows Names clearly */}
                    <div style={{ fontWeight: '700', color: '#7289da', fontSize: '1.1rem' }}>{username}</div>
                    <div style={{ color: '#72767d', fontWeight: '800' }}>VS</div>
                    <div style={{ fontWeight: '700', color: '#f04747', fontSize: '1.1rem' }}>{opponentName}</div>
                </div>

                <div className="timer-container">
                    {isMyTurn ? (
                        <div className="turn-badge me">TU TORN</div>
                    ) : (
                        <div className="turn-badge opponent">TORN RIVAL</div>
                    )}
                    <div className="timer-value">{timeRemaining}s</div>
                    <div className="timer-bar-bg">
                        <div className="timer-bar-fill" style={{
                            width: `${(timeRemaining / (gameState.turnTimeLimit || 60)) * 100}%`,
                            backgroundColor: timeRemaining <= 10 ? '#f04747' : '#43b581'
                        }}></div>
                    </div>
                </div>

                <div className="mode-badge" style={{
                    background: '#9b59b6', padding: '6px 12px', borderRadius: '4px', fontWeight: '700', color: 'white', textTransform: 'uppercase', fontSize: '0.8rem', boxShadow: '0 3px 0 rgba(0,0,0,0.2)'
                }}>
                    {gameState.config?.mode || 'HARDCORE'}
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="game-grid">

                {/* LEFT COLUMN: ACTIONS (Vertical Fit) */}
                <div className="panel-column left">
                    {/* Ask Question Panel (Blue) */}
                    <div className="panel-card panel-blue">
                        <div className="panel-header">
                            Hacer Pregunta
                        </div>
                        <div className="panel-body">
                            {incomingQuestion ? (
                                <div style={{ textAlign: 'center' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#faa61a' }}>Fes la teva resposta!</h4>
                                    <p style={{ marginBottom: '10px' }}>{incomingQuestion.question}</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-action btn-green" onClick={() => answerQuestion(true)}>SÍ</button>
                                        <button className="btn-action btn-red" onClick={() => answerQuestion(false)}>NO</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <select className="game-select" value={selectedAttr} onChange={e => setSelectedAttr(e.target.value)}>
                                        <option value="gender">Gènere</option>
                                        <option value="hairColor">Cabell</option>
                                        <option value="eyeColor">Ulls</option>
                                        <option value="hasBeard">Barba</option>
                                        <option value="hasGlasses">Ulleres</option>
                                        <option value="hasHat">Barret</option>
                                    </select>

                                    {['gender', 'hairColor', 'eyeColor'].includes(selectedAttr) ? (
                                        <input className="game-input" type="text" placeholder="Valor (p.e. Dona, Ros)" value={selectedValue} onChange={e => setSelectedValue(e.target.value)} />
                                    ) : (
                                        <select className="game-select" value={selectedValue} onChange={e => setSelectedValue(e.target.value)}>
                                            <option value="">Selecciona...</option>
                                            <option value="true">Sí</option>
                                            <option value="false">No</option>
                                        </select>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-action btn-green" disabled={!isMyTurn} onClick={askQuestion}> Preguntar</button>
                                        <button className="btn-action btn-purple" disabled={!isMyTurn} onClick={() => setShowPredefinedQuestions(!showPredefinedQuestions)}> Ràpides</button>
                                    </div>
                                </>
                            )}
                        </div>
                        {showPredefinedQuestions && (
                            <div style={{ padding: '0 12px 12px 12px', maxHeight: '150px', overflowY: 'auto' }}>
                                {predefinedQuestions.map(q => (
                                    <div key={q.id} onClick={() => askPredefinedQuestion(q)} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        {q.question}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Final Guess Panel (Orange) */}
                    <div className="panel-card panel-orange">
                        <div className="panel-header">
                            Intent Final
                        </div>
                        <div className="panel-body">
                            <select id="guessSelect" className="game-select">
                                {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button className="btn-action btn-red" disabled={!isMyTurn} onClick={() => {
                                const select = document.getElementById('guessSelect') as HTMLSelectElement;
                                guessCharacter(parseInt(select.value));
                            }}> Endevinar</button>
                            <div style={{ fontSize: '0.75rem', color: '#f04747', textAlign: 'center', fontWeight: 'bold' }}> Si falles, perds!</div>
                        </div>
                    </div>

                    {/* Logs (Blue) - Grows to fill space */}
                    <div className="panel-card panel-blue grow-panel">
                        <div className="panel-header"> Registre de Batalla</div>
                        <div className="panel-body">
                            <div className="log-container">
                                {logs.length === 0 ? <div style={{ color: '#72767d', fontStyle: 'italic' }}>Iniciant...</div> : logs.map((l, i) => <div key={i} className="log-item">{l}</div>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: BOARD */}
                <div className="board-area">
                    <div className="card-grid">
                        {characters.map(char => (
                            <div
                                key={char.id}
                                className={`game-card ${eliminatedIds.includes(char.id) ? 'eliminated' : ''}`}
                                onClick={() => toggleEliminate(char.id)}
                            >
                                <img src={char.image} alt={char.name} className="card-image" />
                                <div className="card-name">{char.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: STATS & CONFIG */}
                <div className="panel-column right">
                    {/* Stats (Green) */}
                    <div className="panel-card panel-green">
                        <div className="panel-header"> Estadístiques</div>
                        <div className="panel-body">
                            <div className="stat-row">
                                <span className="stat-label">Victòries</span>
                                <span className="stat-value">{wins}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Derrotes</span>
                                <span className="stat-value" style={{ color: '#f04747' }}>{losses}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Win Rate</span>
                                <span className="stat-value" style={{ color: '#faa61a' }}>{wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Config (Blue) */}
                    <div className="panel-card panel-blue">
                        <div className="panel-header"> Configuració</div>
                        <div className="panel-body">
                            <div className="stat-row">
                                <span className="stat-label">Modo</span>
                                <span className="stat-value">{gameState.config?.mode === 'hardcore' ? 'Hardcore' : 'Vides'}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Temps/torn</span>
                                <span className="stat-value">{gameState.turnTimeLimit}s</span>
                            </div>
                        </div>
                    </div>

                    {/* Secret Card (Orange) */}
                    <div className="panel-card panel-orange" style={{ flex: 1 }}>
                        <div className="panel-header"> Carta Secreta</div>
                        <div className="panel-body" style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            {mySecret ? (
                                <div style={{ width: '80%', textAlign: 'center' }}>
                                    <div className="game-card" style={{ cursor: 'default', transform: 'none' }}>
                                        <img src={mySecret.image} alt={mySecret.name} className="card-image" />
                                        <div className="card-name">{mySecret.name}</div>
                                    </div>
                                    <div style={{ marginTop: '10px', fontWeight: '700', fontSize: '1.2rem' }}>{mySecret.name}</div>
                                </div>
                            ) : <div>?</div>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

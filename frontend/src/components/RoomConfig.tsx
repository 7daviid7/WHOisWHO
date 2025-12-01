import React, { useState } from 'react';

interface Props {
    onCreateRoom: (roomName: string, config: { mode: string, turnTime: number }) => void;
    onCancel: () => void;
}

export const RoomConfig: React.FC<Props> = ({ onCreateRoom, onCancel }) => {
    const [roomName, setRoomName] = useState('');
    const [gameMode, setGameMode] = useState<'hardcore' | 'lives'>('hardcore');
    const [turnTime, setTurnTime] = useState<15 | 30 | 60>(60);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomName.trim()) {
            onCreateRoom(roomName, { mode: gameMode, turnTime });
        }
    };

    const gameModeDescriptions: Record<string,string> = {
        hardcore: 'Una endevinalla incorrecta = derrota immediata',
        lives: 'Tens 2 vides. Pots fallar dues vegades'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                padding: '2.5rem',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                border: '4px solid #FFD700',
                maxWidth: '500px',
                width: '90%'
            }}>
                <h2 style={{
                    color: '#FFD700',
                    textAlign: 'center',
                    marginTop: 0,
                    fontSize: '2rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    ⚙️ Configurar Nova Sala
                </h2>

                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {/* Room Name */}
                    <div>
                        <label style={{
                            color: 'white',
                            fontWeight: 'bold',
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1.1rem'
                        }}>
                            📝 Nom de la Sala:
                        </label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Introdueix un nom..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '3px solid #FFD700',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                    </div>

                    {/* Game Mode */}
                    <div>
                        <label style={{
                            color: 'white',
                            fontWeight: 'bold',
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1.1rem'
                        }}>
                            🎮 Mode de Joc:
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(['hardcore', 'lives'] as const).map(mode => (
                                <label key={mode} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    backgroundColor: gameMode === mode ? '#27ae60' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    border: gameMode === mode ? '3px solid #FFD700' : '3px solid transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="radio"
                                        name="gameMode"
                                        value={mode}
                                        checked={gameMode === mode}
                                        onChange={(e) => setGameMode(e.target.value as any)}
                                        style={{ marginRight: '10px', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                            {mode === 'hardcore' && '⚡ Hardcore'}
                                            {mode === 'lives' && '❤️ Vides (x2)'}
                                        </div>
                                        <div style={{ color: '#ecf0f1', fontSize: '0.85rem', marginTop: '4px' }}>
                                            {gameModeDescriptions[mode]}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Turn Time */}
                    <div>
                        <label style={{
                            color: 'white',
                            fontWeight: 'bold',
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1.1rem'
                        }}>
                            ⏱️ Temps per Torn:
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[60, 30, 15].map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setTurnTime(time as any)}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        backgroundColor: turnTime === time ? '#3498db' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: turnTime === time ? '3px solid #FFD700' : '3px solid transparent',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {time}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '15px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: '3px solid #c0392b',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            ❌ Cancel·lar
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '15px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: '3px solid #229954',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            ✅ Crear Sala
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

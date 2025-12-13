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
        <div className="modal-overlay">
            <div className="room-config card">
                <div className="card-head">
                    <h2 className="card-title">Configurar Nova Sala</h2>
                    <p className="muted">Personalitza la partida abans de convidar als teus amics</p>
                </div>

                <form onSubmit={handleSubmit} className="room-config-form">
                    {/* Room Name */}
                    <div>
                        <label className="field-label">Nom de la Sala</label>
                        <input
                            className="input"
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Introdueix un nom..."
                            autoFocus
                        />
                    </div>

                    {/* Game Mode */}
                    <div>
                        <label className="field-label">Mode de Joc</label>
                        <div className="mode-list">
                            {(['hardcore', 'lives'] as const).map(mode => (
                                <label key={mode} className={`mode-item ${gameMode === mode ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="gameMode"
                                        value={mode}
                                        checked={gameMode === mode}
                                        onChange={(e) => setGameMode(e.target.value as any)}
                                    />
                                    <div className="mode-content">
                                        <div className="mode-title">{mode === 'hardcore' ? 'Hardcore' : 'Vides (x2)'}</div>
                                        <div className="mode-desc">{gameModeDescriptions[mode]}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Turn Time */}
                    <div>
                        <label className="field-label">Temps per Torn</label>
                        <div className="turn-times">
                            {[60, 30, 15].map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    className={`time-btn ${turnTime === time ? 'active' : ''}`}
                                    onClick={() => setTurnTime(time as any)}
                                >
                                    {time}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel·lar</button>
                        <button type="submit" className="btn btn-primary">Crear Sala</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

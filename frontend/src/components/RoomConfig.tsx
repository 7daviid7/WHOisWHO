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
        hardcore: 'Una fallada = derrota immediata ☠️',
        lives: 'Tens 2 vides. Pots fallar un cop ❤️'
    };

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)' }}>
            <div className="room-config card" style={{ 
                animation: 'modalZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--primary-gold-dark)' 
            }}>
                <div className="card-head" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title" style={{ fontSize: '1.5rem', display:'flex', alignItems:'center', gap:'10px' }}>
                            <span style={{ fontSize: '1.8rem' }}></span> Configurar Sala
                        </h2>
                        <button 
                            type="button" 
                            onClick={onCancel}
                            style={{ background:'none', border:'none', color:'var(--text-gray)', fontSize:'1.5rem', cursor:'pointer', padding:'0' }}
                        >
                            ×
                        </button>
                    </div>
                    <p className="muted" style={{ marginTop: '5px' }}>Personalitza les regles abans de convidar</p>
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
                            placeholder="Ex: La Arena dels Campions..."
                            autoFocus
                            style={{ fontSize: '1.1rem', padding: '14px' }}
                        />
                    </div>

                    {/* Game Mode */}
                    <div>
                        <label className="field-label">Mode de Joc</label>
                        <div className="mode-list">
                            {(['hardcore', 'lives'] as const).map(mode => (
                                <label 
                                    key={mode} 
                                    className={`mode-item ${gameMode === mode ? 'active' : ''}`}
                                    style={{ transition: 'all 0.2s ease' }}
                                >
                                    <input
                                        type="radio"
                                        name="gameMode"
                                        value={mode}
                                        checked={gameMode === mode}
                                        onChange={(e) => setGameMode(e.target.value as any)}
                                        style={{ accentColor: 'var(--primary-gold)' }}
                                    />
                                    <div className="mode-content">
                                        <div className="mode-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {mode === 'hardcore' ? 'Hardcore' : '❤️ Vides (x2)'}
                                            {gameMode === mode && <span style={{ fontSize: '0.8rem', color: 'var(--primary-gold)', border: '1px solid var(--primary-gold)', borderRadius: '4px', padding: '2px 6px' }}>SELECCIONAT</span>}
                                        </div>
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
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        gap: '4px',
                                        height: '70px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{time}s</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 'normal' }}>
                                        {time === 60 ? 'Relaxat' : time === 30 ? 'Normal' : 'Ràpid'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="form-actions" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel·lar</button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={!roomName.trim()}
                            style={{ flex: 2, opacity: !roomName.trim() ? 0.6 : 1 }}
                        >
                            Crear Sala
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
import React, { useState } from 'react';

interface Props {
    onJoin: (roomId: string) => void;
}

export const Lobby: React.FC<Props> = ({ onJoin }) => {
    const [roomId, setRoomId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId.trim()) {
            onJoin(roomId);
        }
    };

    return (
        <div className="lobby-v2" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Hero Section */}
            <div className="hero-content" style={{ textAlign: 'center', marginBottom: '30px', animation: 'fadeInDown 0.6s ease' }}>
                <div className="gem-spin" style={{ fontSize: '4rem', marginBottom: '10px' }}>
                    🚀
                </div>
                <h1 className="hero-title" style={{ fontSize: '3rem', justifyContent: 'center' }}>
                    Accés Directe
                </h1>
                <p className="hero-sub">
                    Tens un codi? Introdueix-lo per entrar ràpidament.
                </p>
            </div>

            {/* Join Card */}
            <div className="card" style={{ 
                maxWidth: '450px', 
                width: '100%', 
                animation: 'fadeInUp 0.6s ease',
                border: '1px solid var(--primary-gold-dark)',
                padding: '30px'
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="field-label" style={{ marginBottom: '8px', display: 'block' }}>
                            ID de la Sala
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ 
                                position: 'absolute', 
                                left: '14px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                fontSize: '1.2rem',
                                opacity: 0.7 
                            }}>
                                #️⃣
                            </span>
                            <input 
                                className="input"
                                type="text" 
                                placeholder="Ex: Sala-Secreta-123" 
                                value={roomId} 
                                onChange={(e) => setRoomId(e.target.value)} 
                                style={{ 
                                    padding: '14px 14px 14px 45px', 
                                    fontSize: '1.1rem', 
                                    width: '100%' 
                                }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={!roomId.trim()}
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '14px',
                            opacity: !roomId.trim() ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <span>Entrar a la partida</span>
                        <span>→</span>
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p className="muted" style={{ fontSize: '0.9rem' }}>
                        Prefereixes veure la llista pública? 
                    </p>
                    {/* Botó opcional per si vols enllaçar de tornada al RoomBrowser normal si calgués */}
                    {/* <button className="btn btn-ghost">Veure totes les sales</button> */}
                </div>
            </div>

            {/* Background Decorations */}
            <div className="decor-blobs">
                <div className="blob b2"></div>
                <div className="blob b1" style={{ left: '80%', animationDelay: '2s' }}></div>
            </div>
        </div>
    );
};
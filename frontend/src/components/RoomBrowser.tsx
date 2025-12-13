import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import { RoomConfig } from './RoomConfig';
import { RulesModal } from './RulesModal';

interface Props {
    onJoinRoom: (roomId: string, config?: any) => void;
    wins: number;
    losses: number;
}

export const RoomBrowser: React.FC<Props> = ({ onJoinRoom, wins, losses }) => {
    const [rooms, setRooms] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [showConfig, setShowConfig] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showRules, setShowRules] = useState(false);

    useEffect(() => {
        socket.connect();
        socket.emit('get_rooms');

        const handleRoomsList = (list: string[]) => {
            setRooms(list || []);
            setIsRefreshing(false);
        };
        socket.on('rooms_list', handleRoomsList);

        return () => {
            socket.off('rooms_list', handleRoomsList);
        };
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        socket.emit('get_rooms');
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const filteredRooms = rooms.filter(r => r.toLowerCase().includes(search.toLowerCase()));

    const handleCreateRoom = (roomName: string, config: any) => {
        onJoinRoom(roomName, config);
        setShowConfig(false);
    };

    return (
        <div className="lobby-v2" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Modals */}
            {showConfig && <RoomConfig onCreateRoom={handleCreateRoom} onCancel={() => setShowConfig(false)} />}
            {showRules && <RulesModal onClose={() => setShowRules(false)} />}

            {/* Hero Section */}
            <div className="hero" style={{ marginTop: '20px', marginBottom: '40px' }}>
                <div className="hero-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div className="gem-spin" style={{ fontSize: '2.5rem', width: 'auto', margin: 0 }}>🎮</div>
                        <h1 className="hero-title" style={{ margin: 0, fontSize: '3rem' }}>Who is Who</h1>
                    </div>
                    <p className="hero-sub" style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
                        Desafia als teus amics en aquest clàssic joc de deducció. 
                        Crea una sala privada o uneix-te a una partida pública.
                    </p>
                    
                    <div className="hero-ctas" style={{ marginTop: '25px', flexWrap: 'wrap', gap: '12px' }}>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setShowConfig(true)}
                            style={{ padding: '12px 24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            Crear Sala
                        </button>
                        
                        <button 
                            className="btn btn-ghost"
                            onClick={() => setShowRules(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'rgba(255,215,0,0.3)', color: '#FFD700' }}
                        >
                            Ajuda
                        </button>

                        <button 
                            className="btn btn-ghost" 
                            onClick={handleRefresh}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            title="Actualitzar llista"
                        >
                            <span style={{ 
                                display: 'inline-block', 
                                transition: 'transform 0.5s ease', 
                                transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0deg)' 
                            }}>↻</span> 
                        </button>
                    </div>
                </div>
            </div>

            <div className="lobby-main">
                {/* Llista de Sales */}
                <section className="rooms-panel card" style={{ 
                    minHeight: '400px', 
                    border: '1px solid var(--primary-gold-dark)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div className="panel-head" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Sales disponibles</h3>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--ui-subtext)' }}>
                                {filteredRooms.length}
                            </span>
                        </div>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            <input className="search" placeholder="Cercar sala per nom..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '35px' }} />
                        </div>
                    </div>

                    <div className="panel-body rooms-grid" style={{ flex: 1 }}>
                        {filteredRooms.length === 0 ? (
                            <div className="empty" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', opacity: 0.7 }}>
                                <div style={{ fontSize: '4rem', marginBottom: '10px', filter: 'grayscale(1)' }}>🏝️</div>
                                <div style={{ fontSize: '1.2rem', color: 'var(--ui-subtext)' }}>No hi ha sales actives</div>
                                <div className="empty-sub" style={{ fontSize: '0.9rem', marginTop: '5px' }}>Sigues el primer en crear-ne una!</div>
                            </div>
                        ) : (
                            filteredRooms.map((room, idx) => (
                                <article key={room} className="room-card" style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: `${idx * 50}ms`, cursor: 'default' }}>
                                    <div className="room-info">
                                        <div className="room-title" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{room}</div>
                                        <div className="room-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }}></span>
                                            Oberta · 1/2 Jugadors
                                        </div>
                                    </div>
                                    <div className="room-actions">
                                        <button 
                                            className="btn btn-ghost" 
                                            onClick={() => onJoinRoom(room)}
                                            style={{ borderColor: 'rgba(52, 152, 219, 0.4)', color: '#3498db', padding: '8px 20px' }}
                                        >
                                            Unir-se
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                {/* Sidebar Stats */}
                <aside className="sidebar card" style={{ height: 'fit-content' }}>
                    <div className="sidebar-head" style={{ marginBottom: '15px' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Les teves estadístiques</h4>
                    </div>
                    <div className="sidebar-body">
                        <div className="stat-row"><span>Victòries</span><strong style={{ color: 'var(--success-green)' }}>{wins}</strong></div>
                        <div className="stat-row"><span>Derrotes</span><strong style={{ color: 'var(--danger-red)' }}>{losses}</strong></div>
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--ui-subtext)' }}>
                                <span>Rati de Victòria</span>
                                <strong>{wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%</strong>
                            </div>
                            <div className="progress" style={{ background: 'rgba(255,255,255,0.05)', height: '8px' }}>
                                <div className="progress-bar" style={{ width: `${wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--success-green), var(--primary-gold))' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="sidebar-foot muted" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                        "La paciència és la clau de la victòria."
                    </div>
                </aside>
            </div>
            
            <div className="decor-blobs">
                <div className="blob b1" style={{ opacity: 0.15 }}></div>
                <div className="blob b2" style={{ opacity: 0.15 }}></div>
            </div>
        </div>
    );
};
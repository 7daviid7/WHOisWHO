import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import { RoomConfig } from './RoomConfig';

interface Props {
    onJoinRoom: (roomId: string, config?: any) => void;
    wins: number;
    losses: number;
}

export const RoomBrowser: React.FC<Props> = ({ onJoinRoom, wins, losses }) => {
    const [rooms, setRooms] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [showConfig, setShowConfig] = useState(false);

    useEffect(() => {
        socket.connect();
        socket.emit('get_rooms');

        const handleRoomsList = (list: string[]) => setRooms(list || []);
        socket.on('rooms_list', handleRoomsList);

        return () => {
            socket.off('rooms_list', handleRoomsList);
        };
    }, []);

    const filteredRooms = rooms.filter(r => r.toLowerCase().includes(search.toLowerCase()));

    const handleCreateRoom = (roomName: string, config: any) => {
        onJoinRoom(roomName, config);
        setShowConfig(false);
    };

    return (
        <div className="lobby-v2">
            {showConfig && (
                <RoomConfig onCreateRoom={handleCreateRoom} onCancel={() => setShowConfig(false)} />
            )}

            <div className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Who is Who</h1>
                    <p className="hero-sub">Juga, dedueix i venç el teu rival. Partides ràpides i competitives amb amics.</p>
                    <div className="hero-ctas">
                        <button className="btn btn-primary" onClick={() => setShowConfig(true)}>Crear Sala</button>
                        <button className="btn btn-ghost" onClick={() => socket.emit('get_rooms')}>Actualitzar Sales</button>
                    </div>
                </div>
                <div className="hero-visual" aria-hidden>
                    <svg width="320" height="200" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="bg" x1="0" x2="1">
                                <stop offset="0%" stopColor="#071226" />
                                <stop offset="100%" stopColor="#0f2a44" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <div className="lobby-main">
                <section className="rooms-panel card">
                    <div className="panel-head">
                        <h3>Sales disponibles</h3>
                        <input className="search" placeholder="Cercar sala..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    <div className="panel-body rooms-grid">
                        {filteredRooms.length === 0 ? (
                            <div className="empty">
                                <svg width="140" height="100" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <rect width="140" height="100" rx="10" fill="rgba(255,255,255,0.02)" />
                                    <g fill="rgba(255,255,255,0.08)">
                                        <circle cx="40" cy="50" r="16" />
                                        <rect x="66" y="36" width="48" height="28" rx="6" />
                                    </g>
                                </svg>
                                <div>No hi ha sales actives.</div>
                                <div className="empty-sub">Sigues el primer en crear una sala i comparteix l'enllaç amb amics.</div>
                            </div>
                        ) : (
                            filteredRooms.map((room, idx) => (
                                <article key={room} className="room-card" style={{ animationDelay: `${idx * 60}ms` }}>
                                    <div className="room-info">
                                        <div className="room-title">{room}</div>
                                        <div className="room-meta">Públic · 1/2</div>
                                    </div>
                                    <div className="room-actions">
                                        <button className="btn btn-ghost" onClick={() => onJoinRoom(room)}>Unir-se</button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <aside className="sidebar card">
                    <div className="sidebar-head">
                        <h4>Les teves estadístiques</h4>
                        <div className="winrate">Winrate: <strong>{wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%</strong></div>
                    </div>
                    <div className="sidebar-body">
                        <div className="stat-row"><span>Victòries</span><strong>{wins}</strong></div>
                        <div className="stat-row"><span>Derrotes</span><strong>{losses}</strong></div>
                        <div className="progress">
                            <div className="progress-bar" style={{ width: `${wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                    <div className="sidebar-foot muted">Prova diferents estratègies i millora la teva taxa de victòries.</div>
                </aside>
            </div>
        </div>
    );
};

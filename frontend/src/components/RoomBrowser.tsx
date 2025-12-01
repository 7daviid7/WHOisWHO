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

        const handleRoomsList = (list: string[]) => {
            setRooms(list);
        };

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
        <div style={{
            padding: '2rem',
            background: 'linear-gradient(to bottom, #ecf0f1 0%, #bdc3c7 100%)',
            minHeight: '100vh',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            position: 'relative',
            boxSizing: 'border-box'
        }}>
            {showConfig && (
                <RoomConfig
                    onCreateRoom={handleCreateRoom}
                    onCancel={() => setShowConfig(false)}
                />
            )}

            <div style={{
                textAlign: 'center',
                marginBottom: '2rem'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎮</div>
                <h1 style={{ 
                    textAlign: 'center',
                    background: 'linear-gradient(45deg, #e74c3c, #3498db)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '3.5rem',
                    margin: '0',
                    fontWeight: 'bold'
                }}>
                    Who is Who
                </h1>
                <h2 style={{ 
                    textAlign: 'center', 
                    color: '#7f8c8d', 
                    marginTop: '10px',
                    fontSize: '1.5rem'
                }}>
                    Selecciona o Crea una Sala
                </h2>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Create Room Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                    padding: '2.5rem',
                    borderRadius: '15px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    width: '350px',
                    border: '4px solid #c0392b'
                }}>
                    <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>➕</div>
                    <h2 style={{ 
                        color: 'white',
                        textAlign: 'center',
                        marginTop: 0,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        fontSize: '1.6rem'
                    }}>
                        Crear Nova Sala
                    </h2>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}>
                            Configura el teu mode de joc preferit i temps per torn
                        </p>
                        <button 
                            onClick={() => setShowConfig(true)}
                            style={{
                                padding: '18px 30px',
                                backgroundColor: '#c0392b',
                                color: 'white',
                                border: '3px solid #922b21',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1.3rem',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                transition: 'all 0.2s',
                                width: '100%'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            ⚙️ Crear Nova Sala
                        </button>
                    </div>
                </div>

                {/* Room List Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    padding: '2.5rem',
                    borderRadius: '15px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    width: '450px',
                    border: '4px solid #2c3e50'
                }}>
                    <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🏠</div>
                    <h2 style={{ 
                        color: 'white',
                        textAlign: 'center',
                        marginTop: 0,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        fontSize: '1.6rem'
                    }}>
                        Sales Disponibles
                    </h2>
                    <input 
                        type="text" 
                        placeholder="🔍 Cercar sales..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            marginBottom: '1.2rem', 
                            borderRadius: '10px', 
                            border: '3px solid #2c3e50',
                            boxSizing: 'border-box',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    />
                    <div style={{ 
                        maxHeight: '350px', 
                        overflowY: 'auto',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        padding: '10px'
                    }}>
                        {filteredRooms.length === 0 ? (
                            <p style={{ 
                                color: 'white', 
                                textAlign: 'center',
                                padding: '20px',
                                fontSize: '1.1rem'
                            }}>
                                📭 No s'han trobat sales.
                            </p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {filteredRooms.map(room => (
                                    <li key={room} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 15px',
                                        marginBottom: '8px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: '#2c3e50',
                                            fontSize: '1.1rem'
                                        }}>
                                            🎯 {room}
                                        </span>
                                        <button onClick={() => onJoinRoom(room)} style={{
                                            padding: '8px 20px',
                                            backgroundColor: '#27ae60',
                                            color: 'white',
                                            border: '2px solid #1e8449',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            ▶️ Unir-se
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                padding: '20px',
                borderRadius: '15px',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                color: '#2c3e50',
                border: '3px solid #DAA520'
            }}>
                <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '1.3rem',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    📊 Estadístiques
                </h3>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '1.1rem'
                }}>
                    <div style={{ 
                        backgroundColor: 'rgba(39,174,96,0.2)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #27ae60'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>🏆 Victòries: {wins}</span>
                    </div>
                    <div style={{ 
                        backgroundColor: 'rgba(192,57,43,0.2)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #c0392b'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>💔 Derrotes: {losses}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

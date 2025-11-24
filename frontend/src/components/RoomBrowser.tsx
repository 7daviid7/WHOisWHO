import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

interface Props {
    onJoinRoom: (roomId: string) => void;
    wins: number;
    losses: number;
}

export const RoomBrowser: React.FC<Props> = ({ onJoinRoom, wins, losses }) => {
    const [rooms, setRooms] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [newRoomName, setNewRoomName] = useState('');

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

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoomName.trim()) {
            onJoinRoom(newRoomName);
        }
    };

    return (
        <div style={{
            padding: '2rem',
            backgroundColor: '#ecf0f1',
            height: '100vh',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            position: 'relative',
            boxSizing: 'border-box'
        }}>
            <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '0' }}>Who is Who</h1>
            <h2 style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '10px' }}>Menú</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Create Room Section */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    width: '300px'
                }}>
                    <h2 style={{ color: '#e67e22' }}>Crear Nova Sala</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input 
                            type="text" 
                            placeholder="Nom de la Sala" 
                            value={newRoomName}
                            onChange={e => setNewRoomName(e.target.value)}
                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                        />
                        <button type="submit" style={{
                            padding: '10px',
                            backgroundColor: '#e67e22',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>Crear i Unir-se</button>
                    </form>
                </div>

                {/* Room List Section */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    width: '400px'
                }}>
                    <h2 style={{ color: '#3498db' }}>Sales Disponibles</h2>
                    <input 
                        type="text" 
                        placeholder="Cercar sales..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            marginBottom: '1rem', 
                            borderRadius: '5px', 
                            border: '1px solid #bdc3c7',
                            boxSizing: 'border-box'
                        }}
                    />
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {filteredRooms.length === 0 ? (
                            <p style={{ color: '#7f8c8d', textAlign: 'center' }}>No s'han trobat sales.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {filteredRooms.map(room => (
                                    <li key={room} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px',
                                        borderBottom: '1px solid #ecf0f1'
                                    }}>
                                        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{room}</span>
                                        <button onClick={() => onJoinRoom(room)} style={{
                                            padding: '5px 15px',
                                            backgroundColor: '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}>Unir-se</button>
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
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                color: '#2c3e50'
            }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Estadístiques Sessió</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>Victòries: {wins}</span>
                    <span style={{ color: '#c0392b', fontWeight: 'bold' }}>Derrotes: {losses}</span>
                </div>
            </div>
        </div>
    );
};

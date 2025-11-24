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
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Who is Who?</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Enter Room ID" 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value)} 
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>
                    Join Game
                </button>
            </form>
        </div>
    );
};

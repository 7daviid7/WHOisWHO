import React from 'react';

interface Props {
    winner: string;
    isMe: boolean;
    reason: string;
    onRestart: () => void;
}

export const GameOverModal: React.FC<Props> = ({ winner, isMe, reason, onRestart }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '15px',
                textAlign: 'center',
                maxWidth: '500px',
                boxShadow: '0 0 20px rgba(255,255,255,0.2)'
            }}>
                <h1 style={{ 
                    fontSize: '4rem', 
                    margin: '0 0 1rem 0',
                    color: isMe ? '#27ae60' : '#c0392b'
                }}>
                    {isMe ? 'HAS GUANYAT!' : 'HAS PERDUT!'}
                </h1>
                <h3 style={{ color: '#7f8c8d' }}>{reason}</h3>
                <p style={{ fontSize: '1.2rem', margin: '2rem 0' }}>
                    Guanyador: <span style={{ fontWeight: 'bold' }}>{winner}</span>
                </p>
                <button onClick={onRestart} style={{
                    padding: '15px 30px',
                    fontSize: '1.2rem',
                    backgroundColor: '#34495e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                }}>
                    Tornar al Menú Principal
                </button>
            </div>
        </div>
    );
};

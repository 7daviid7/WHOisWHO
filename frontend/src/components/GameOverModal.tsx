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
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                background: isMe 
                    ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)'
                    : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                padding: '4rem 3rem',
                borderRadius: '20px',
                textAlign: 'center',
                maxWidth: '600px',
                minWidth: '500px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                border: '6px solid #FFD700',
                animation: 'modalZoomIn 0.5s ease-out'
            }}>
                <div style={{ 
                    fontSize: '7rem',
                    marginBottom: '1rem',
                    animation: 'iconBounce 1s ease infinite'
                }}>
                    {isMe ? '🏆' : '😢'}
                </div>
                
                <h1 style={{ 
                    fontSize: '4rem', 
                    margin: '0 0 1rem 0',
                    color: 'white',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                    fontWeight: 'bold'
                }}>
                    {isMe ? '🎉 HAS GUANYAT! 🎉' : '💔 HAS PERDUT 💔'}
                </h1>
                
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '15px 25px',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ 
                        color: 'white',
                        fontSize: '1.3rem',
                        margin: 0,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}>
                        {reason}
                    </h3>
                </div>
                
                <p style={{ 
                    fontSize: '1.5rem', 
                    margin: '2rem 0',
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                    🏅 Guanyador: <span style={{ color: '#FFD700' }}>{winner}</span>
                </p>
                
                <button onClick={onRestart} style={{
                    padding: '18px 40px',
                    fontSize: '1.3rem',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    border: '3px solid #FFD700',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s',
                    transform: 'scale(1)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                }}
                >
                    🏠 Tornar al Menú Principal
                </button>
            </div>
            
            <style>{`
                @keyframes modalZoomIn {
                    from {
                        transform: scale(0.5);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
};

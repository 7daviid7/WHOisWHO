import React from 'react';

export const WaitingScreen: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
            color: 'white',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                padding: '4rem 5rem',
                borderRadius: '20px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                border: '5px solid #FFD700',
                textAlign: 'center',
                animation: 'pulse 2s infinite'
            }}>
                <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>⏳</div>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#FFD700',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out both',
                        animationDelay: '-0.32s'
                    }}></div>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#FFD700',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out both',
                        animationDelay: '-0.16s'
                    }}></div>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#FFD700',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out both'
                    }}></div>
                </div>
                
                <h2 style={{
                    fontSize: '2.5rem',
                    margin: '0 0 1rem 0',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    Esperant oponent...
                </h2>
                <p style={{
                    fontSize: '1.3rem',
                    color: '#ecf0f1',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '15px 25px',
                    borderRadius: '10px',
                    marginTop: '1.5rem'
                }}>
                    💬 Comparteix el nom de la sala amb un amic!
                </p>
            </div>
            
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { 
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% { 
                        transform: scale(1.0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

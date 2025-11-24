import React from 'react';

export const WaitingScreen: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#2c3e50',
            color: 'white'
        }}>
            <div style={{
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
            }}></div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <h2>Esperant oponent...</h2>
            <p>Comparteix el nom de la sala amb un amic!</p>
        </div>
    );
};

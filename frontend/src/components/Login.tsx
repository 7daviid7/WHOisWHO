import React, { useState } from 'react';

interface Props {
    onLogin: (username: string) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#2c3e50',
            color: 'white',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Who is who?</h1>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: '#34495e',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <label style={{ fontSize: '1.2rem' }}>Introdueix el teu nom:</label>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{
                        padding: '10px',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: 'none',
                        width: '250px'
                    }}
                    placeholder="Nom d'usuari"
                />
                <button type="submit" style={{
                    padding: '10px',
                    fontSize: '1.1rem',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>
                    Començar a jugar
                </button>
            </form>
        </div>
    );
};

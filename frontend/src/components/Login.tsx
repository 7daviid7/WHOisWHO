import React, { useState } from 'react';

interface Props {
    onLogin: (username: string) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username.trim() || !password) {
            setError('Introdueix nom i contrasenya');
            return;
        }

        const url = mode === 'login' ? '/api/login' : '/api/register';
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.trim(), password })
        }).then(async res => {
            const data = await res.json();
            if (!res.ok) {
                // Map server status to clearer Catalan messages
                if (res.status === 401) {
                    setError('Usuari no existeix o contrasenya incorrecta');
                } else if (res.status === 409) {
                    setError("L'usuari ja existeix");
                } else if (res.status === 400) {
                    setError(data.error || 'Falten camps');
                } else {
                    setError(data.error || 'Error al servidor');
                }
                return;
            }

            if (mode === 'register') {
                // successful registration -> inform user and switch to login
                setError(null);
                alert('Registre correcte. Ara pots iniciar sessió.');
                setMode('login');
                setPassword('');
                return;
            }

            // successful login
            onLogin(username.trim());
        }).catch(err => {
            console.error(err);
            setError('No s&#39;ha pogut contactar el servidor');
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
            color: 'white',
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '3rem',
                animation: 'fadeInDown 1s ease'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎮</div>
                <h1 style={{ 
                    fontSize: '4rem', 
                    margin: '0',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                    fontWeight: 'bold'
                }}>
                    Who is Who?
                </h1>
                <p style={{ 
                    fontSize: '1.3rem', 
                    color: '#ecf0f1',
                    marginTop: '10px'
                }}>
                    El joc d'endevinar personatges
                </p>
            </div>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                border: '4px solid #FFD700',
                minWidth: '350px',
                animation: 'fadeInUp 1s ease'
            }}>
                <label style={{ 
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}>
                    {mode === 'login' ? '👤 Inicia sessió' : '📝 Registre d\'usuari'}
                </label>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{
                        padding: '15px 20px',
                        fontSize: '1.2rem',
                        borderRadius: '10px',
                        border: '3px solid #2c3e50',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}
                    placeholder="El teu nom..."
                    autoFocus
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contrasenya..."
                    style={{
                        padding: '12px 16px',
                        fontSize: '1.1rem',
                        borderRadius: '8px',
                        border: '3px solid #2c3e50',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}
                />
                {error && (
                    <div style={{ color: '#ffdddd', background: 'rgba(192,57,43,0.9)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>{error}</div>
                )}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ padding: '8px 10px', borderRadius: '6px', border: '2px solid #1e8449', background: '#ecf0f1', cursor: 'pointer' }}>
                        {mode === 'login' ? 'Vull registrar-me' : 'Tornar al login'}
                    </button>
                    <div style={{ color: '#ecf0f1', fontSize: '0.9rem' }}>
                        {mode === 'login' ? 'Encara no tens compte?' : 'Ja tens compte?'}
                    </div>
                </div>
                <button type="submit" style={{
                    padding: '15px 30px',
                    fontSize: '1.3rem',
                    background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                    color: 'white',
                    border: '3px solid #1e8449',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                    transform: 'scale(1)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
                }}
                >
                    {mode === 'login' ? '🚀 Iniciar sessió' : '✅ Registrar'}
                </button>
            </form>
            <div style={{
                marginTop: '2rem',
                color: '#95a5a6',
                fontSize: '0.9rem',
                textAlign: 'center'
            }}>
                <p>Classica experiència del joc de taula</p>
            </div>
        </div>
    );
};

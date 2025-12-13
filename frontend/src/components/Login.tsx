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
                setError(null);
                alert('Registre correcte. Ara pots iniciar sessió.');
                setMode('login');
                setPassword('');
                return;
            }

            onLogin(username.trim());
        }).catch(err => {
            console.error(err);
            setError('No s\'ha pogut contactar el servidor');
        });
    };

    return (
        <div className="lobby-v2" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Hero Section */}
            <div className="hero-content" style={{ textAlign: 'center', marginBottom: '30px', animation: 'fadeInDown 0.6s ease' }}>
                <div className="gem-spin" style={{ fontSize: '4rem', marginBottom: '10px' }}>
                    🎮
                </div>
                <h1 className="hero-title" style={{ fontSize: '3.5rem', justifyContent: 'center' }}>
                    Who is Who?
                </h1>
                <p className="hero-sub">
                    El joc clàssic d'estratègia i deducció
                </p>
            </div>

            {/* Login Card */}
            <div className="card" style={{ 
                maxWidth: '450px', 
                width: '100%', 
                animation: 'fadeInUp 0.6s ease',
                border: '1px solid var(--primary-gold-dark)'
            }}>
                <div className="card-head" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h2 className="card-title">
                        {mode === 'login' ? 'Benvingut de nou' : 'Crear compte'}
                    </h2>
                    <p className="muted">
                        {mode === 'login' ? 'Introdueix les teves credencials per jugar' : 'Registra\'t per guardar les teves estadístiques'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="room-config-form">
                    <div>
                        <label className="field-label">Nom d'usuari</label>
                        <input 
                            className="input"
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="El teu nom..."
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="field-label">Contrasenya</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{ 
                            color: '#ff6b6b', 
                            background: 'rgba(192, 57, 43, 0.2)', 
                            padding: '10px', 
                            borderRadius: '8px', 
                            fontSize: '0.9rem',
                            border: '1px solid rgba(192, 57, 43, 0.4)',
                            textAlign: 'center'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Botons reordenats */}
                    <div className="form-actions" style={{ flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                        
                        {/* 1. Botó "Crear compte" (petit i a sobre) */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button 
                                type="button" 
                                className="btn btn-ghost"
                                onClick={() => {
                                    setMode(mode === 'login' ? 'register' : 'login');
                                    setError(null);
                                }}
                                style={{ 
                                    padding: '6px 12px', 
                                    fontSize: '0.85rem', 
                                    border: 'none', 
                                    color: 'var(--ui-subtext)',
                                    background: 'transparent',
                                    fontWeight: 'normal',
                                    textDecoration: 'underline',
                                    opacity: 0.8
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                            >
                                {mode === 'login' ? 'Encara no tens compte? Crea\'n un aquí' : 'Ja tens compte? Torna al login'}
                            </button>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}>
                            {mode === 'login' ? 'Iniciar Sessió' : 'Registrar-se'}
                        </button>

                    </div>
                </form>
            </div>
            
            <div className="decor-blobs">
                <div className="blob b1"></div>
                <div className="blob b2"></div>
            </div>
        </div>
    );
};
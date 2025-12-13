import React, { useState } from 'react';
import { api } from '../services/api';

interface ProfileProps {
    username: string;
    onUpdateUsername: (newUsername: string) => void;
}

export default function Profile({ username, onUpdateUsername }: ProfileProps) {
    const [formData, setFormData] = useState({
        newUsername: username,
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setMessage({ text: "Les contrasenyes no coincideixen", type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const res = await api.updateProfile({
                currentUsername: username,
                newUsername: formData.newUsername,
                newPassword: formData.newPassword || undefined
            });

            if (res.user) {
                setMessage({ text: "Perfil actualitzat correctament!", type: 'success' });
                if (res.user.username !== username) {
                    onUpdateUsername(res.user.username);
                }
                setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            } else {
                setMessage({ text: res.message || "Sense canvis", type: 'success' });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Error actualitzant perfil", type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Editar Perfil</h1>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {message && (
                    <div style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#34495e' }}>Nom d'usuari</label>
                        <input
                            type="text"
                            value={formData.newUsername}
                            onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#34495e' }}>Nova Contrasenya (Opcional)</label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="Deixa en blanc per mantenir l'actual"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#34495e' }}>Confirmar Nova Contrasenya</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'Guardant...' : 'Guardar Canvis'}
                    </button>
                </form>
            </div>
        </div>
    );
}

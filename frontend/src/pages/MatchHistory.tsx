import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface MatchLog {
    id: number;
    userId: number;
    opponentName: string;
    result: 'WIN' | 'LOSS' | 'DRAW';
    turns: number;
    mode: string;
    createdAt: string;
}

interface MatchHistoryProps {
    username: string;
}

export default function MatchHistory({ username }: MatchHistoryProps) {
    const [matches, setMatches] = useState<MatchLog[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMatches();
    }, [username, page]);

    const loadMatches = async () => {
        setLoading(true);
        try {
            const data = await api.getMatchHistory(username, page, 10);
            setMatches(data.matches);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '2rem' }}>Registre de Partides</h1>

            {loading && matches.length === 0 ? (
                <div>Carregant...</div>
            ) : matches.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#95a5a6', marginTop: '50px' }}>
                    <p>Encara no has jugat cap partida.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {matches.map(match => (
                        <div key={match.id} style={{
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: `6px solid ${match.result === 'WIN' ? '#2ecc71' : '#e74c3c'}`
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50', marginBottom: '4px' }}>
                                    vs {match.opponentName}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                                    {new Date(match.createdAt).toLocaleString()} • {match.mode}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontWeight: '900',
                                    fontSize: '1.2rem',
                                    color: match.result === 'WIN' ? '#2ecc71' : '#e74c3c'
                                }}>
                                    {match.result === 'WIN' ? 'VICTÒRIA' : 'DERROTA'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                                    {match.turns > 0 ? `${match.turns} torns` : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Anterior
                    </button>
                    <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>{page} / {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        Següent
                    </button>
                </div>
            )}
        </div>
    );
}

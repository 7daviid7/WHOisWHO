import React, { useEffect, useRef } from 'react';

interface Props {
    logs: string[];
}

export const GameLog: React.FC<Props> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll cap avall quan arriba un missatge
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getLogStyle = (text: string) => {
        if (text.includes('Has preguntat') || text.includes('preguntar')) return { icon: '🗣️', color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)' };
        if (text.includes('Resposta: SÍ') || text.includes('SÍ')) return { icon: '✅', color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.1)' };
        if (text.includes('Resposta: NO') || text.includes('NO')) return { icon: '❌', color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.1)' };
        if (text.includes('torn')) return { icon: '⏰', color: '#f39c12', bg: 'rgba(243, 156, 18, 0.1)' };
        if (text.includes('vides') || text.includes('perdut')) return { icon: '💔', color: '#c0392b', bg: 'rgba(192, 57, 43, 0.1)' };
        if (text.includes('Partida Començada') || text.includes('Guanyat')) return { icon: '🎮', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.1)' };
        return { icon: 'ℹ️', color: '#95a5a6', bg: 'rgba(255, 255, 255, 0.05)' };
    };

    return (
        <div className="card" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '12px',
            border: '1px solid var(--primary-gold-dark)',
            minHeight: 0 // Crucial per al flexbox
        }}>
            <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: 'bold', 
                color: 'var(--primary-gold)', 
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>📜 Registre de Batalla</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{logs.length} events</span>
            </div>

            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                paddingRight: '4px' 
            }}>
                {logs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--ui-subtext)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 'auto', marginBottom: 'auto' }}>
                        La partida està a punt de començar... ⚔️
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const style = getLogStyle(log);
                        return (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                background: style.bg,
                                padding: '8px 10px',
                                borderRadius: '8px',
                                borderLeft: `3px solid ${style.color}`,
                                fontSize: '0.85rem',
                                color: '#ecf0f1',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{style.icon}</span>
                                <span style={{ lineHeight: 1.4 }}>{log}</span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
import React from 'react';

interface Props {
    onClose: () => void;
}

export const RulesModal: React.FC<Props> = ({ onClose }) => {
    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)', zIndex: 3000 }}>
            <div className="card" style={{ 
                maxWidth: '600px', 
                width: '100%', 
                maxHeight: '90vh',
                overflowY: 'auto',
                animation: 'modalZoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid var(--primary-gold-dark)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                padding: '0'
            }}>
                {/* Header */}
                <div style={{ 
                    padding: '24px', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 100%)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📖 Com es juga?
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--ui-subtext)', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Objectiu */}
                    <section>
                        <h3 style={{ color: '#ecf0f1', fontSize: '1.2rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🎯 Objectiu del Joc
                        </h3>
                        <p style={{ color: 'var(--ui-subtext)', lineHeight: '1.6', margin: 0 }}>
                            Has de descobrir quin és el <strong>Personatge Secret</strong> del teu rival abans que ell descobreixi el teu. Fes preguntes intel·ligents per descartar opcions!
                        </p>
                    </section>

                    {/* Mecànica */}
                    <section style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px' }}>
                        <h3 style={{ color: '#ecf0f1', fontSize: '1.1rem', marginBottom: '12px', marginTop: 0 }}>
                            ⚔️ Durant el teu torn pots:
                        </h3>
                        <ul style={{ paddingLeft: '20px', color: 'var(--ui-subtext)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>
                                <strong>Fer una Pregunta:</strong> Demana sobre trets físics (Ex: <em>"Té barret?"</em>). Si la resposta és "SÍ", elimina els que no en tinguin.
                            </li>
                            <li>
                                <strong>Intentar Endevinar:</strong> Arrisca't a dir un nom concret. Però vés amb compte!
                            </li>
                        </ul>
                    </section>

                    {/* Modes de Joc */}
                    <section>
                        <h3 style={{ color: '#ecf0f1', fontSize: '1.2rem', marginBottom: '16px' }}>
                            💀 Modes de Joc
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ 
                                border: '1px solid rgba(231, 76, 60, 0.3)', 
                                background: 'rgba(231, 76, 60, 0.05)', 
                                padding: '16px', 
                                borderRadius: '10px' 
                            }}>
                                <div style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '6px' }}>⚡ HARDCORE</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--ui-subtext)' }}>
                                    Només per a experts. Si falles al intentar endevinar el personatge, <strong>perds immediatament</strong>.
                                </div>
                            </div>
                            <div style={{ 
                                border: '1px solid rgba(46, 204, 113, 0.3)', 
                                background: 'rgba(46, 204, 113, 0.05)', 
                                padding: '16px', 
                                borderRadius: '10px' 
                            }}>
                                <div style={{ color: '#2ecc71', fontWeight: 'bold', marginBottom: '6px' }}>❤️ VIDES (x2)</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--ui-subtext)' }}>
                                    Tens una segona oportunitat. Pots fallar un cop, però al segon error perds la partida.
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div style={{ 
                    padding: '20px 24px', 
                    borderTop: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={onClose}
                        style={{ padding: '10px 24px' }}
                    >
                        Entesos, a jugar!
                    </button>
                </div>
            </div>
        </div>
    );
};
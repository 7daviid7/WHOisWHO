import React from 'react';

export const WaitingScreen: React.FC = () => {
    return (
        <div className="lobby-v2" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Main Waiting Card */}
            <div className="card" style={{
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                padding: '40px 30px',
                animation: 'modalZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid var(--primary-gold-dark)',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 10
            }}>
                {/* Animated Background Glow inside card */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
                    animation: 'pulse 3s infinite',
                    pointerEvents: 'none'
                }}></div>

                {/* Animated Icon */}
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '20px',
                    position: 'relative',
                    display: 'inline-block'
                }}>
                    <div style={{ 
                        animation: 'float 3s ease-in-out infinite',
                        filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))'
                    }}>
                        ⏳
                    </div>
                    {/* Ripple effects */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: '100%',
                        border: '2px solid var(--primary-gold)',
                        borderRadius: '50%',
                        opacity: 0,
                        animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }}></div>
                </div>

                <h2 className="hero-title" style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
                    Esperant Rival...
                </h2>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    marginBottom: '30px'
                }}>
                    <span style={{ color: 'var(--ui-text)', fontSize: '1.1rem' }}>La sala està oberta</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '24px', paddingBottom: '4px' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--primary-gold)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></div>
                        <div style={{ width: '6px', height: '6px', background: 'var(--primary-gold)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></div>
                        <div style={{ width: '6px', height: '6px', background: 'var(--primary-gold)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                    </div>
                </div>

                {/* Instructions Box */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginTop: '10px'
                }}>
                    <p style={{ color: 'var(--ui-subtext)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Comparteix el <strong>nom de la sala</strong> amb el teu amic perquè s'uneixi a la partida.
                    </p>
                </div>
            </div>

            {/* Tip Text */}
            <div style={{ 
                marginTop: '24px', 
                color: 'var(--ui-subtext)', 
                fontSize: '0.9rem', 
                textAlign: 'center',
                animation: 'fadeIn 1s ease-out 0.5s both'
            }}>
                <span style={{ opacity: 0.6 }}>Consell:</span> Prepara la teva estratègia mentre esperes
            </div>

            {/* Background Blobs for Atmosphere */}
            <div className="decor-blobs">
                <div className="blob b1"></div>
                <div className="blob b3"></div>
            </div>

            <style>{`
                @keyframes ping {
                    75%, 100% {
                        transform: translate(-50%, -50%) scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};
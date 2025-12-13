import React, { useState } from 'react';
import { Character } from '../types';

interface Props {
    character: Character;
    eliminated: boolean;
    onClick: () => void;
    compact?: boolean;
}

export const CharacterCard: React.FC<Props> = ({ character, eliminated, onClick, compact = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Mida dinàmica segons si és compacte o no
    const width = compact ? '110px' : '150px';
    const height = compact ? '150px' : '200px';

    return (
        <div 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width,
                height,
                perspective: '1000px',
                cursor: 'pointer',
                position: 'relative'
            }}
        >
            <div style={{
                width: '100%',
                height: '100%',
                transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                transformStyle: 'preserve-3d',
                transform: eliminated ? 'rotateY(180deg)' : 'rotateY(0deg)',
                position: 'relative',
                boxShadow: isHovered && !eliminated ? '0 15px 35px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.3)',
                borderRadius: '12px',
            }}>
                
                {/* --- CARA FRONTAL (Personatge) --- */}
                <div className="card-face card-front" style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #1e2a3a 0%, #111827 100%)',
                    borderRadius: '12px',
                    border: isHovered ? '2px solid var(--primary-gold)' : '2px solid rgba(255,255,255,0.1)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    overflow: 'hidden'
                }}>
                    {/* Marc de la imatge */}
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: '#000'
                    }}>
                        <img 
                            src={character.image} 
                            alt={character.name} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease',
                                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                            }} 
                        />
                        {/* Brillantor sobre la imatge */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.6) 100%)'
                        }} />
                    </div>

                    {/* Nom del personatge */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '6px',
                        padding: '4px 2px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{
                            fontSize: compact ? '0.7rem' : '0.8rem',
                            fontWeight: 800,
                            color: isHovered ? 'var(--primary-gold)' : '#ecf0f1',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {character.name}
                        </div>
                    </div>
                </div>

                {/* --- CARA POSTERIOR (Dors) --- */}
                <div className="card-face card-back" style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #1a253a 0%, #0f172a 100%)',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                }}>
                    {/* Patró decoratiu del dors */}
                    <div style={{
                        width: 'calc(100% - 16px)',
                        height: 'calc(100% - 16px)',
                        border: '1px dashed rgba(255,215,0,0.3)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)'
                    }}>
                        <span style={{
                            fontSize: compact ? '2rem' : '3rem',
                            color: 'rgba(255,255,255,0.1)',
                            fontWeight: 900,
                            userSelect: 'none'
                        }}>
                            ?
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
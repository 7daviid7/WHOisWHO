import React, { useState } from 'react';
import { Character } from '../types';

interface Props {
    character: Character;
    eliminated: boolean;
    onClick: () => void;
    compact?: boolean; // when true, render a smaller version (i.e. for secret card)
}

export const CharacterCard: React.FC<Props> = ({ character, eliminated, onClick, compact = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: compact ? '110px' : '160px',
                height: compact ? '150px' : '210px',
                margin: '0',
                perspective: '1200px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: eliminated ? 0.45 : 1
            }}
        >
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                transform: eliminated ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
                {/* Front Side */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1a252f',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        gap: '6px'
                    }}>
                        <img 
                            src={character.image} 
                            alt={character.name} 
                            style={{ 
                                width: compact ? '80px' : '110px', 
                                height: compact ? '80px' : '110px', 
                                objectFit: 'cover', 
                                borderRadius: compact ? '6px' : '8px',
                                border: compact ? '2px solid rgba(255,255,255,0.08)' : '3px solid #3498db',
                                boxShadow: compact ? '0 2px 6px rgba(0,0,0,0.3)' : '0 4px 12px rgba(52, 152, 219, 0.3)'
                            }} 
                        />
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#ecf0f1',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            padding: '0 4px',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                        }}>
                            {character.name}
                        </div>
                    </div>
                </div>

                {/* Back Side */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #5b7fd9 0%, #4a6bc9 100%)',
                    borderRadius: '10px',
                    padding: '5px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                    transform: 'rotateY(180deg)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(180deg, #6b8fe5 0%, #4a6bc9 100%)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                    }}>
                        <span style={{
                            fontSize: '50px',
                            color: '#ffffff',
                            fontWeight: '900',
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            ?
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

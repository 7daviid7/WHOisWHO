import React, { useState } from 'react';
import { Character } from '../types';

interface Props {
    character: Character;
    eliminated: boolean;
    onClick: () => void;
}

export const CharacterCard: React.FC<Props> = ({ character, eliminated, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: '85px',
                height: '110px',
                margin: '4px',
                perspective: '1000px',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
                transform: isHovered && !eliminated ? 'scale(1.05)' : 'scale(1)',
            }}
        >
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: eliminated ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
                {/* Front Side */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    backgroundColor: '#FFD700',
                    borderRadius: '8px',
                    padding: '4px',
                    boxShadow: eliminated ? 'none' : '0 4px 8px rgba(0,0,0,0.3)',
                    border: '3px solid #DAA520',
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        border: '2px solid #FFA500',
                    }}>
                        <img 
                            src={character.image} 
                            alt={character.name} 
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover', 
                                borderRadius: '50%',
                                border: '2px solid #FFD700',
                                marginBottom: '3px'
                            }} 
                        />
                        <div style={{
                            fontSize: '9px',
                            fontWeight: 'bold',
                            color: '#2c3e50',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            padding: '0 2px'
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
                    backgroundColor: '#FFD700',
                    borderRadius: '8px',
                    padding: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transform: 'rotateY(180deg)',
                    border: '3px solid #DAA520',
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#4a4a4a',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #FFA500',
                    }}>
                        <span style={{
                            fontSize: '45px',
                            color: '#FFD700',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            ?
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

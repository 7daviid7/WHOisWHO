import React from 'react';
import { Character } from '../types';
import { CharacterCard } from './CharacterCard';

interface Props {
    characters: Character[];
    eliminatedIds: number[];
    onToggleEliminate: (id: number) => void;
    secretCharacter?: Character;
    playerColor?: 'red' | 'blue';
}

export const GameBoard: React.FC<Props> = ({ 
    characters, 
    eliminatedIds, 
    onToggleEliminate, 
    secretCharacter,
    playerColor = 'blue'
}) => {
    const boardColor = playerColor === 'red' ? '#e74c3c' : '#3498db';
    const boardColorDark = playerColor === 'red' ? '#c0392b' : '#2980b9';

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            gap: '10px'
        }}>
            {/* Tablero principal - Part superior */}
            <div style={{
                background: `linear-gradient(135deg, ${boardColor} 0%, ${boardColorDark} 100%)`,
                padding: '15px',
                borderRadius: '15px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                border: '4px solid rgba(0,0,0,0.2)',
                position: 'relative',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                minHeight: 0
            }}>
                {/* Board decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#FFD700',
                    padding: '5px 15px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                    border: '2px solid #DAA520',
                    zIndex: 1
                }}>
                    TAULER DE JOC
                </div>

                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '10px',
                    borderRadius: '10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, 93px)',
                    gap: '5px',
                    justifyContent: 'center',
                    alignContent: 'start'
                }}>
                    {characters.map(char => (
                        <CharacterCard 
                            key={char.id} 
                            character={char} 
                            eliminated={eliminatedIds.includes(char.id)} 
                            onClick={() => onToggleEliminate(char.id)} 
                        />
                    ))}
                </div>

                {/* Bottom decoration */}
                <div style={{
                    marginTop: 'auto',
                    paddingTop: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                            width: '30px',
                            height: '4px',
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            borderRadius: '2px'
                        }} />
                    ))}
                </div>
            </div>

            {/* Carta secreta - Part inferior centrada */}
            {secretCharacter && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{ 
                        background: `linear-gradient(135deg, ${boardColor} 0%, ${boardColorDark} 100%)`,
                        padding: '12px 25px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                        border: '4px solid #FFD700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <h3 style={{
                            color: 'white',
                            textAlign: 'center',
                            margin: 0,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}>
                            ⭐ El teu Personatge Secret:
                        </h3>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <CharacterCard 
                                character={secretCharacter} 
                                eliminated={false} 
                                onClick={() => {}} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

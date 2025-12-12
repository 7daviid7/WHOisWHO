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
    // Real gaming table aesthetic
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#1a472a',
            background: 'radial-gradient(circle at 50% 50%, #2d5a3d 0%, #1a2d2a 100%)',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 20px 60px rgba(0,0,0,0.5)'
        }}>
            {/* Gaming Table Surface */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                minHeight: 0,
                gap: '24px',
                overflow: 'auto'
            }}>
                {/* Cards Grid - 3-3-2 layout */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    padding: '20px',
                    alignItems: 'center'
                } as any}>
                    {/* Row 1 - 3 cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '24px',
                        justifyItems: 'center'
                    }}>
                        {characters.slice(0, 3).map((char, index) => (
                            <div key={char.id} style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                filter: eliminatedIds.includes(char.id) ? 'grayscale(100%) opacity(0.5)' : 'none',
                                transition: 'all 0.3s ease',
                                transform: `rotate(${(Math.random() - 0.5) * 3}deg) translateY(${(index % 3) * 8}px)`,
                                transformOrigin: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (!eliminatedIds.includes(char.id)) {
                                    e.currentTarget.style.transform = 'scale(1.12) translateY(-12px) rotate(0deg)';
                                    e.currentTarget.style.filter = 'drop-shadow(0 12px 24px rgba(255,215,0,0.5))';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = `rotate(${(Math.random() - 0.5) * 3}deg) translateY(${(index % 3) * 8}px)`;
                                e.currentTarget.style.filter = eliminatedIds.includes(char.id) ? 'grayscale(100%) opacity(0.5)' : 'none';
                            }}
                            onClick={() => onToggleEliminate(char.id)}
                            >
                                <CharacterCard 
                                    character={char} 
                                    eliminated={eliminatedIds.includes(char.id)} 
                                    onClick={() => {}}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Row 2 - 3 cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '24px',
                        justifyItems: 'center'
                    }}>
                        {characters.slice(3, 6).map((char, index) => (
                            <div key={char.id} style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                filter: eliminatedIds.includes(char.id) ? 'grayscale(100%) opacity(0.5)' : 'none',
                                transition: 'all 0.3s ease',
                                transform: `rotate(${(Math.random() - 0.5) * 3}deg) translateY(${(index % 3) * 8}px)`,
                                transformOrigin: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (!eliminatedIds.includes(char.id)) {
                                    e.currentTarget.style.transform = 'scale(1.12) translateY(-12px) rotate(0deg)';
                                    e.currentTarget.style.filter = 'drop-shadow(0 12px 24px rgba(255,215,0,0.5))';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = `rotate(${(Math.random() - 0.5) * 3}deg) translateY(${(index % 3) * 8}px)`;
                                e.currentTarget.style.filter = eliminatedIds.includes(char.id) ? 'grayscale(100%) opacity(0.5)' : 'none';
                            }}
                            onClick={() => onToggleEliminate(char.id)}
                            >
                                <CharacterCard 
                                    character={char} 
                                    eliminated={eliminatedIds.includes(char.id)} 
                                    onClick={() => {}}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Row 3 - 2 cards centered */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '24px',
                        justifyItems: 'center'
                    }}>
                        {characters.slice(6, 8).map((char, index) => (
                            <div key={char.id} style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                filter: eliminatedIds.includes(char.id) ? 'grayscale(100%) opacity(0.5)' : 'none',
                                transition: 'all 0.3s ease',
                                transform: `rotate(${(Math.random() - 0.5) * 3}deg) translateY(${(index % 3) * 8}px)`,
                                transformOrigin: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (!eliminatedIds.includes(char.id)) {
                                    e.currentTarget.style.transform = 'scale(1.12) translateY(-12px) rotate(0deg)';
                                    e.currentTarget.style.filter = 'drop-shadow(0 12px 24px rgba(255,215,0,0.5))';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = `rotate(${(Math.random() - 0.5) * 3}deg) translateY(${(index % 3) * 8}px)`;
                                e.currentTarget.style.filter = eliminatedIds.includes(char.id) ? 'grayscale(100%) opacity(0.5)' : 'none';
                            }}
                            onClick={() => onToggleEliminate(char.id)}
                            >
                                <CharacterCard 
                                    character={char} 
                                    eliminated={eliminatedIds.includes(char.id)} 
                                    onClick={() => {}}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative felt edge */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.3), rgba(255,215,0,0.2), rgba(0,0,0,0.3))',
                borderRadius: '0 0 20px 20px'
            }} />
        </div>
    );
};

import React from 'react';
import { Character } from '../types';
import { CharacterCard } from './CharacterCard';

interface Props {
    characters: Character[];
    eliminatedIds: number[];
    onToggleEliminate: (id: number) => void;
    secretCharacter?: Character;
}

export const GameBoard: React.FC<Props> = ({ characters, eliminatedIds, onToggleEliminate, secretCharacter }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {secretCharacter && (
                <div style={{ marginBottom: '20px', border: '2px solid gold', padding: '10px' }}>
                    <h3>El teu Personatge Secret</h3>
                    <CharacterCard 
                        character={secretCharacter} 
                        eliminated={false} 
                        onClick={() => {}} 
                    />
                </div>
            )}
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
                {characters.map(char => (
                    <CharacterCard 
                        key={char.id} 
                        character={char} 
                        eliminated={eliminatedIds.includes(char.id)} 
                        onClick={() => onToggleEliminate(char.id)} 
                    />
                ))}
            </div>
        </div>
    );
};

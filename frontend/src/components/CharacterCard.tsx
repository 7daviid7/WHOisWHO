import React from 'react';
import { Character } from '../types';

interface Props {
    character: Character;
    eliminated: boolean;
    onClick: () => void;
}

export const CharacterCard: React.FC<Props> = ({ character, eliminated, onClick }) => {
    return (
        <div 
            onClick={onClick}
            style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                margin: '5px',
                opacity: eliminated ? 0.4 : 1,
                cursor: 'pointer',
                backgroundColor: eliminated ? '#eee' : 'white',
                width: '120px',
                textAlign: 'center'
            }}
        >
            <img 
                src={character.image} 
                alt={character.name} 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} 
            />
            <h3>{character.name}</h3>
            {eliminated && <span style={{color: 'red', fontWeight: 'bold'}}>X</span>}
        </div>
    );
};

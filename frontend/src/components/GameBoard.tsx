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
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            // Canviem el verd clàssic per un blau fosc profund que lliga amb el tema
            background: 'radial-gradient(circle at 50% 30%, #2c3e50 0%, #1a202c 60%, #0f1219 100%)',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.8), 0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative',
            border: '8px solid #1a202c' // Marc de la taula
        }}>
            
            {/* Textura de soroll subtil per donar realisme a la superfície */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none'
            }}></div>

            {/* Gaming Table Surface */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                minHeight: 0,
                gap: '24px',
                overflowY: 'auto', // Permet scroll si la pantalla és molt petita
                position: 'relative',
                zIndex: 10
            }}>
                {/* Cards Grid - Mantinc el layout 3-3-2 però millorat */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '20px',
                    alignItems: 'center',
                    perspective: '1000px'
                }}>
                    {/* Fila 1 */}
                    <div className="card-row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {characters.slice(0, 3).map((char, index) => 
                            <FloatingCard 
                                key={char.id} 
                                char={char} 
                                index={index} 
                                eliminated={eliminatedIds.includes(char.id)} 
                                onToggle={() => onToggleEliminate(char.id)} 
                            />
                        )}
                    </div>

                    {/* Fila 2 */}
                    <div className="card-row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {characters.slice(3, 6).map((char, index) => 
                            <FloatingCard 
                                key={char.id} 
                                char={char} 
                                index={index + 3} 
                                eliminated={eliminatedIds.includes(char.id)} 
                                onToggle={() => onToggleEliminate(char.id)} 
                            />
                        )}
                    </div>

                    {/* Fila 3 */}
                    <div className="card-row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {characters.slice(6, 8).map((char, index) => 
                            <FloatingCard 
                                key={char.id} 
                                char={char} 
                                index={index + 6} 
                                eliminated={eliminatedIds.includes(char.id)} 
                                onToggle={() => onToggleEliminate(char.id)} 
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Vora inferior decorativa */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, rgba(255,215,0,0.1), rgba(255,215,0,0.4), rgba(255,215,0,0.1))',
                borderRadius: '0 0 12px 12px',
                boxShadow: '0 -2px 10px rgba(255,215,0,0.2)'
            }} />
        </div>
    );
};

// Subcomponent per gestionar l'estat i l'animació de cada carta individual
const FloatingCard: React.FC<{ 
    char: Character; 
    index: number; 
    eliminated: boolean; 
    onToggle: () => void; 
}> = ({ char, index, eliminated, onToggle }) => {
    // Rotació aleatòria fixa per a cada carta (perquè no ballin al fer re-render)
    const randomRotation = React.useMemo(() => (Math.random() - 0.5) * 4, []);
    const randomY = React.useMemo(() => (index % 2 === 0 ? 5 : -5), [index]);

    return (
        <div 
            style={{
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: eliminated 
                    ? `scale(0.9) rotate(${randomRotation}deg)` 
                    : `scale(1) rotate(${randomRotation}deg) translateY(${randomY}px)`,
                filter: eliminated ? 'grayscale(100%) opacity(0.6)' : 'none',
                opacity: eliminated ? 0.7 : 1,
                cursor: 'pointer',
                animation: 'fadeInUp 0.6s ease backwards',
                animationDelay: `${index * 80}ms`
            }}
            onMouseEnter={(e) => {
                if (!eliminated) {
                    e.currentTarget.style.transform = 'scale(1.15) translateY(-15px) rotate(0deg)';
                    e.currentTarget.style.zIndex = '100';
                    e.currentTarget.style.filter = 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = eliminated 
                    ? `scale(0.9) rotate(${randomRotation}deg)` 
                    : `scale(1) rotate(${randomRotation}deg) translateY(${randomY}px)`;
                e.currentTarget.style.zIndex = '1';
                e.currentTarget.style.filter = eliminated ? 'grayscale(100%) opacity(0.6)' : 'none';
            }}
            onClick={onToggle}
        >
            <CharacterCard 
                character={char} 
                eliminated={eliminated} 
                onClick={() => {}} 
            />
            
            {/* Creu vermella (overlay) quan està eliminat */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: eliminated ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 20
            }}>
                <div style={{
                    fontSize: '6rem',
                    color: '#c0392b',
                    fontWeight: 'bold',
                    textShadow: '0 0 20px rgba(0,0,0,0.8)',
                    transform: 'rotate(-10deg)',
                    border: '4px solid #c0392b',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    boxShadow: '0 0 15px rgba(192, 57, 43, 0.5)'
                }}>
                    ✕
                </div>
            </div>
        </div>
    );
};
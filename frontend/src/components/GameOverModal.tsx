import React from 'react';
import { Character } from '../types';
import { CharacterCard } from './CharacterCard'; // Assegura't d'importar-ho si vols mostrar la carta bonica

interface Props {
  winner: string;
  isMe: boolean;
  reason: string;
  onRestart: () => void;
  secretCharacter?: Character | null;
}

export const GameOverModal: React.FC<Props> = ({ winner, isMe, reason, onRestart, secretCharacter }) => {
  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
      <div className={`card ${isMe ? 'is-win' : 'is-lose'}`} style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        padding: '32px',
        animation: 'modalZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        border: isMe ? '2px solid var(--success-green)' : '2px solid var(--danger-red)',
        boxShadow: isMe 
            ? '0 0 60px rgba(39, 174, 96, 0.25)' 
            : '0 0 60px rgba(192, 57, 43, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Confetti només si guanyes */}
        {isMe && (
          <div className="confetti-container">
            {Array.from({ length: 20 }).map((_, i) => (
               <span key={i} className={`confetti-piece p${i % 5}`} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></span>
            ))}
          </div>
        )}

        <div className="gameover-header" style={{ marginBottom: '24px' }}>
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '10px',
            animation: isMe ? 'bounce 2s infinite' : 'pulse 3s infinite',
            filter: isMe ? 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' : 'grayscale(0.8)'
          }}>
            {isMe ? '🏆' : '💀'}
          </div>
          
          <h2 style={{ 
            fontSize: '2.8rem', 
            margin: 0, 
            fontWeight: 900,
            background: isMe 
                ? 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' 
                : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {isMe ? 'VICTÒRIA!' : 'DERROTA'}
          </h2>
          <p style={{ color: 'var(--ui-subtext)', fontSize: '1.1rem', marginTop: '8px' }}>
            {reason}
          </p>
        </div>

        <div className="gameover-content" style={{ 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '12px', 
            padding: '20px', 
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            {/* Si tenim el personatge secret del rival, el mostrem */}
            {secretCharacter ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--ui-subtext)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                        El personatge secret del rival era:
                    </span>
                    {/* Reutilitzem la CharacterCard en mode compacte però sense opacitat */}
                    <div style={{ transform: 'scale(1.1)', margin: '10px 0' }}>
                         <CharacterCard 
                            character={secretCharacter} 
                            eliminated={false} 
                            onClick={() => {}} 
                            compact={true} 
                        />
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-gold)' }}>
                        {secretCharacter.name}
                    </div>
                </div>
            ) : (
                <div style={{ fontSize: '1.2rem' }}>
                     Guanyador: <strong style={{ color: 'var(--primary-gold)' }}>{winner}</strong>
                </div>
            )}
        </div>

        <div className="gameover-actions">
          <button 
            className="btn btn-primary" 
            onClick={onRestart}
            style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '1.1rem',
                boxShadow: isMe ? '0 10px 30px rgba(255, 215, 0, 0.3)' : 'none'
            }}
          >
            {isMe ? 'Jugar una altra vegada' : 'Tornar-ho a intentar'}
          </button>
        </div>
      </div>

      <style>{`
        .confetti-container { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .confetti-piece {
            position: absolute;
            width: 10px; height: 16px;
            top: -20px;
            opacity: 0;
            animation: fall 3s linear infinite;
        }
        .p0 { background: var(--primary-gold); left: 10%; }
        .p1 { background: var(--board-blue); left: 30%; }
        .p2 { background: var(--danger-red); left: 50%; }
        .p3 { background: var(--success-green); left: 70%; }
        .p4 { background: #9b59b6; left: 90%; }

        @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
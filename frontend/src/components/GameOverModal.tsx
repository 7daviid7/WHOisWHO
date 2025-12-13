import React from 'react';

interface Props {
  winner: string;
  isMe: boolean;
  reason: string;
  onRestart: () => void;
}

export const GameOverModal: React.FC<Props> = ({ winner, isMe, reason, onRestart }) => {
  return (
    <div className="gameover-overlay">
      <div className={`gameover-card ${isMe ? 'gameover--win' : 'gameover--lose'}`} role="dialog" aria-modal="true">
        <div className="gameover-header">
          <div className="gameover-icon" aria-hidden>
            {isMe ? '🏆' : '😢'}
          </div>
          <h2 className="gameover-title">{isMe ? 'HAS GUANYAT!' : 'HAS PERDUT'}</h2>
        </div>

        <div className="gameover-body">
          <p className="gameover-reason">{reason}</p>
          <p className="gameover-winner">🏅 Guanyador: <strong className="gameover-winner-name">{winner}</strong></p>
        </div>

        <div className="gameover-cta">
          <button className="btn btn-ghost" onClick={onRestart}>Tornar al Menú</button>
        </div>

        <div className="confetti">
          {Array.from({ length: 12 }).map((_, i) => <span key={i} className={`confetti-piece p${i % 6}`}></span>)}
        </div>
      </div>

      <style>{`
        .gameover-overlay {
          position: fixed; inset: 0; display:flex; align-items:center; justify-content:center;
          background: linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.85));
          backdrop-filter: blur(5px); z-index: 2000; padding: 24px;
        }
        .gameover-card {
          position: relative; width: 720px; max-width: 100%; border-radius: 16px; padding: 28px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6); border: 4px solid rgba(255,215,0,0.12);
          background: linear-gradient(135deg, rgba(10,18,32,0.95), rgba(20,32,56,0.95));
          color: #fff; text-align:center; overflow:hidden;
        }
        .gameover--win { border-color: rgba(39,174,96,0.25); }
        .gameover--lose { border-color: rgba(192,57,43,0.18); }
        .gameover-header { display:flex; flex-direction:column; gap:8px; align-items:center; }
        .gameover-icon { font-size: 5.5rem; animation: iconBounce 1s ease infinite; }
        .gameover-title { font-size: 2.4rem; margin: 0; font-weight:900; text-transform:uppercase; letter-spacing:1px; }
        .gameover-body { margin-top: 10px; }
        .gameover-reason { background: rgba(255,255,255,0.04); padding: 12px 16px; border-radius: 10px; color: #f3f6f9; font-size:1.05rem; }
        .gameover-winner { margin-top: 16px; font-size: 1.1rem; }
        .gameover-winner-name { color: #FFD700; }
        .gameover-cta { display:flex; gap:12px; justify-content:center; margin-top:20px; }
        .btn { padding: 12px 22px; border-radius: 10px; font-weight:800; cursor:pointer; border:0; }
        .btn-primary { background: linear-gradient(135deg, #2ecc71, #27ae60); color: #042017; box-shadow: 0 8px 20px rgba(39,174,96,0.18); }
        .btn-ghost { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.08); }

        .confetti { position:absolute; inset:0; pointer-events:none; }
        .confetti-piece { position:absolute; width:10px; height:18px; border-radius:2px; opacity:0.95; transform-origin:center; animation: confettiFall 1600ms linear infinite; }
        .confetti-piece.p0 { left: 8%; top:-10%; background:#f1c40f; animation-delay:0ms; }
        .confetti-piece.p1 { left: 18%; top:-10%; background:#e67e22; animation-delay:120ms; }
        .confetti-piece.p2 { left: 28%; top:-10%; background:#e74c3c; animation-delay:240ms; }
        .confetti-piece.p3 { left: 38%; top:-10%; background:#9b59b6; animation-delay:360ms; }
        .confetti-piece.p4 { left: 52%; top:-10%; background:#3498db; animation-delay:480ms; }
        .confetti-piece.p5 { left: 66%; top:-10%; background:#2ecc71; animation-delay:600ms; }
        .confetti-piece.p6 { left: 74%; top:-10%; background:#f39c12; animation-delay:720ms; }
        .confetti-piece.p7 { left: 84%; top:-10%; background:#16a085; animation-delay:840ms; }
        .confetti-piece.p8 { left: 92%; top:-10%; background:#c0392b; animation-delay:960ms; }
        .confetti-piece.p9 { left: 45%; top:-10%; background:#8e44ad; animation-delay:1080ms; }
        .confetti-piece.p10 { left: 60%; top:-10%; background:#f1c40f; animation-delay:1200ms; }
        .confetti-piece.p11 { left: 30%; top:-10%; background:#2980b9; animation-delay:1320ms; }

        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity:1; }
          70% { opacity:1; }
          100% { transform: translateY(70vh) rotate(360deg) scale(0.9); opacity:0; }
        }
        @keyframes iconBounce { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-16px);} }

        @media (max-width: 640px) {
          .gameover-card { width: 100%; padding: 18px; }
          .gameover-icon { font-size: 4rem; }
          .gameover-title { font-size: 1.6rem; }
          .gameover-cta { flex-direction:column; }
          .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};
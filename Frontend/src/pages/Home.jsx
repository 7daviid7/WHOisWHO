import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="container">
        <div className="hero">
          <h1>🎮 Who is Who</h1>
          <p className="subtitle">Juga al clàssic joc d'endevinar personatges amb els teus amics!</p>
          
          <div className="features">
            <div className="feature-card">
              <span className="icon">🎨</span>
              <h3>Taulers Personalitzats</h3>
              <p>Crea els teus propis taulers amb imatges i atributs personalitzats</p>
            </div>
            
            <div className="feature-card">
              <span className="icon">⚡</span>
              <h3>En Temps Real</h3>
              <p>Juga amb amics amb comunicació instantània via WebSocket</p>
            </div>
            
            <div className="feature-card">
              <span className="icon">🎯</span>
              <h3>Mode Asíncron</h3>
              <p>Juga quan vulguis, les respostes s'esperen al pròxim accés</p>
            </div>
          </div>

          <div className="actions">
            <Link to="/create-board">
              <button className="primary">Crear Tauler</button>
            </Link>
            <Link to="/rooms">
              <button className="secondary">Unir-se a Partida</button>
            </Link>
          </div>
        </div>

        <div className="how-to-play">
          <h2>📖 Com es juga?</h2>
          <ol>
            <li>Dos jugadors es connecten a una sala amb un tauler escollit</li>
            <li>Cada jugador rep un personatge secret assignat</li>
            <li>Els jugadors s'alternen fent preguntes de Sí/No sobre atributs</li>
            <li>Després de cada resposta, elimina les cartes que no compleixen la condició</li>
            <li>Quan creguis saber qui és el personatge secret de l'oponent, fes la teva aposta final</li>
            <li>Si encertes, guanyes! Si falles, perds automàticament</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Home;
